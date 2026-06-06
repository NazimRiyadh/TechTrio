/**
 * webhookController.js
 * Stripe webhook endpoint handler — extracted from app.js.
 */
import { handleWebhookEvent } from "../services/paymentService.js";

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  try {
    await handleWebhookEvent(req.body, sig);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
