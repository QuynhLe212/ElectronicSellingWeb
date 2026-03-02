import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            {/* Footer chính */}
            <div className="footer__main">
                <div className="container footer__grid">
                    {/* Công ty */}
                    <div className="footer__col">
                        <div className="footer__logo">
                            <span className="footer__logo-icon">⚡</span>
                            <span className="footer__logo-text">Electro<strong>Shop</strong></span>
                        </div>
                        <p className="footer__about">
                            Điểm đến tin cậy cho các sản phẩm điện tử cao cấp. Chúng tôi cung cấp các thương hiệu hàng đầu với giá cạnh tranh cùng dịch vụ khách hàng xuất sắc.
                        </p>
                        <div className="footer__contact">
                            <div><FiMapPin size={14} /> 123 Nguyễn Huệ, Quận 1, TP.HCM</div>
                            <div><FiPhone size={14} /> 0901 234 567</div>
                            <div><FiMail size={14} /> hotro@electroshop.vn</div>
                        </div>
                    </div>

                    {/* Liên kết nhanh */}
                    <div className="footer__col">
                        <h4 className="footer__heading">Liên kết nhanh</h4>
                        <Link to="/" className="footer__link">Trang chủ</Link>
                        <Link to="/products" className="footer__link">Tất cả sản phẩm</Link>
                        <Link to="/products?category=smartphones" className="footer__link">Điện thoại</Link>
                        <Link to="/products?category=laptops" className="footer__link">Laptop</Link>
                        <Link to="/products?category=audio" className="footer__link">Âm thanh</Link>
                        <Link to="/products" className="footer__link">Khuyến mãi</Link>
                    </div>

                    {/* Chăm sóc khách hàng */}
                    <div className="footer__col">
                        <h4 className="footer__heading">Chăm sóc khách hàng</h4>
                        <a href="#" className="footer__link">Tài khoản của tôi</a>
                        <a href="#" className="footer__link">Theo dõi đơn hàng</a>
                        <a href="#" className="footer__link">Đổi trả & Hoàn tiền</a>
                        <a href="#" className="footer__link">Thông tin vận chuyển</a>
                        <a href="#" className="footer__link">Câu hỏi thường gặp</a>
                        <a href="#" className="footer__link">Liên hệ</a>
                    </div>

                    {/* Bản tin */}
                    <div className="footer__col">
                        <h4 className="footer__heading">Đăng ký nhận tin</h4>
                        <p className="footer__newsletter-text">
                            Đăng ký để nhận ưu đãi độc quyền, thông tin sản phẩm mới và tin tức công nghệ.
                        </p>
                        <form className="footer__newsletter" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Địa chỉ email của bạn" className="footer__newsletter-input" />
                            <button type="submit" className="footer__newsletter-btn">Đăng ký</button>
                        </form>
                        <div className="footer__socials">
                            <a href="#" className="footer__social-link" aria-label="Facebook"><FiFacebook /></a>
                            <a href="#" className="footer__social-link" aria-label="Twitter"><FiTwitter /></a>
                            <a href="#" className="footer__social-link" aria-label="Instagram"><FiInstagram /></a>
                            <a href="#" className="footer__social-link" aria-label="YouTube"><FiYoutube /></a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="footer__payments">
                <div className="container footer__payments-inner">
                    <span className="footer__payments-label">Chấp nhận thanh toán:</span>
                    <div className="footer__payment-icons">
                        {['💳 Visa', '💳 MasterCard', '💳 AMEX', '🅿️ PayPal', '🏦 Chuyển khoản'].map((p, i) => (
                            <span key={i} className="footer__payment-icon">{p}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cuối trang */}
            <div className="footer__bottom">
                <div className="container footer__bottom-inner">
                    <p>&copy; 2026 ElectroShop. Mọi quyền được bảo lưu.</p>
                    <div className="footer__bottom-links">
                        <a href="#">Chính sách bảo mật</a>
                        <a href="#">Điều khoản sử dụng</a>
                        <a href="#">Chính sách Cookie</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
