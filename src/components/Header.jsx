import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiShoppingCart, FiHeart, FiMenu, FiX, FiChevronDown, FiPhone, FiMail, FiTruck } from 'react-icons/fi';
import { categories } from '../data/data';
import { getFavorites } from '../services/favoritesService';
import { getCartCount, subscribeCartChanges } from '../services/cartService';
import { getProducts } from '../services/productsService';
import { searchProductsByCriteria } from '../utils/searchEngine';
import './Header.css';

const megaMenuData = {
    smartphones: {
        subcategories: ['Tất cả Điện thoại', 'Cao cấp', 'Tầm trung', 'Giá rẻ', 'Hàng đổi trả'],
        featured: { name: 'iPhone 15 Pro Max', image: 'https://picsum.photos/seed/iphone15/200/200' },
    },
    laptops: {
        subcategories: ['Tất cả Laptop', 'Gaming', 'Doanh nhân', 'Ultrabook', 'Chromebook', '2-trong-1'],
        featured: { name: 'MacBook Pro M3', image: 'https://picsum.photos/seed/macbook16/200/200' },
    },
    audio: {
        subcategories: ['Tất cả Âm thanh', 'Tai nghe chụp tai', 'Tai nghe nhét tai', 'Loa', 'Soundbar', 'Micro'],
        featured: { name: 'Sony WH-1000XM5', image: 'https://picsum.photos/seed/sonyxm5/200/200' },
    },
    cameras: {
        subcategories: ['Tất cả Máy ảnh', 'Mirrorless', 'DSLR', 'Action Camera', 'Ống kính', 'Flycam'],
        featured: { name: 'Canon EOS R6 II', image: 'https://picsum.photos/seed/canonr6/200/200' },
    },
    tablets: {
        subcategories: ['Tất cả Máy tính bảng', 'iPad', 'Android', 'Đọc sách', 'Phụ kiện Tablet'],
        featured: { name: 'iPad Pro M2', image: 'https://picsum.photos/seed/ipadpro/200/200' },
    },
    accessories: {
        subcategories: ['Tất cả Phụ kiện', 'Ốp lưng', 'Sạc', 'Cáp', 'Đồng hồ thông minh', 'Pin dự phòng'],
        featured: null,
    },
};

