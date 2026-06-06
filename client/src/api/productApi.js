/**
 * productApi.js
 * All product API calls in one place.
 */
import API from "./axios.js";

export const productApi = {
  getAll: (params) =>
    API.get("/api/v1/product", { params }),

  getSingle: (id) =>
    API.get(`/api/v1/product/singleProduct/${id}`),

  getAdminAll: (params) =>
    API.get("/api/v1/product/admin/all", { params }),

  create: (formData) =>
    API.post("/api/v1/product/admin/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id, data) =>
    API.put(`/api/v1/product/admin/update/${id}`, data),

  delete: (id) =>
    API.delete(`/api/v1/product/admin/delete/${id}`),

  postReview: (productId, data) =>
    API.put(`/api/v1/product/post-new/review/${productId}`, data),

  deleteReview: (productId) =>
    API.delete(`/api/v1/product/delete/review/${productId}`),
};
