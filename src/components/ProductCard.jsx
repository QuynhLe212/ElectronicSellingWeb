import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import StarRating from './StarRating';
import './ProductCard.css';

function formatVND(price) {
    return price.toLocaleString('vi-VN') + '₫';
}

export default function ProductCard({ product, listView = false }) {
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;

    return (
        <div className={`product-card ${listView ? 'product-card--list' : ''}`}>
            <Link to={`/product/${product.id}`} className="product-card__image-wrap">
                {product.badge && (
                    <span className={`product-card__badge badge-${product.badge}`}>
                        {product.badge === 'sale' ? `-${product.discount}%` : 'Mới'}
                    </span>
                )}
                <img src={product.image} alt={product.name} className="product-card__image" loading="lazy" />
                <div className="product-card__actions">
                    <button className="product-card__action-btn" title="Thêm vào yêu thích" onClick={(e) => e.preventDefault()}>
                        <FiHeart size={18} />
                    </button>
                    <button className="product-card__action-btn product-card__action-btn--cart" title="Thêm vào giỏ hàng" onClick={(e) => e.preventDefault()}>
                        <FiShoppingCart size={18} />
                    </button>
                </div>
            </Link>

            <div className="product-card__info">
                <span className="product-card__category">{product.category}</span>
                <Link to={`/product/${product.id}`} className="product-card__title">
                    {product.name}
                </Link>
                <StarRating rating={product.rating} reviewCount={product.reviewCount} size={13} />
                <div className="product-card__price-row">
                    <span className="product-card__price">{formatVND(product.price)}</span>
                    {hasDiscount && (
                        <span className="product-card__original-price">{formatVND(product.originalPrice)}</span>
                    )}
                </div>
                {listView && (
                    <p className="product-card__description">{product.description}</p>
                )}
                {listView && (
                    <button className="btn btn-accent btn-sm product-card__add-btn">
                        <FiShoppingCart size={14} /> Thêm vào giỏ
                    </button>
                )}
            </div>
        </div>
    );
}
