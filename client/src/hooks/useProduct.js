/**
 * useProduct.js
 * Single product detail + review actions.
 */
import { useState, useEffect, useCallback } from "react";
import { productApi } from "../api/productApi";

export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await productApi.getSingle(productId);
      setProduct(data.product);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const submitReview = async ({ rating, comment }) => {
    const { data } = await productApi.postReview(productId, { rating, comment });
    await fetchProduct(); // refresh to show updated rating
    return data;
  };

  const removeReview = async () => {
    const { data } = await productApi.deleteReview(productId);
    await fetchProduct();
    return data;
  };

  return { product, loading, error, refetch: fetchProduct, submitReview, removeReview };
};
