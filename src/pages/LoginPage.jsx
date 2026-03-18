import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { login } from '../services/authService';
import './LoginPage.css';

export default function LoginPage() {
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // ✅ AUTO SLIDE
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % 4);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email) {
            newErrors.email = 'Email không được để trống';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải ít nhất 6 ký tự';
        }

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            const response = await login({
                email: formData.email,
                password: formData.password,
            });

            const role = response?.user?.role;
            setIsLoading(false);

            if (role === 'admin') {
                navigate('/admin');
                return;
            }

            navigate('/profile');
        } catch (error) {
            setIsLoading(false);
            setErrors((prev) => ({
                ...prev,
                submit: error.message || 'Đăng nhập thất bại. Vui lòng thử lại.',
            }));
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">

                {/* LEFT */}
                <div className="login__content">
                    <div className="login__header">
                        <h1 className="login__title">Đăng nhập</h1>
                        <p className="login__subtitle">Chào mừng bạn quay trở lại</p>
                    </div>

                    <form className="login__form" onSubmit={handleSubmit}>
                        {errors.submit && <span className="login__error">{errors.submit}</span>}

                        {/* Email Field */}
                        <div className="login__field">
                            <label className="login__label">Email</label>
                            <div className="login__input-wrapper">
                                <FiMail className="login__input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    className={`login__input ${errors.email ? 'login__input--error' : ''}`}
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.email && <span className="login__error">{errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div className="login__field">
                            <label className="login__label">Mật khẩu</label>
                            <div className="login__input-wrapper">
                                <FiLock className="login__input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className={`login__input ${errors.password ? 'login__input--error' : ''}`}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="login__toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {errors.password && <span className="login__error">{errors.password}</span>}
                        </div>

                        {/* Options */}
                        <div className="login__options">
                            <label className="login__checkbox">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                />
                                <span>Ghi nhớ tôi</span>
                            </label>
                            <a href="#" className="login__forgot-link">Quên mật khẩu?</a>
                        </div>

                        {/* Submit */}
                        <button 
                            type="submit" 
                            className="login__submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <div className="login__footer">
                        <p>
                            Chưa có tài khoản? 
                            <Link to="/signup" className="login__link"> Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>

                {/* RIGHT - AUTO CAROUSEL */}
                <div className="login__illustration">
                    <div className="login__illustration-box">
                        <div className="prod_view">

                            <div className="prod_view-carousel">
                                <div className="prod_view-content-item" key={activeIndex}>
                                    <div className="fade-in">
                                        {activeIndex === 0 && (
                                            <>
                                                <h2>Sản phẩm mới</h2>
                                                <p>Cập nhật xu hướng liên tục mỗi ngày.</p>
                                            </>
                                        )}
                                        {activeIndex === 1 && (
                                            <>
                                                <h2>Giá tốt</h2>
                                                <p>Cam kết giá cạnh tranh nhất thị trường.</p>
                                            </>
                                        )}
                                        {activeIndex === 2 && (
                                            <>
                                                <h2>Giao nhanh</h2>
                                                <p>Nhận hàng ngay trong vòng 2h làm việc.</p>
                                            </>
                                        )}
                                        {activeIndex === 3 && (
                                            <>
                                                <h2>Hỗ trợ 24/7</h2>
                                                <p>Đội ngũ tư vấn tận tâm mọi lúc mọi nơi.</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="prod_view-multiview">
                                <ul className="prod_view-multiview-list">
                                    {[0, 1, 2, 3].map((_, index) => (
                                        <li 
                                            key={index}
                                            className={`prod_view-multiview-item ${activeIndex === index ? 'is-active' : ''}`} 
                                            onClick={() => setActiveIndex(index)}   // 👈 CLICK HERE
                                        >
                                            <div className="thumb-dot"></div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}