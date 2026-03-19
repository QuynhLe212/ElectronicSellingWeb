import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import StarRating from './StarRating';
import { isFavorite, toggleFavorite } from '../services/favoritesService';
import './ProductCard.css';

const PRODUCT_FALLBACK_IMAGE = 'https://picsum.photos/seed/product-fallback/600/600';

function formatVND(price) {
    return price.toLocaleString('vi-VN') + '₫';
}

function withFallbackImage(event) {
    const image = event.currentTarget;
    image.onerror = null;
    image.src = PRODUCT_FALLBACK_IMAGE;
}

export default function ProductCard({ product, listView = false }) {
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        setIsFav(isFavorite(product.id));
    }, [product.id]);

    const handleToggleFavorite = (e) => {
        e.preventDefault();
        toggleFavorite(product.id);
        setIsFav((prev) => !prev);
    };

    const hasDiscount = product.originalPrice && product.originalPrice > product.price;

    return (
        <div className={`product-card ${listView ? 'product-card--list' : ''}`}>
            <Link to={`/product/${product.id}`} className="product-card__image-wrap">
                {product.badge && (
                    <span className={`product-card__badge badge-${product.badge}`}>
                        {product.badge === 'sale' ? `-${product.discount}%` : 'Mới'}
                    </span>
                )}
                <img
                    src={product.image || PRODUCT_FALLBACK_IMAGE}
                    alt={product.name}
                    className="product-card__image"
                    loading="lazy"
                    onError={withFallbackImage}
                />
                <div className="product-card__actions">
                    <button
                        className={`product-card__action-btn ${isFav ? 'product-card__action-btn--active' : ''}`}
                        title={isFav ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                        onClick={handleToggleFavorite}
                    >
                        <FiHeart size={18} fill={isFav ? 'currentColor' : 'none'} />
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
