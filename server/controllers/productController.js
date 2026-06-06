/**
 * productController.js
 * HTTP layer only — delegates all logic to productService.
 */
import { catchAsyncErrors } from "../middlewares/catchAsyncMiddleware.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import * as productService from "../services/productService.js";

export const createProduct = catchAsyncErrors(async (req, res, next) => {
  const { name, description, price, category, stock } = req.body;
  if (!name || !description || !price || !category || !stock)
    return next(new ErrorHandler("Please enter all fields", 400));

  const imageFiles = req.files?.images || null;
  const product = await productService.createProduct(
    { name, description, price, category, stock },
    imageFiles,
    req.user.id,
  );

  res.status(201).json({ success: true, message: "Product created successfully", product });
});

export const fetchAllProducts = catchAsyncErrors(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filters = {
    availability: req.query.availability,
    price: req.query.price,
    category: req.query.category,
    ratings: req.query.ratings,
    search: req.query.search,
    sort: req.query.sort,
  };

  const data = await productService.fetchAllProducts(filters, page, limit);
  res.status(200).json({ success: true, ...data });
});

export const fetchAdminProducts = catchAsyncErrors(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const filters = {
    category: req.query.category,
    search: req.query.search,
    stock: req.query.stock,
  };
  const { products, totalProducts, categories } = await productService.fetchAdminProducts(filters, page, limit);
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    success: true,
    products,
    totalProducts,
    categories,
    pagination: {
      currentPage: page,
      totalPages,
      totalProducts,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

export const updateProduct = catchAsyncErrors(async (req, res, next) => {
  const { name, description, price, category, stock } = req.body;
  if (!name || !description || !price || !category || !stock)
    return next(new ErrorHandler("Please enter all fields", 400));

  const product = await productService.updateProduct(req.params.productId, {
    name,
    description,
    price,
    category,
    stock,
  });
  res.status(200).json({ success: true, message: "Product updated successfully", product });
});

export const deleteProduct = catchAsyncErrors(async (req, res) => {
  const product = await productService.deleteProduct(req.params.productId);
  res.status(200).json({ success: true, message: "Product deleted successfully", product });
});

export const fetchSingleProduct = catchAsyncErrors(async (req, res) => {
  const product = await productService.fetchSingleProduct(req.params.productId);
  res.status(200).json({ success: true, message: "Product fetched successfully.", product });
});

export const postProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment } = req.body;
  if (!rating || !comment)
    return next(new ErrorHandler("Please enter all fields", 400));

  const review = await productService.postReview(
    req.user.id,
    req.params.productId,
    { rating, comment },
  );
  res.status(201).json({ success: true, message: "Review posted successfully", review });
});

export const deleteReview = catchAsyncErrors(async (req, res) => {
  const review = await productService.deleteReview(
    req.user.id,
    req.params.productId,
  );
  res.status(200).json({ success: true, message: "Review deleted successfully", review });
});
