import { Link } from "react-router-dom";
import { FiStar, FiShoppingCart } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const img = product.images?.[0]?.url || product.images?.[0]?.public_id;
  const isNew = new Date(product.created_at) > new Date(Date.now() - 30 * 86400000);

  return (
    <div className="card card-product product-card">
      <Link to={`/product/${product.id}`} className="product-card-img-wrap">
        {img ? <img src={img} alt={product.name} className="product-card-img" /> : (
          <div className="product-card-placeholder">No Image</div>
        )}
        {isNew && <span className="badge badge-ink product-new-badge">New</span>}
        {product.stock === 0 && <span className="badge badge-sale product-oos-badge">Sold Out</span>}
      </Link>
      <div className="product-card-body">
        <p className="caption-md text-graphite truncate">{product.category}</p>
        <Link to={`/product/${product.id}`} className="product-card-title display-xs">{product.name}</Link>
        <div className="product-card-rating flex gap-xs">
          <div className="stars flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <FiStar key={s} size={14} fill={s <= Math.round(product.ratings || 0) ? "#f4a623" : "none"} color={s <= Math.round(product.ratings || 0) ? "#f4a623" : "#c2c2c2"} />
            ))}
          </div>
          <span className="caption-sm text-graphite">({product.review_count || 0})</span>
        </div>
        <div className="product-card-footer flex-between">
          <span className="price-md">৳{Number(product.price).toLocaleString("en-BD")}</span>
          <button
            className="btn btn-primary btn-sm product-card-btn"
            disabled={product.stock === 0}
            onClick={() => { addItem(product); showToast("Added to cart!"); }}
          >
            <FiShoppingCart size={14} />
            <span className="add-text-desktop">Add</span>
            <span className="add-text-mobile">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
