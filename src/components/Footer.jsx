import { Link } from 'react-router-dom';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
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
                    </div>
                </div>
            </div>
        </footer>
    );
}
