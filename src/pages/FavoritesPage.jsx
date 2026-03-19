import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { getFavorites, clearAllFavorites, removeFromFavorites } from '../services/favoritesService';
import { getProducts } from '../services/productsService';
import './FavoritesPage.css';

export default function FavoritesPage() {
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');

                const favoriteIds = getFavorites();
                if (favoriteIds.length === 0) {
                    setFavoriteProducts([]);
                    setIsLoading(false);
                    return;
                }

                // Load all products and filter by favorites
                const response = await getProducts({ page: 1, limit: 1000 });
                const products = response.products || [];
                const filtered = products.filter((p) =>
                    favoriteIds.includes(String(p.id))
                );

                setFavoriteProducts(filtered);
            } catch (error) {
                setErrorMessage(error.message || 'Không thể tải danh sách yêu thích.');
            } finally {
                setIsLoading(false);
            }
        };

        loadFavorites();
    }, []);

    const totalPrice = useMemo(() => {
        return favoriteProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    }, [favoriteProducts]);

    const handleRemove = (productId) => {
        removeFromFavorites(productId);
        setFavoriteProducts((prev) => prev.filter((p) => p.id !== productId));
    };

    const handleClearAll = () => {
        if (window.confirm('Xóa tất cả sản phẩm yêu thích?')) {
            clearAllFavorites();
            setFavoriteProducts([]);
        }
    };

    return (
        <div className="favorites-page">
            <div className="container">
                {/* Header */}
                <div className="favorites__header">
                    <Link to="/" className="favorites__back-btn">
                        <FiArrowLeft size={18} /> Quay lại
                    </Link>
                    <h1 className="favorites__title">Danh sách yêu thích</h1>
                    <span className="favorites__count">({favoriteProducts.length} sản phẩm)</span>
                </div>

                {/* Content */}
                {isLoading && (
                    <div className="favorites__loading">
                        <p>Đang tải danh sách yêu thích...</p>
                    </div>
                )}

                {!isLoading && errorMessage && (
                    <div className="favorites__error">
                        <p style={{ color: 'var(--danger)' }}>{errorMessage}</p>
                    </div>
                )}

                {!isLoading && favoriteProducts.length === 0 && !errorMessage && (
                    <div className="favorites__empty">
                        <div className="favorites__empty-icon">❤️</div>
                        <h2>Danh sách yêu thích trống</h2>
                        <p>Bạn chưa thêm sản phẩm nào vào danh sách yêu thích</p>
                        <Link to="/products" className="btn btn-accent btn-lg">
                            Khám phá sản phẩm
                        </Link>
                    </div>
                )}

                {!isLoading && favoriteProducts.length > 0 && (
                    <>
                        {/* Stats */}
                        <div className="favorites__stats">
                            <div className="favorites__stat">
                                <span className="favorites__stat-label">Tổng sản phẩm</span>
                                <span className="favorites__stat-value">{favoriteProducts.length}</span>
                            </div>
                            <div className="favorites__stat">
                                <span className="favorites__stat-label">Tổng giá trị</span>
                                <span className="favorites__stat-value">{totalPrice.toLocaleString('vi-VN')}₫</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="favorites__actions">
                            <button
                                className="btn btn-accent btn-lg"
                                onClick={() => alert('Tính năng thêm giỏ hàng sẽ ra mắt sớm')}
                            >
                                <FiShoppingCart size={18} /> Thêm tất cả vào giỏ
                            </button>
                            <button
                                className="btn btn-outline btn-lg favorites__clear-btn"
                                onClick={handleClearAll}
                            >
                                <FiTrash2 size={18} /> Xóa tất cả
                            </button>
                        </div>

                        {/* Products Grid */}
                        <div className="favorites__products">
                            <div className="products-grid">
                                {favoriteProducts.map((product) => (
                                    <div key={product.id} className="favorites__product-wrapper">
                                        <ProductCard product={product} />
                                        <button
                                            className="favorites__remove-btn"
                                            title="Xóa khỏi yêu thích"
                                            onClick={() => handleRemove(product.id)}
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