const formatVND = (price) => Number(price || 0).toLocaleString('vi-VN') + 'đ';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchProducts, setSearchProducts] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [activeMega, setActiveMega] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const megaRef = useRef(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const updateFavoritesCount = () => {
            const favorites = getFavorites();
            setFavoritesCount(favorites.length);
        };
        updateFavoritesCount();

        // Listen for storage changes (when favorites are updated in other tabs/windows)
        window.addEventListener('storage', updateFavoritesCount);
        return () => window.removeEventListener('storage', updateFavoritesCount);
    }, []);

    useEffect(() => {
        setCartCount(getCartCount());
        const unsubscribe = subscribeCartChanges(() => {
            setCartCount(getCartCount());
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (megaRef.current && !megaRef.current.contains(e.target)) {
                setActiveMega(null);
            }

            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        let ignore = false;

        const loadProductsForSearch = async () => {
            try {
                setSearchLoading(true);
                const response = await getProducts({ page: 1, limit: 300, sort: '-rating' });
                if (ignore) return;
                setSearchProducts(Array.isArray(response?.products) ? response.products : []);
            } catch {
                if (ignore) return;
                setSearchProducts([]);
            } finally {
                if (!ignore) {
                    setSearchLoading(false);
                }
            }
        };

        loadProductsForSearch();

        return () => {
            ignore = true;
        };
    }, []);

    const rankedSearchResults = useMemo(
        () => searchProductsByCriteria(searchProducts, { query: searchQuery, sortBy: 'relevance', limit: 8 }),
        [searchProducts, searchQuery]
    );

    const keywordSuggestions = rankedSearchResults
        .map((p) => p.name)
        .filter((name, index, list) => list.indexOf(name) === index)
        .slice(0, 5);

    const showSearchDropdown = searchOpen && searchQuery.trim().length > 0;

    const handleSearch = (e) => {
        e.preventDefault();
        const keyword = searchQuery.trim();
        if (keyword) {
            navigate(`/products?search=${encodeURIComponent(keyword)}`);
            setSearchOpen(false);
        }
    };

    const handleSearchInputChange = (value) => {
        setSearchQuery(value);
        setSearchOpen(true);
    };

    const handleSelectKeyword = (keyword) => {
        setSearchQuery(keyword);
        navigate(`/products?search=${encodeURIComponent(keyword)}`);
        setSearchOpen(false);
    };

    const handleSelectProduct = (productId) => {
        navigate(`/product/${productId}`);
        setSearchOpen(false);
    };

    return (
        <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
            {/* Thanh chính */}
            <div className="header__main">
                <div className="container header__main-inner">
                    <Link to="/" className="header__logo">
                        <span className="header__logo-icon">⚡</span>
                        <span className="header__logo-text">Electro<strong>Shop</strong></span>
                    </Link>

                    <form className="header__search" onSubmit={handleSearch} ref={searchRef}>
                        <FiSearch className="header__search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                            value={searchQuery}
                            onFocus={() => setSearchOpen(true)}
                            onChange={(e) => handleSearchInputChange(e.target.value)}
                            className="header__search-input"
                        />
                        <button type="submit" className="header__search-btn">Tìm kiếm</button>

                        {showSearchDropdown && (
                            <div className="header__search-dropdown">
                                {keywordSuggestions.length > 0 && (
                                    <div className="header__search-section">
                                        <h4 className="header__search-section-title">Có phải bạn muốn tìm</h4>
                                        <div className="header__search-keywords">
                                            {keywordSuggestions.map((keyword) => (
                                                <button
                                                    key={keyword}
                                                    type="button"
                                                    className="header__search-keyword"
                                                    onClick={() => handleSelectKeyword(keyword)}
                                                >
                                                    <FiSearch size={14} /> {keyword}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="header__search-section">
                                    <h4 className="header__search-section-title">🔥 Sản phẩm gợi ý</h4>

                                    {searchLoading && <p className="header__search-empty">Đang tải dữ liệu...</p>}

                                    {!searchLoading && rankedSearchResults.length === 0 && (
                                        <p className="header__search-empty">Không tìm thấy sản phẩm phù hợp với từ khóa này.</p>
                                    )}

                                    {!searchLoading && rankedSearchResults.length > 0 && (
                                        <div className="header__search-products">
                                            {rankedSearchResults.map((product) => (
                                                <button
                                                    type="button"
                                                    key={product.id}
                                                    className="header__search-product"
                                                    onClick={() => handleSelectProduct(product.id)}
                                                >
                                                    <img src={product.image} alt={product.name} className="header__search-product-image" />
                                                    <div className="header__search-product-info">
                                                        <p className="header__search-product-name">{product.name}</p>
                                                        <p className="header__search-product-meta">{product.brand}</p>
                                                        <p className="header__search-product-price">
                                                            {formatVND(product.price)}
                                                            {product.originalPrice > product.price && (
                                                                <span className="header__search-product-original">
                                                                    {formatVND(product.originalPrice)}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="header__icons">
                        <Link to="/favorites" className="header__icon-btn">
                            <FiHeart size={22} />
                            <span className="header__icon-badge">{favoritesCount}</span>
                        </Link>
                        <Link to="/profile" className="header__icon-btn">
                            <FiUser size={22} />
                        </Link>
                        <Link to="/checkout" className="header__icon-btn header__cart-btn">
                            <FiShoppingCart size={22} />
                            <span className="header__icon-badge">{cartCount}</span>
                            <span className="header__cart-text">Giỏ hàng</span>
                        </Link>
                    </div>

                    <button className="header__mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Điều hướng / Mega Menu */}
            <nav className={`header__nav ${mobileOpen ? 'header__nav--open' : ''}`} ref={megaRef}>
                <div className="container header__nav-inner">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className={`header__nav-item ${activeMega === cat.slug ? 'header__nav-item--active' : ''}`}
                            onMouseEnter={() => setActiveMega(cat.slug)}
                            onMouseLeave={() => setActiveMega(null)}
                        >
                            <Link
                                to={`/products?category=${cat.slug}`}
                                className="header__nav-link"
                                onClick={() => { setActiveMega(null); setMobileOpen(false); }}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.name}</span>
                                <FiChevronDown size={14} className="header__nav-arrow" />
                            </Link>

                            {/* Mega Menu */}
                            {megaMenuData[cat.slug] && activeMega === cat.slug && (
                                <div className="mega-menu">
                                    <div className="mega-menu__content">
                                        <div className="mega-menu__col">
                                            <h4 className="mega-menu__heading">Danh mục</h4>
                                            {megaMenuData[cat.slug].subcategories.map((sub, idx) => (
                                                <Link
                                                    key={idx}
                                                    to={`/products?category=${cat.slug}`}
                                                    className="mega-menu__link"
                                                    onClick={() => { setActiveMega(null); setMobileOpen(false); }}
                                                >
                                                    {sub}
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="mega-menu__col">
                                            <h4 className="mega-menu__heading">Thương hiệu nổi bật</h4>
                                            {['Apple', 'Samsung', 'Sony', 'Dell'].map((b, idx) => (
                                                <Link key={idx} to={`/products?brand=${b}`} className="mega-menu__link" onClick={() => setActiveMega(null)}>
                                                    {b}
                                                </Link>
                                            ))}
                                        </div>
                                        {megaMenuData[cat.slug].featured && (
                                            <div className="mega-menu__featured">
                                                <img src={megaMenuData[cat.slug].featured.image} alt={megaMenuData[cat.slug].featured.name} />
                                                <p>{megaMenuData[cat.slug].featured.name}</p>
                                                <Link to="/products" className="btn btn-primary btn-sm" onClick={() => setActiveMega(null)}>Mua ngay</Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <Link to="/products?deal=sale" className="header__nav-link header__nav-link--deals" onClick={() => setMobileOpen(false)}>
                        🔥 Khuyến mãi
                    </Link>
                </div>
            </nav>
        </header>
    );
}
