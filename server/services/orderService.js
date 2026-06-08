import ErrorHandler from "../middlewares/errorMiddleware.js";
import db from "../database/db.js";
import * as orderRepo from "../repositories/orderRepository.js";
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

/**
 * Pricing calculation function
 */
const calculatePricing = (subtotal) => {
  const taxPrice = Number((subtotal * TAX_RATE).toFixed(2));
  const shippingPrice = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const totalPrice = Number((subtotal + taxPrice + shippingPrice).toFixed(2));

  return { taxPrice, shippingPrice, totalPrice };
};

/**
 * Place order function
 */
export const placeOrder = async (userId, shippingData, rawItems) => {
  const items = Array.isArray(rawItems) ? rawItems : JSON.parse(rawItems);
  if (!items?.length) throw new ErrorHandler("Cart is empty", 400);

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const productIds = items.map((i) => i.product.id);

    // Lock rows to prevent concurrent purchases
    const { rows: products } = await client.query(
      `SELECT id, price, stock, name 
       FROM products 
       WHERE id = ANY($1::uuid[])
       FOR UPDATE`,
      [productIds],
    );

    // O(1) lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(item.product.id);

      if (!product) {
        throw new ErrorHandler(`Product not found: ${item.product.id}`, 404);
      }

      if (item.quantity > product.stock) {
        throw new ErrorHandler(
          `Only ${product.stock} units available for "${product.name}"`,
          400,
        );
      }

      // Atomic stock reduction
      await client.query(
        `UPDATE products 
         SET stock = stock - $1 
         WHERE id = $2`,
        [item.quantity, product.id],
      );

      subtotal += product.price * item.quantity;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        title: product.name,
        image: item.product.images?.[0]?.url || "",
      });
    }

    const { taxPrice, shippingPrice, totalPrice } = calculatePricing(subtotal);

    // Create order
    const order = await orderRepo.createOrder(
      {
        buyerId: userId,
        totalPrice,
        taxPrice,
        shippingPrice,
        status: "CREATED",
      },
      client,
    );

    await orderRepo.createOrderItems(order.id, orderItems, client);
    await orderRepo.createShippingInfo(order.id, shippingData, client);

    await client.query("COMMIT");

    // External call AFTER commit
    const payment = await generatePaymentIntent(order.id, totalPrice);

    if (!payment.success) {
      throw new ErrorHandler("Payment initialization failed", 500);
    }

    return {
      orderId: order.id,
      clientSecret: payment.clientSecret,
      totalPrice,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * FETCH APIs
 */
export const fetchSingleOrder = async (orderId) => {
  const order = await orderRepo.findById(orderId);
  if (!order) throw new ErrorHandler("Order not found", 404);
  return order;
};

export const fetchMyOrders = async (userId) => {
  return orderRepo.findByBuyerId(userId);
};

export const fetchAllOrders = async () => {
  return orderRepo.findAllPaid();
};

/**
 * ORDER STATUS UPDATE (clean state transition)
 */
export const updateOrderStatus = async (orderId, status) => {
  const order = await orderRepo.findByIdWithBuyer(orderId);
  if (!order) throw new ErrorHandler("Order not found", 404);

  const updated = await orderRepo.updateStatus(orderId, status);

  // Async email (non-blocking)
  const emailTemplates = {
    Shipped: generateOrderShippedTemplate,
    Delivered: generateOrderDeliveredTemplate,
    Cancelled: generateOrderCancelledTemplate,
  };

  const templateFn = emailTemplates[status];

  if (templateFn) {
    sendEmail({
      email: order.email,
      subject: `TechTrio — Order ${status}`,
      html: templateFn(order.name, orderId),
    }).catch((err) => console.error(`Failed to send ${status} email:`, err));
  }

  return updated;
};

/**
 * DELETE ORDER
 */
export const deleteOrder = async (orderId) => {
  const deleted = await orderRepo.deleteOrder(orderId);
  if (!deleted) throw new ErrorHandler("Order not found", 404);
  return deleted;
};
