import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiShare2, FiTruck, FiRefreshCw, FiShield, FiCheck, FiMinus, FiPlus, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import { addProductReview, getProductById, getTopRatedProducts } from '../services/productsService';
import { addToCart } from '../services/cartService';
import './ProductDetailPage.css';

const PRODUCT_FALLBACK_IMAGE = 'https://picsum.photos/seed/product-fallback/1200/1200';
const EMPTY_PRODUCT = {
    id: '',
    name: '',
    category: '',
    brand: '',
    price: 0,
    originalPrice: null,
    rating: 0,
    reviewCount: 0,
    description: '',
    shortFeatures: [],
    specs: {},
    colors: [],
    image: PRODUCT_FALLBACK_IMAGE,
    images: [PRODUCT_FALLBACK_IMAGE],
};

const categoryNameMap = {
    smartphones: 'Điện thoại',
    laptops: 'Laptop',
    audio: 'Âm thanh',
    cameras: 'Máy ảnh',
    tablets: 'Máy tính bảng',
    accessories: 'Phụ kiện',
};

function formatVND(price) {
    return price.toLocaleString('vi-VN') + '₫';
}

function withFallbackImage(event) {
    const image = event.currentTarget;
    image.onerror = null;
    image.src = PRODUCT_FALLBACK_IMAGE;
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(EMPTY_PRODUCT);
    const [relatedPool, setRelatedPool] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [cartNotice, setCartNotice] = useState('');
    const [stockWarning, setStockWarning] = useState('');

    const productReviews = useMemo(() => {
        const apiReviews = product?.reviews;
        if (Array.isArray(apiReviews) && apiReviews.length > 0) {
            return apiReviews.map((r, index) => ({
                id: r.id || r._id || index,
                user: r.user?.name || r.userName || 'Khách hàng',
                rating: Number(r.rating || 0),
                date: r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString('vi-VN')
                    : (r.date || new Date().toLocaleDateString('vi-VN')),
                comment: r.comment || '',
            }));
        }

        return [];
    }, [product]);

    useEffect(() => {
        let ignore = false;

        const loadProduct = async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');

                const [productDetail, topRated] = await Promise.all([
                    getProductById(id),
                    getTopRatedProducts(),
                ]);

                if (ignore) return;
                if (productDetail) {
                    setProduct(productDetail);
                }
                if (topRated.length > 0) {
                    setRelatedPool(topRated);
                }
            } catch (error) {
                if (ignore) return;
                setErrorMessage(error.message || 'Không thể tải chi tiết sản phẩm.');
                setProduct(EMPTY_PRODUCT);
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        };

        loadProduct();

        return () => {
            ignore = true;
        };
    }, [id]);

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [isZooming, setIsZooming] = useState(false);

    const imageList = useMemo(() => {
        if (!Array.isArray(product?.images)) {
            return [product?.image || PRODUCT_FALLBACK_IMAGE];
        }

        const normalized = product.images.filter(Boolean);
        if (normalized.length === 0) {
            return [product?.image || PRODUCT_FALLBACK_IMAGE];
        }

        return normalized;
    }, [product]);

    const selectedImageSrc = imageList[selectedImage] || imageList[0] || PRODUCT_FALLBACK_IMAGE;

    // Cross-sell: cùng danh mục, sản phẩm khác, sắp xếp theo đánh giá
    const relatedProducts = useMemo(() => {
        return relatedPool
            .filter((p) => p.category === product.category && p.id !== product.id)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4);
    }, [product, relatedPool]);

    const crossSellProducts = useMemo(() => {
        if (relatedProducts.length >= 4) return relatedProducts;
        const extra = relatedPool
            .filter((p) => p.id !== product.id && !relatedProducts.includes(p))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4 - relatedProducts.length);
        return [...relatedProducts, ...extra];
    }, [product, relatedProducts, relatedPool]);

    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const availableStock = useMemo(() => {
        const parsed = Number(product?.stock);
        if (!Number.isFinite(parsed) || parsed < 0) {
            return null;
        }

        return Math.floor(parsed);
    }, [product?.stock]);
    const isOutOfStock = availableStock === 0;

    const handleZoom = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPos({ x, y });
    };

    const tabs = [
        { id: 'description', label: 'Mô tả' },
        { id: 'specs', label: 'Thông số kỹ thuật' },
        { id: 'reviews', label: `Đánh giá (${productReviews.length})` },
    ];

    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: productReviews.filter((r) => r.rating === star).length,
        pct: productReviews.length > 0 ? (productReviews.filter((r) => r.rating === star).length / productReviews.length) * 100 : 0,
    }));

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!reviewForm.comment.trim()) {
            setReviewMessage({ type: 'error', text: 'Vui lòng nhập nội dung đánh giá.' });
            return;
        }

        try {
            setIsSubmittingReview(true);
            setReviewMessage({ type: '', text: '' });

            await addProductReview(product.id, {
                rating: reviewForm.rating,
                comment: reviewForm.comment,
            });

            const refreshedProduct = await getProductById(product.id);
            if (refreshedProduct) {
                setProduct(refreshedProduct);
            }

            setReviewForm({ rating: 5, comment: '' });
            setReviewMessage({ type: 'success', text: 'Gửi đánh giá thành công.' });
        } catch (error) {
            setReviewMessage({ type: 'error', text: error.message || 'Không thể gửi đánh giá.' });
        } finally {
            setIsSubmittingReview(false);
        }
    };

    useEffect(() => {
        setQuantity(1);
        setStockWarning('');
        setCartNotice('');
    }, [product?.id]);

    const handleDecreaseQuantity = () => {
        setStockWarning('');
        setQuantity((prev) => Math.max(1, prev - 1));
    };

    const handleIncreaseQuantity = () => {
        if (availableStock !== null && quantity >= availableStock) {
            setStockWarning(`Chỉ còn ${availableStock} sản phẩm trong kho.`);
            return;
        }

        setStockWarning('');
        setQuantity((prev) => prev + 1);
    };

    const handleAddToCart = () => {
        if (isOutOfStock) {
            setCartNotice('Sản phẩm hiện đang hết hàng.');
            return;
        }

        if (availableStock !== null && quantity > availableStock) {
            setStockWarning(`Số lượng vượt quá tồn kho. Chỉ còn ${availableStock} sản phẩm.`);
            return;
        }

        addToCart(product, quantity);
        setCartNotice(`Đã thêm ${quantity} sản phẩm vào giỏ hàng.`);
        setStockWarning('');
    };

    const handleBuyNow = () => {
        if (isOutOfStock) {
            setCartNotice('Sản phẩm hiện đang hết hàng.');
            return;
        }

        if (availableStock !== null && quantity > availableStock) {
            setStockWarning(`Số lượng vượt quá tồn kho. Chỉ còn ${availableStock} sản phẩm.`);
            return;
        }

        addToCart(product, quantity);
        navigate('/checkout');
    };

    return (
        <div className="pdp">
            <div className="container">
                {/* Đường dẫn */}
                <nav className="pdp__breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span>/</span>
                    <Link to="/products">Sản phẩm</Link>
                    <span>/</span>
                    <Link to={`/products?category=${product.category}`}>{categoryNameMap[product.category] || product.category}</Link>
                    <span>/</span>
                    <span className="pdp__breadcrumb-current">{product.name}</span>
                </nav>

                {/* Sản phẩm chính */}
                {isLoading && (
                    <div className="pdp__main" style={{ marginBottom: '24px' }}>
                        <p>Đang tải thông tin sản phẩm...</p>
                    </div>
                )}

                {errorMessage && (
                    <div className="pdp__main" style={{ marginBottom: '24px' }}>
                        <p style={{ color: 'var(--danger)' }}>{errorMessage}</p>
                    </div>
                )}

                {!isLoading && !product?.id && (
                    <div className="pdp__main" style={{ marginBottom: '24px' }}>
                        <p>Không tìm thấy thông tin sản phẩm.</p>
                        <Link to="/products" className="btn btn-outline btn-sm" style={{ marginTop: '12px', display: 'inline-flex' }}>
                            Quay lại danh sách sản phẩm
                        </Link>
                    </div>
                )}

                {product?.id && (
                <div className="pdp__main">
                    {/* Bộ sưu tập ảnh */}
                    <div className="pdp__gallery">
                        <div
                            className="pdp__main-image"
                            onClick={() => setLightboxOpen(true)}
                            onMouseEnter={() => setIsZooming(true)}
                            onMouseLeave={() => setIsZooming(false)}
                            onMouseMove={handleZoom}
                        >
                            {product.badge && (
                                <span className={`product-card__badge badge-${product.badge}`}>
                                    {product.badge === 'sale' ? `-${product.discount}%` : 'Mới'}
                                </span>
                            )}
                            <img
                                src={selectedImageSrc}
                                alt={product.name}
                                className={`pdp__image ${isZooming ? 'pdp__image--zooming' : ''}`}
                                onError={withFallbackImage}
                                style={isZooming ? {
                                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                    transform: 'scale(2)',
                                } : {}}
                            />
                            <span className="pdp__zoom-hint">🔍 Nhấn để phóng to</span>
                        </div>
                        <div className="pdp__thumbnails">
                            {imageList.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={`pdp__thumb ${selectedImage === idx ? 'pdp__thumb--active' : ''}`}
                                    onClick={() => setSelectedImage(idx)}
                                >
                                    <img src={img || PRODUCT_FALLBACK_IMAGE} alt={`${product.name} góc nhìn ${idx + 1}`} onError={withFallbackImage} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Thông tin */}
                    <div className="pdp__info">
                        <span className="pdp__category">{categoryNameMap[product.category] || product.category}</span>
                        <h1 className="pdp__title">{product.name}</h1>

                        <div className="pdp__rating-row">
                            <StarRating rating={product.rating} showNumber reviewCount={product.reviewCount} size={16} />
                        </div>

                        <div className="pdp__price-row">
                            <span className="pdp__price">{formatVND(product.price)}</span>
                            {hasDiscount && (
                                <>
                                    <span className="pdp__original-price">{formatVND(product.originalPrice)}</span>
                                    <span className="pdp__discount-badge">Tiết kiệm {formatVND(product.originalPrice - product.price)}</span>
                                </>
                            )}
                        </div>

                        <p className="pdp__description">{product.description}</p>

                        {/* Tính năng */}
                        <ul className="pdp__features">
                            {product.shortFeatures.map((f, i) => (
                                <li key={i}><FiCheck size={16} color="var(--success)" /> {f}</li>
                            ))}
                        </ul>

                        {/* Chọn màu */}
                        {product.colors.length > 1 && (
                            <div className="pdp__option">
                                <label className="pdp__option-label">Màu sắc:</label>
                                <div className="pdp__colors">
                                    {product.colors.map((color, idx) => (
                                        <button
                                            key={idx}
                                            className={`pdp__color-btn ${selectedColor === idx ? 'pdp__color-btn--active' : ''}`}
                                            style={{ background: color }}
                                            onClick={() => setSelectedColor(idx)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Số lượng */}
                        <div className="pdp__option">
                            <label className="pdp__option-label">Số lượng:</label>
                            <div className="pdp__quantity">
                                <button onClick={handleDecreaseQuantity} disabled={quantity <= 1}><FiMinus /></button>
                                <span>{quantity}</span>
                                <button onClick={handleIncreaseQuantity} disabled={isOutOfStock || (availableStock !== null && quantity >= availableStock)}><FiPlus /></button>
                            </div>
                            {availableStock !== null && !isOutOfStock && (
                                <p className="pdp__stock-note">Còn {availableStock} sản phẩm trong kho</p>
                            )}
                            {isOutOfStock && (
                                <p className="pdp__stock-note pdp__stock-note--danger">Sản phẩm đã hết hàng</p>
                            )}
                            {stockWarning && (
                                <p className="pdp__stock-note pdp__stock-note--danger">{stockWarning}</p>
                            )}
                        </div>

                        {/* Nút CTA */}
                        <div className="pdp__cta-row">
                            <button className="btn btn-accent btn-lg pdp__add-to-cart" onClick={handleAddToCart}>
                                <FiShoppingCart size={20} /> Thêm vào giỏ hàng
                            </button>
                            <button className="btn btn-primary btn-lg pdp__buy-now" onClick={handleBuyNow}>
                                Mua ngay
                            </button>
                        </div>

                        {cartNotice && (
                            <p style={{ marginTop: '10px', color: 'var(--success)', fontWeight: 600 }}>{cartNotice}</p>
                        )}

                        <div className="pdp__secondary-actions">
                            <button className="pdp__secondary-btn"><FiHeart size={16} /> Thêm vào yêu thích</button>
                            <button className="pdp__secondary-btn"><FiShare2 size={16} /> Chia sẻ</button>
                        </div>

                        {/* Cam kết */}
                        <div className="pdp__trust">
                            <div className="pdp__trust-item">
                                <FiTruck size={18} />
                                <div>
                                    <strong>Miễn phí vận chuyển</strong>
                                    <span>Đơn từ 2.000.000₫</span>
                                </div>
                            </div>
                            <div className="pdp__trust-item">
                                <FiRefreshCw size={18} />
                                <div>
                                    <strong>Đổi trả 30 ngày</strong>
                                    <span>Không phiền hà</span>
                                </div>
                            </div>
                            <div className="pdp__trust-item">
                                <FiShield size={18} />
                                <div>
                                    <strong>Bảo hành 2 năm</strong>
                                    <span>Toàn diện</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* Tabs */}
                <div className="pdp__tabs">
                    <div className="pdp__tabs-nav">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`pdp__tab-btn ${activeTab === tab.id ? 'pdp__tab-btn--active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="pdp__tab-content">
                        {activeTab === 'description' && (
                            <div className="pdp__tab-desc">
                                <p>{product.description}</p>
                                <ul className="pdp__desc-features">
                                    {product.shortFeatures.map((f, i) => (
                                        <li key={i}><FiCheck /> {f}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <table className="pdp__specs-table">
                                <tbody>
                                    {Object.entries(product.specs).map(([key, val]) => (
                                        <tr key={key}>
                                            <td className="pdp__spec-key">{key}</td>
                                            <td className="pdp__spec-val">{val}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="pdp__reviews">
                                <div className="pdp__reviews-summary">
                                    <div className="pdp__reviews-avg">
                                        <span className="pdp__reviews-avg-num">{product.rating}</span>
                                        <StarRating rating={product.rating} size={20} />
                                        <span className="pdp__reviews-total">{product.reviewCount.toLocaleString()} đánh giá</span>
                                    </div>
                                    <div className="pdp__reviews-breakdown">
                                        {ratingBreakdown.map((rb) => (
                                            <div key={rb.star} className="pdp__rb-row">
                                                <span>{rb.star}★</span>
                                                <div className="pdp__rb-bar">
                                                    <div className="pdp__rb-fill" style={{ width: `${rb.pct}%` }}></div>
                                                </div>
                                                <span className="pdp__rb-count">{rb.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pdp__reviews-list">
                                    {productReviews.map((rev) => (
                                        <div key={rev.id} className="pdp__review">
                                            <div className="pdp__review-header">
                                                <div className="pdp__review-avatar">{rev.user[0]}</div>
                                                <div>
                                                    <strong>{rev.user}</strong>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <StarRating rating={rev.rating} size={12} />
                                                        <span className="pdp__review-date">{rev.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="pdp__review-text">{rev.comment}</p>
                                        </div>
                                    ))}

                                    <form onSubmit={handleSubmitReview} style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
                                        <h4>Viết đánh giá của bạn</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <label htmlFor="reviewRating">Số sao:</label>
                                            <select
                                                id="reviewRating"
                                                value={reviewForm.rating}
                                                onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                                            >
                                                {[5, 4, 3, 2, 1].map((star) => (
                                                    <option key={star} value={star}>{star} sao</option>
                                                ))}
                                            </select>
                                        </div>
                                        <textarea
                                            placeholder="Chia sẻ trải nghiệm của bạn..."
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                                            rows={4}
                                            style={{ padding: '10px', border: '1px solid var(--gray-300)', borderRadius: '8px' }}
                                        />
                                        {reviewMessage.text && (
                                            <p style={{ color: reviewMessage.type === 'error' ? 'var(--danger)' : 'var(--success)' }}>
                                                {reviewMessage.text}
                                            </p>
                                        )}
                                        <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmittingReview}>
                                            {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gợi ý sản phẩm */}
                <section className="pdp__cross-sell section">
                    <h2 className="section-title">Khách hàng cũng mua</h2>
                    <p className="section-subtitle">Bạn có thể thích những sản phẩm này</p>
                    <div className="products-grid">
                        {crossSellProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="pdp__lightbox" onClick={() => setLightboxOpen(false)}>
                    <button className="pdp__lightbox-close"><FiX size={24} /></button>
                    <button
                        className="pdp__lightbox-nav pdp__lightbox-prev"
                        onClick={(e) => { e.stopPropagation(); setSelectedImage((selectedImage - 1 + imageList.length) % imageList.length); }}
                    >
                        <FiChevronLeft size={28} />
                    </button>
                    <img
                        src={selectedImageSrc}
                        alt={product.name}
                        className="pdp__lightbox-img"
                        onError={withFallbackImage}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        className="pdp__lightbox-nav pdp__lightbox-next"
                        onClick={(e) => { e.stopPropagation(); setSelectedImage((selectedImage + 1) % imageList.length); }}
                    >
                        <FiChevronRight size={28} />
                    </button>
                </div>
            )}
        </div>
    );
}
