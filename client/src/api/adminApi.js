/**
 * adminApi.js
 * All admin API calls in one place.
 */
import API from "./axios.js";

export const adminApi = {
  getDashboardStats: () =>
    API.get("/api/v1/admin/dashboard-stats"),

  getAllUsers: (params) =>
    API.get("/api/v1/admin/get-all-users", { params }),

  deleteUser: (userId) =>
    API.delete(`/api/v1/admin/delete-user/${userId}`),
};
