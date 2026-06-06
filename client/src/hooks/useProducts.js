/**
 * useProducts.js
 * Encapsulates loading, error, and pagination state for the public product list.
 * Usage: const { products, totalProducts, loading, error } = useProducts(filters, page, limit);
 */
import { useState, useEffect, useCallback } from "react";
import { productApi } from "../api/productApi";

export const useProducts = (filters = {}, page = 1, limit = 10) => {
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await productApi.getAll({ ...filters, page, limit });
      setProducts(data.products);
      setTotalProducts(data.totalProducts);
      setNewProducts(data.newProducts || []);
      setTopRatedProducts(data.topRatedProducts || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), page, limit]); // eslint-disable-line

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, newProducts, topRatedProducts, totalProducts, loading, error, refetch: fetchProducts };
};
