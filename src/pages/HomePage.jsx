import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { products, categories, partnerBrands } from '../data/data';
import './HomePage.css';

export default function HomePage() {
    const featuredProducts = products.slice(0, 8);
    const newArrivals = products.filter(p => p.badge === 'new');

    return (
        <div className="home">
            {/* ===== BANNER CHÍNH ===== */}
            <section className="hero">
                <div className="container hero__inner">
                    <div className="hero__content">
                        <span className="hero__tag">🔥 Bộ sưu tập mới 2026</span>
                        <h1 className="hero__title">
                            Khám phá <span className="hero__title-accent">Tương lai</span> của Công nghệ
                        </h1>
                        <p className="hero__subtitle">
                            Mua sắm điện thoại, laptop, thiết bị âm thanh mới nhất — tất cả với giá tốt nhất cùng miễn phí vận chuyển cho đơn hàng từ 2.000.000₫.
                        </p>
                        <div className="hero__actions">
                            <Link to="/products" className="btn btn-accent btn-lg">
                                Mua sắm ngay <FiArrowRight />
                            </Link>
                            <Link to="/products?category=smartphones" className="btn btn-outline btn-lg hero__btn-outline">
                                Xem khuyến mãi
                            </Link>
                        </div>
                        <div className="hero__stats">
                            <div className="hero__stat">
                                <strong>50K+</strong>
                                <span>Khách hàng hài lòng</span>
                            </div>
                            <div className="hero__stat">
                                <strong>1000+</strong>
                                <span>Sản phẩm</span>
                            </div>
                            <div className="hero__stat">
                                <strong>100+</strong>
                                <span>Thương hiệu</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero__visual">
                        <div className="hero__visual-circle"></div>
                        <img src="https://picsum.photos/seed/herodevice/500/500" alt="Sản phẩm nổi bật" className="hero__image" />
                    </div>
                </div>
            </section>

            {/* ===== THANH TIN CẬY ===== */}
            <section className="trust-bar">
                <div className="container trust-bar__inner">
                    <div className="trust-bar__item">
                        <FiTruck size={24} />
                        <div>
                            <strong>Miễn phí vận chuyển</strong>
                            <span>Đơn hàng từ 2.000.000₫</span>
                        </div>
                    </div>
                    <div className="trust-bar__item">
                        <FiShield size={24} />
                        <div>
                            <strong>Bảo hành 2 năm</strong>
                            <span>Cho tất cả sản phẩm</span>
                        </div>
                    </div>
                    <div className="trust-bar__item">
                        <FiRefreshCw size={24} />
                        <div>
                            <strong>Đổi trả 30 ngày</strong>
                            <span>Không phiền hà</span>
                        </div>
                    </div>
                    <div className="trust-bar__item">
                        <FiHeadphones size={24} />
                        <div>
                            <strong>Hỗ trợ 24/7</strong>
                            <span>Chăm sóc tận tâm</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== DANH MỤC ===== */}
            <section className="section">
                <div className="container">
                    <div className="home__section-header">
                        <div>
                            <h2 className="section-title">Mua theo danh mục</h2>
                            <p className="section-subtitle">Khám phá đa dạng các loại sản phẩm của chúng tôi</p>
                        </div>
                        <Link to="/products" className="btn btn-outline btn-sm">Xem tất cả <FiArrowRight /></Link>
                    </div>
                    <div className="categories-grid">
                        {categories.map((cat) => (
                            <Link to={`/products?category=${cat.slug}`} key={cat.id} className="category-card">
                                <div className="category-card__icon">{cat.icon}</div>
                                <h3 className="category-card__name">{cat.name}</h3>
                                <span className="category-card__count">{cat.count} Sản phẩm</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SẢN PHẨM NỔI BẬT ===== */}
            <section className="section" style={{ background: 'var(--gray-50)' }}>
                <div className="container">
                    <div className="home__section-header">
                        <div>
                            <h2 className="section-title">Xu hướng hiện tại 🔥</h2>
                            <p className="section-subtitle">Khám phá những sản phẩm được yêu thích nhất</p>
                        </div>
                        <Link to="/products" className="btn btn-outline btn-sm">Xem tất cả <FiArrowRight /></Link>
                    </div>
                    <div className="products-grid">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== BANNER KHUYẾN MÃI ===== */}
            <section className="promo-banner">
                <div className="container promo-banner__inner">
                    <div className="promo-banner__content">
                        <span className="promo-banner__tag">Ưu đãi có hạn</span>
                        <h2 className="promo-banner__title">Giảm đến 40% cho Thiết bị Âm thanh Cao cấp</h2>
                        <p className="promo-banner__text">
                            Trải nghiệm âm thanh đẳng cấp thế giới với bộ sưu tập tai nghe, earbuds và loa từ các thương hiệu hàng đầu.
                        </p>
                        <Link to="/products?category=audio" className="btn btn-accent btn-lg">
                            Mua Âm thanh <FiArrowRight />
                        </Link>
                    </div>
                    <div className="promo-banner__image">
                        <img src="https://picsum.photos/seed/audiopromo/500/400" alt="Khuyến mãi Âm thanh" />
                    </div>
                </div>
            </section>

            {/* ===== SẢN PHẨM MỚI ===== */}
            {newArrivals.length > 0 && (
                <section className="section">
                    <div className="container">
                        <div className="home__section-header">
                            <div>
                                <h2 className="section-title">Hàng mới về ✨</h2>
                                <p className="section-subtitle">Vừa cập nhật — công nghệ mới nhất</p>
                            </div>
                        </div>
                        <div className="products-grid products-grid--scroll">
                            {newArrivals.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== ĐỐI TÁC THƯƠNG HIỆU ===== */}
            <section className="partners">
                <div className="container">
                    <p className="partners__label">Được tin tưởng bởi các thương hiệu hàng đầu</p>
                    <div className="partners__grid">
                        {partnerBrands.map((brand, i) => (
                            <div key={i} className="partners__item">
                                <span className="partners__brand-name">{brand}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== ĐĂNG KÝ NHẬN TIN ===== */}
            <section className="newsletter">
                <div className="container newsletter__inner">
                    <div className="newsletter__content">
                        <h2 className="newsletter__title">Luôn cập nhật</h2>
                        <p className="newsletter__text">Đăng ký nhận ưu đãi độc quyền, quyền truy cập sớm vào sản phẩm mới và tin tức công nghệ gửi đến hộp thư của bạn.</p>
                    </div>
                    <form className="newsletter__form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Nhập địa chỉ email của bạn" className="newsletter__input" />
                        <button type="submit" className="btn btn-accent btn-lg">Đăng ký</button>
                    </form>
                </div>
            </section>
        </div>
    );
}
