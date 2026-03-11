import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import './SignUpPage.css';

export default function SignUpPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Họ không được để trống';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Tên không được để trống';
        }

        if (!formData.email) {
            newErrors.email = 'Email không được để trống';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Số điện thoại không được để trống';
        } else if (!/^[\d\s\-\+\(\)]{9,}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Mật khẩu phải ít nhất 8 ký tự';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Mật khẩu phải chứa chữ hoa, chữ thường và số';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu không khớp';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
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
            // Save user session
            localStorage.setItem('user_token', 'fake-token-' + Date.now());
            localStorage.setItem('user_email', formData.email);
            localStorage.setItem('user_name', `${formData.firstName} ${formData.lastName}`);
            setIsLoading(false);
            // Redirect to profile page
            navigate('/profile');
        }, 1000);
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                {/* Left Side - Illustration */}
                <div className="signup__illustration">
                    <div className="signup__illustration-box">
                        <div className="signup__illustration-content">
                            <div className="signup__illustration-icon">
                                <FiUser size={64} />
                            </div>
                            <h2>Tạo tài khoản</h2>
                            <p>Tham gia cộng đồng của chúng tôi hôm nay</p>
                            <ul className="signup__benefits">
                                <li>✓ Dễ dàng quản lý đơn hàng</li>
                                <li>✓ Lưu các địa chỉ giao hàng</li>
                                <li>✓ Nhận ưu đãi độc quyền</li>
                                <li>✓ Tích lũy điểm thưởng</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="signup__content">
                    <div className="signup__header">
                        <h1 className="signup__title">Đăng ký</h1>
                        <p className="signup__subtitle">Tạo tài khoản mới để bắt đầu mua sắm</p>
                    </div>

                    <form className="signup__form" onSubmit={handleSubmit}>
                        {/* Name Fields */}
                        <div className="signup__row">
                            <div className="signup__field">
                                <label htmlFor="firstName" className="signup__label">Họ</label>
                                <div className="signup__input-wrapper">
                                    <FiUser className="signup__input-icon" />
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        className={`signup__input ${errors.firstName ? 'signup__input--error' : ''}`}
                                        placeholder="Nguyễn"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.firstName && <span className="signup__error">{errors.firstName}</span>}
                            </div>

                            <div className="signup__field">
                                <label htmlFor="lastName" className="signup__label">Tên</label>
                                <div className="signup__input-wrapper">
                                    <FiUser className="signup__input-icon" />
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        className={`signup__input ${errors.lastName ? 'signup__input--error' : ''}`}
                                        placeholder="Văn A"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.lastName && <span className="signup__error">{errors.lastName}</span>}
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="signup__field">
                            <label htmlFor="email" className="signup__label">Email</label>
                            <div className="signup__input-wrapper">
                                <FiMail className="signup__input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={`signup__input ${errors.email ? 'signup__input--error' : ''}`}
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.email && <span className="signup__error">{errors.email}</span>}
                        </div>

                        {/* Phone Field */}
                        <div className="signup__field">
                            <label htmlFor="phone" className="signup__label">Số điện thoại</label>
                            <div className="signup__input-wrapper">
                                <FiPhone className="signup__input-icon" />
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className={`signup__input ${errors.phone ? 'signup__input--error' : ''}`}
                                    placeholder="0123456789"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.phone && <span className="signup__error">{errors.phone}</span>}
                        </div>

                        {/* Password Field */}
                        <div className="signup__field">
                            <label htmlFor="password" className="signup__label">Mật khẩu</label>
                            <div className="signup__input-wrapper">
                                <FiLock className="signup__input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    className={`signup__input ${errors.password ? 'signup__input--error' : ''}`}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="signup__toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            {errors.password && <span className="signup__error">{errors.password}</span>}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="signup__field">
                            <label htmlFor="confirmPassword" className="signup__label">Xác nhận mật khẩu</label>
                            <div className="signup__input-wrapper">
                                <FiLock className="signup__input-icon" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className={`signup__input ${errors.confirmPassword ? 'signup__input--error' : ''}`}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="signup__toggle-password"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="signup__error">{errors.confirmPassword}</span>}
                        </div>

                        {/* Terms & Conditions */}
                        <label className={`signup__terms ${errors.agreeToTerms ? 'signup__terms--error' : ''}`}>
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                            />
                            <span>Tôi đồng ý với <a href="#">Điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật</a></span>
                        </label>
                        {errors.agreeToTerms && <span className="signup__error">{errors.agreeToTerms}</span>}

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="signup__submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="signup__divider">
                        <span>Hoặc đăng ký với</span>
                    </div>

                    {/* Social Signup */}
                    <div className="signup__social">
                        <button className="signup__social-btn signup__social-btn--google">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.461,2.268,15.365,1,12.545,1 C6.777,1,2,5.777,2,11.545c0,5.768,4.777,10.545,10.545,10.545c6.134,0,10.216-4.335,10.216-10.452c0-0.612-0.053-1.210-0.149-1.804 H12.545z"/>
                            </svg>
                            Google
                        </button>
                        <button className="signup__social-btn signup__social-btn--facebook">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                        </button>
                    </div>

                    {/* Login Link */}
                    <div className="signup__footer">
                        <p>Đã có tài khoản? <Link to="/login" className="signup__link">Đăng nhập</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
