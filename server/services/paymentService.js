/**
 * paymentService.js
 * Business logic for Stripe payment intents and webhook processing.
 * Replaces utils/generatePaymentIntent.js and the inline webhook in app.js.
 */
import Stripe from "stripe";
import db from "../database/db.js";
import * as paymentRepo from "../repositories/paymentRepository.js";
import * as orderRepo from "../repositories/orderRepository.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── Generate Payment Intent ──────────────────────────────────────────────────
/**
 * Generate payment intent function
 */
export const generatePaymentIntent = async (orderId, totalPrice) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Validate order exists
    const { rows } = await client.query(`SELECT id FROM orders WHERE id = $1`, [
      orderId,
    ]);
    if (rows.length === 0) throw new Error("Order not found");

    // Idempotency: return existing intent if already created
    const existing = await paymentRepo.findByOrderId(orderId);
    if (existing) {
      await client.query("COMMIT");
      return {
        success: true,
        clientSecret: existing.payment_intent_client_secret,
      };
    }

    const amountInCents = Math.round(totalPrice * 100);
    const intent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "bdt",
      metadata: { orderId: String(orderId) },
    });

    await paymentRepo.createPayment(
      {
        orderId,
        type: "Online",
        status: "Pending",
        intentId: intent.id,
        clientSecret: intent.client_secret,
      },
      client,
    );

    await client.query("COMMIT");
    return { success: true, clientSecret: intent.client_secret };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Payment Intent Error:", error.message);
    return { success: false, message: "Failed to generate payment intent" };
  } finally {
    client.release();
  }
};

// ── Handle Stripe Webhook ────────────────────────────────────────────────────

export const handleWebhookEvent = async (rawBody, signature) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    if (
      process.env.NODE_ENV === "development" ||
      !process.env.STRIPE_WEBHOOK_SECRET
    ) {
      console.warn(
        "Stripe Webhook verification bypassed/failed:",
        error.message,
      );
      try {
        event = JSON.parse(rawBody.toString());
      } catch (parseErr) {
        throw new Error(`Fallback body parsing failed: ${parseErr.message}`);
      }
    } else {
      throw new Error(
        `Webhook signature verification failed: ${error.message}`,
      );
    }
  }

  if (event.type !== "payment_intent.succeeded") return;

  const paymentIntentId = event.data.object.id;
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const payment = await paymentRepo.findByPaymentIntentId(
      paymentIntentId,
      client,
    );
    if (!payment) throw new Error("Payment record not found");

    // Idempotency guard
    if (payment.payment_status === "Paid") {
      await client.query("COMMIT");
      return;
    }

    const orderId = payment.order_id;

    await paymentRepo.updatePaymentStatus(paymentIntentId, "Paid", client);
    await orderRepo.markAsPaid(orderId, client);

    const items = await orderRepo.findItemsByOrderId(orderId);
    for (const item of items) {
      await orderRepo.reduceStock(item.product_id, item.quantity, client);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Webhook processing error:", error.message);
    throw error;
  } finally {
    client.release();
  }
};
