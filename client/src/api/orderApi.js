/**
 * orderApi.js
 * All order API calls in one place.
 */
import API from "./axios.js";

export const orderApi = {
  placeOrder: (data) =>
    API.post("/api/v1/order/new", data),

  getMyOrders: () =>
    API.get("/api/v1/order/orders/me"),

  getSingleOrder: (orderId) =>
    API.get(`/api/v1/order/${orderId}`),

  getAllOrders: () =>
    API.get("/api/v1/order/admin/getall"),

  updateStatus: (orderId, status) =>
    API.put(`/api/v1/order/admin/update/${orderId}`, { status }),

  deleteOrder: (orderId) =>
    API.delete(`/api/v1/order/admin/delete/${orderId}`),
};
