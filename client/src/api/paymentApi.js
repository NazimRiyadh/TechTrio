/**
 * paymentApi.js
 * All payment API calls in one place.
 */
import API from "./axios.js";

export const paymentApi = {
  getStripeKey: () =>
    API.get("/api/v1/payment/stripeapikey"),

  createPaymentIntent: (orderId, totalPrice) =>
    API.post("/api/v1/payment/process", { orderId, totalPrice }),
};
