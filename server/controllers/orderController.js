/**
 * orderController.js
 * HTTP layer only — delegates all logic to orderService.
 */
import { catchAsyncErrors } from "../middlewares/catchAsyncMiddleware.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import * as orderService from "../services/orderService.js";

export const placeNewOrder = catchAsyncErrors(async (req, res, next) => {
  if (req.user?.role === "admin")
    return next(new ErrorHandler("Admin users cannot place orders.", 403));

  const {
    full_name, state, city, country, address, pincode, phone, orderedItems,
  } = req.body;

  if (!full_name || !state || !city || !country || !address || !pincode || !phone)
    return next(new ErrorHandler("Please provide complete shipping details.", 400));

  const shippingData = { full_name, state, city, country, address, pincode, phone };
  const { clientSecret, totalPrice } = await orderService.placeOrder(
    req.user.id,
    shippingData,
    orderedItems,
  );

  res.status(200).json({
    success: true,
    message: "Order placed successfully. Please proceed to payment.",
    paymentIntent: clientSecret,
    total_price: totalPrice,
  });
});

export const fetchSingleOrder = catchAsyncErrors(async (req, res) => {
  const order = await orderService.fetchSingleOrder(req.params.orderId);
  res.status(200).json({ success: true, message: "Order fetched.", orders: order });
});

export const fetchMyOrders = catchAsyncErrors(async (req, res) => {
  const myOrders = await orderService.fetchMyOrders(req.user.id);
  res.status(200).json({ success: true, message: "All your orders are fetched.", myOrders });
});

export const fetchAllOrders = catchAsyncErrors(async (req, res) => {
  const orders = await orderService.fetchAllOrders();
  res.status(200).json({ success: true, message: "All orders fetched.", orders });
});

export const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  if (!status) return next(new ErrorHandler("Provide a valid status for order.", 400));

  const updatedOrder = await orderService.updateOrderStatus(
    req.params.orderId,
    status,
  );
  res.status(200).json({ success: true, message: "Order status updated.", updatedOrder });
});

export const deleteOrder = catchAsyncErrors(async (req, res) => {
  const order = await orderService.deleteOrder(req.params.orderId);
  res.status(200).json({ success: true, message: "Order deleted.", order });
});
