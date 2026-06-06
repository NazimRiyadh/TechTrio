/**
 * productService.js
 * Business logic for products and reviews.
 * No SQL — delegates to repositories.
 */
import { v2 as cloudinary } from "cloudinary";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import * as productRepo from "../repositories/productRepository.js";
import * as reviewRepo from "../repositories/reviewRepository.js";

// ── Products ─────────────────────────────────────────────────────────────────

export const createProduct = async (
  { name, description, price, category, stock },
  imageFiles,
  userId,
) => {
  let images = [];

  if (imageFiles) {
    const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "products",
        width: 1000,
        crop: "scale",
      });
      images.push({ public_id: result.public_id, url: result.secure_url });
    }
  }

  return await productRepo.createProduct({
    name,
    description,
    price,
    category,
    stock,
    images,
    createdBy: userId,
  });
};

export const fetchAllProducts = async (filters, page, limit) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;

  const { availability, price, category, ratings, search, sort } = filters;

  const conditions = [];
  const values = [];
  let idx = 1;

  if (availability === "in-stock") conditions.push(`stock > 5`);
  else if (availability === "limited") conditions.push(`stock > 0 AND stock <= 5`);
  else if (availability === "out-of-stock") conditions.push(`stock = 0`);

  if (price) {
    const [min, max] = price.split("-");
    if (min && max) {
      conditions.push(`price BETWEEN $${idx} AND $${idx + 1}`);
      values.push(min, max);
      idx += 2;
    }
  }

  if (category) {
    conditions.push(`category ILIKE $${idx}`);
    values.push(category);
    idx++;
  }

  if (ratings) {
    conditions.push(`ratings >= $${idx}`);
    values.push(ratings);
    idx++;
  }

  if (search) {
    conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }

  const [totalProducts, products, newProducts, topRatedProducts] =
    await Promise.all([
      productRepo.countWithFilters(conditions, values),
      productRepo.findAllWithFilters(conditions, values, safeLimit, offset, sort),
      productRepo.findNewProducts(),
      productRepo.findTopRated(),
    ]);

  return { products, totalProducts, newProducts, topRatedProducts };
};

export const fetchAdminProducts = async ({ category, search, stock }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (category && category !== "All") {
    conditions.push(`category ILIKE $${idx}`);
    values.push(category);
    idx++;
  }

  if (search) {
    conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }

  if (stock === "in") conditions.push(`stock > 5`);
  else if (stock === "low") conditions.push(`stock > 0 AND stock <= 5`);
  else if (stock === "out") conditions.push(`stock = 0`);

  const [products, categories] = await Promise.all([
    productRepo.findAdminWithFilters(conditions, values),
    productRepo.getAllCategories(),
  ]);

  return { products, categories };
};

export const updateProduct = async (id, data) => {
  const existing = await productRepo.findById(id);
  if (!existing) throw new ErrorHandler("Product not found", 404);
  return await productRepo.updateProduct(id, data);
};

export const deleteProduct = async (id) => {
  const product = await productRepo.findById(id);
  if (!product) throw new ErrorHandler("Product not found", 404);

  if (product.images?.length > 0) {
    await Promise.all(
      product.images.map((img) => cloudinary.uploader.destroy(img.public_id)),
    );
  }

  return await productRepo.deleteProduct(id);
};

export const fetchSingleProduct = async (id) => {
  const product = await productRepo.findByIdWithReviews(id);
  if (!product) throw new ErrorHandler(`Product not found with id: ${id}`, 404);
  return product;
};

// ── Reviews ──────────────────────────────────────────────────────────────────

export const postReview = async (userId, productId, { rating, comment }) => {
  const purchased = await reviewRepo.checkPurchased(userId, productId);
  if (!purchased)
    throw new ErrorHandler("You have not purchased this product", 403);

  const review = await reviewRepo.upsertReview(userId, productId, rating, comment);
  const avg = await reviewRepo.getAverageRating(productId);
  await productRepo.updateRating(productId, avg);

  return review;
};

export const deleteReview = async (userId, productId) => {
  const review = await reviewRepo.deleteReview(userId, productId);
  if (!review) throw new ErrorHandler("Review not found", 404);

  const avg = await reviewRepo.getAverageRating(productId);
  await productRepo.updateRating(productId, avg);

  return review;
};
