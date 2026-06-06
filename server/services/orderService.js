/**
 * orderService.js
 * Business logic for placing, fetching, updating, and deleting orders.
 */
import ErrorHandler from "../middlewares/errorMiddleware.js";
import db from "../database/db.js";
import * as orderRepo from "../repositories/orderRepository.js";
import * as productRepo from "../repositories/productRepository.js";
import { generatePaymentIntent } from "./paymentService.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  generateOrderShippedTemplate,
  generateOrderDeliveredTemplate,
  generateOrderCancelledTemplate,
} from "../utils/generateOrderStatusTemplates.js";

const TAX_RATE = 0.18;
const FREE_SHIPPING_THRESHOLD = 2000;
const SHIPPING_COST = 150;

export const placeOrder = async (userId, shippingData, rawItems) => {
  const items = Array.isArray(rawItems) ? rawItems : JSON.parse(rawItems);
  if (!items?.length) throw new ErrorHandler("No items in cart.", 400);

  // Validate all products in a single DB round-trip
  const productIds = items.map((i) => i.product.id);
  const { rows: products } = await db.query(
    `SELECT id, price, stock, name FROM products WHERE id = ANY($1::uuid[])`,
    [productIds],
  );

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.product.id);
    if (!product)
      throw new ErrorHandler(`Product not found: ${item.product.id}`, 404);
    if (item.quantity > product.stock)
      throw new ErrorHandler(
        `Only ${product.stock} units available for "${product.name}"`,
        400,
      );

    subtotal += product.price * item.quantity;
    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      price: product.price,
      image: item.product.images?.[0]?.url || "",
      title: product.name,
    });
  }

  const taxPrice = Number((subtotal * TAX_RATE).toFixed(2));
  const shippingPrice = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const totalPrice = Number((subtotal + taxPrice + shippingPrice).toFixed(2));

  // Persist order, items, and shipping atomically (separate INSERT calls;
  // wrap in a transaction if you want full atomicity here)
  const order = await orderRepo.createOrder({
    buyerId: userId,
    totalPrice,
    taxPrice,
    shippingPrice,
  });

  await orderRepo.createOrderItems(order.id, orderItems);
  await orderRepo.createShippingInfo(order.id, shippingData);

  const payment = await generatePaymentIntent(order.id, totalPrice);
  if (!payment.success) throw new ErrorHandler("Payment setup failed. Try again.", 500);

  return { clientSecret: payment.clientSecret, totalPrice };
};

export const fetchSingleOrder = async (orderId) => {
  const order = await orderRepo.findById(orderId);
  if (!order) throw new ErrorHandler("Order not found", 404);
  return order;
};

export const fetchMyOrders = async (userId) => {
  return await orderRepo.findByBuyerId(userId);
};

export const fetchAllOrders = async () => {
  return await orderRepo.findAllPaid();
};

export const updateOrderStatus = async (orderId, status) => {
  const order = await orderRepo.findByIdWithBuyer(orderId);
  if (!order) throw new ErrorHandler("Order not found", 404);

  // If transitioning to Shipped/Delivered but not paid, automatically mark as paid and reduce stock
  if (
    (status === "Shipped" || status === "Delivered") &&
    !order.paid_at
  ) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      
      // Mark as paid in orders table
      await orderRepo.markAsPaid(orderId, client);
      
      // Reduce product stock
      const items = await orderRepo.findItemsByOrderId(orderId);
      for (const item of items) {
        await orderRepo.reduceStock(item.product_id, item.quantity, client);
      }
      
      // Update payment record status in payments table if it exists
      await client.query(
        `UPDATE payments SET payment_status = 'Paid' WHERE order_id = $1`,
        [orderId]
      );
      
      await client.query("COMMIT");
      order.paid_at = new Date(); // Update local object ref for downstream email template
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Failed to automatically mark order as paid during status update:", err);
      throw new ErrorHandler("Failed to transition order status.", 500);
    } finally {
      client.release();
    }
  }

  const updated = await orderRepo.updateStatus(orderId, status);

  // Fire-and-forget notification email
  const emailTemplates = {
    Shipped: generateOrderShippedTemplate,
    Delivered: generateOrderDeliveredTemplate,
    Cancelled: generateOrderCancelledTemplate,
  };
  const templateFn = emailTemplates[status];
  if (templateFn) {
    sendEmail({
      email: order.email,
      subject: `BigBazar — Order ${status}`,
      html: templateFn(order.name, orderId),
    }).catch((err) => console.error(`Failed to send ${status} email:`, err));
  }

  return updated;
};

export const deleteOrder = async (orderId) => {
  const deleted = await orderRepo.deleteOrder(orderId);
  if (!deleted) throw new ErrorHandler("Order not found", 404);
  return deleted;
};
