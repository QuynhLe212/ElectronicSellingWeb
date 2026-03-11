import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './LoginPage.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

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
        // Simulate API call
        setTimeout(() => {
            // Save user session (in real app, you'd save token to localStorage)
            localStorage.setItem('user_token', 'fake-token-' + Date.now());
            localStorage.setItem('user_email', formData.email);
            setIsLoading(false);
            // Redirect to profile page
            navigate('/profile');
        }, 1000);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left Content */}
                <div className="login__content">
                    <div className="login__header">
                        <h1 className="login__title">Đăng nhập</h1>
                        <p className="login__subtitle">Chào mừng bạn quay trở lại</p>
                    </div>

                    <form className="login__form" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="login__field">
                            <label htmlFor="email" className="login__label">Email</label>
                            <div className="login__input-wrapper">
                                <FiMail className="login__input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={`login__input ${errors.email ? 'login__input--error' : ''}`}
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.email && <span className="login__error">{errors.email}</span>}
                        </div>

                        {/* Password Field */}
                        <div className="login__field">
                            <label htmlFor="password" className="login__label">Mật khẩu</label>
                            <div className="login__input-wrapper">
                                <FiLock className="login__input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
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
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            {errors.password && <span className="login__error">{errors.password}</span>}
                        </div>

                        {/* Remember Me & Forgot Password */}
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

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="login__submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="login__divider">
                        <span>Hoặc tiếp tục với</span>
                    </div>

                    {/* Social Login */}
                    <div className="login__social">
                        <button className="login__social-btn login__social-btn--google">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.461,2.268,15.365,1,12.545,1 C6.777,1,2,5.777,2,11.545c0,5.768,4.777,10.545,10.545,10.545c6.134,0,10.216-4.335,10.216-10.452c0-0.612-0.053-1.210-0.149-1.804 H12.545z"/>
                            </svg>
                            Google
                        </button>
                        <button className="login__social-btn login__social-btn--facebook">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="login__footer">
                        <p>Chưa có tài khoản? <Link to="/signup" className="login__link">Đăng ký ngay</Link></p>
                    </div>
                </div>

                {/* Right Side - Illustration */}
                <div className="login__illustration">
                    <div className="login__illustration-box">
                        <div className="login__illustration-content">
                            <div className="login__illustration-icon">
                                <FiLock size={64} />
                            </div>
                            <h2>Bảo mật tài khoản</h2>
                            <p>Đăng nhập để truy cập tài khoản và quản lý đơn hàng của bạn</p>
                            <ul className="login__benefits">
                                <li>✓ Quản lý đơn hàng</li>
                                <li>✓ Lưu địa chỉ</li>
                                <li>✓ Nhận khuyến mãi</li>
                                <li>✓ Tích lũy điểm thưởng</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
