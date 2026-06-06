import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiStar, FiShoppingCart, FiMinus, FiPlus, FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import API from "../../api/axios";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/api/v1/product/singleProduct/${productId}`);
        setProduct(data.product);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) { addItem(product, qty); showToast("Added to cart!"); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`/api/v1/product/post-new/review/${productId}`, reviewForm);
      showToast("Review posted!");
      const { data } = await API.get(`/api/v1/product/singleProduct/${productId}`);
      setProduct(data.product);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) { showToast(err.response?.data?.message || "Failed to post review", "error"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!product) return <div className="page-loader"><p>Product not found.</p></div>;

  const images = product.images || [];
  const reviews = product.reviews || [];

  return (
    <main className="pdp section">
      <div className="container">
        <Link to="/shop" className="btn btn-text-link" style={{ marginBottom: 24, display: "inline-flex" }}>
          <FiArrowLeft /> Back to Shop
        </Link>

        <div className="pdp-layout">
          {/* Image Gallery */}
          <motion.div className="pdp-gallery" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="pdp-main-img-wrap">
              {images.length > 0 ? (
                <img src={images[activeImg]?.url} alt={product.name} className="pdp-main-img" />
              ) : (
                <div className="pdp-no-img display-lg">🛍️</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="pdp-thumbs flex gap-sm">
                {images.map((img, i) => (
                  <button key={i} className={`pdp-thumb ${i === activeImg ? "pdp-thumb-active" : ""}`} onClick={() => setActiveImg(i)}>
                    <img src={img.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div className="pdp-info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <span className="caption-md text-graphite">{product.category}</span>
            <h1 className="display-lg" style={{ margin: "8px 0 12px" }}>{product.name}</h1>
            <div className="flex gap-sm" style={{ alignItems: "center", marginBottom: 16 }}>
              <div className="stars flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar key={s} size={18} fill={s <= Math.round(product.ratings || 0) ? "#f4a623" : "none"} color={s <= Math.round(product.ratings || 0) ? "#f4a623" : "#c2c2c2"} />
                ))}
              </div>
              <span className="caption-md text-graphite">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
            </div>
            <p className="display-md text-primary" style={{ marginBottom: 20 }}>৳{Number(product.price).toLocaleString("en-BD")}</p>
            <p className="body-md text-charcoal" style={{ marginBottom: 24 }}>{product.description}</p>

            {/* Stock */}
            <div style={{ marginBottom: 20 }}>
              {product.stock > 5 && <span className="badge badge-ink">In Stock</span>}
              {product.stock > 0 && product.stock <= 5 && <span className="badge badge-sale">Only {product.stock} left</span>}
              {product.stock === 0 && <span className="badge badge-sale">Out of Stock</span>}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="pdp-actions flex gap-md">
              <div className="pdp-qty flex">
                <button className="pdp-qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}><FiMinus /></button>
                <span className="pdp-qty-val body-emphasis">{qty}</span>
                <button className="pdp-qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}><FiPlus /></button>
              </div>
              <button className="btn btn-primary" disabled={product.stock === 0} onClick={handleAddToCart}>
                <FiShoppingCart /> Add to Cart
              </button>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <section className="pdp-reviews">
          <h2 className="display-md" style={{ marginBottom: 24 }}>Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div className="pdp-reviews-list">
              {reviews.map((r) => (
                <div key={r.review_id} className="pdp-review-item card" style={{ padding: 20 }}>
                  <div className="flex-between">
                    <div className="flex gap-sm" style={{ alignItems: "center" }}>
                      {r.reviewer?.avatar?.url ? (
                        <img src={r.reviewer.avatar.url} alt="" className="review-avatar" />
                      ) : (
                        <div className="review-avatar-placeholder">{r.reviewer?.name?.[0] || "?"}</div>
                      )}
                      <div>
                        <span className="body-emphasis">{r.reviewer?.name || "User"}</span>
                        <div className="stars flex" style={{ marginTop: 2 }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FiStar key={s} size={12} fill={s <= r.rating ? "#f4a623" : "none"} color={s <= r.rating ? "#f4a623" : "#c2c2c2"} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="caption-sm text-graphite">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="body-md" style={{ marginTop: 10 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="body-md text-graphite">No reviews yet.</p>
          )}

          {/* Write Review Form */}
          {user && (
            <form className="pdp-review-form card" style={{ padding: 24, marginTop: 24 }} onSubmit={handleReview}>
              <h3 className="display-xs" style={{ marginBottom: 16 }}>Write a Review</h3>
              <div style={{ marginBottom: 12 }}>
                <label className="input-label">Rating</label>
                <div className="stars flex gap-xs">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })} style={{ background: "none", padding: 2 }}>
                      <FiStar size={24} fill={s <= reviewForm.rating ? "#f4a623" : "none"} color={s <= reviewForm.rating ? "#f4a623" : "#c2c2c2"} />
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Comment</label>
                <textarea className="input" rows={4} style={{ height: "auto" }} placeholder="Share your experience..."
                  value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Posting..." : "Submit Review"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
};

export default ProductDetailPage;
