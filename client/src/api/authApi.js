/**
 * authApi.js
 * All authentication API calls in one place.
 */
import API from "./axios.js";

export const authApi = {
  me: () =>
    API.get("/api/v1/auth/me"),

  login: (email, password) =>
    API.post("/api/v1/auth/login", { email, password }),

  register: (formData) =>
    API.post("/api/v1/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  logout: () =>
    API.post("/api/v1/auth/logout"),

  forgotPassword: (email) =>
    API.post("/api/v1/auth/forgot", { email }),

  resetPassword: (token, data) =>
    API.put(`/api/v1/auth/reset/${token}`, data),

  updateProfile: (formData) =>
    API.put("/api/v1/auth/update/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updatePassword: (data) =>
    API.put("/api/v1/auth/update/password", data),
};
