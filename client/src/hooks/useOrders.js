/**
 * useOrders.js
 * Fetches current user's orders or admin's all-orders list.
 */
import { useState, useEffect, useCallback } from "react";
import { orderApi } from "../api/orderApi";

/**
 * @param {"my" | "all"} scope  "my" = buyer's orders, "all" = admin view
 */
export const useOrders = (scope = "my") => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = scope === "all"
        ? await orderApi.getAllOrders()
        : await orderApi.getMyOrders();
      setOrders(data.orders ?? data.myOrders ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    await orderApi.updateStatus(orderId, status);
    await fetchOrders();
  };

  const removeOrder = async (orderId) => {
    await orderApi.deleteOrder(orderId);
    await fetchOrders();
  };

  return { orders, loading, error, refetch: fetchOrders, updateStatus, removeOrder };
};
