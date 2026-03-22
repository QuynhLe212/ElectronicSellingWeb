import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiCheck, FiChevronLeft, FiShield, FiTruck, FiCreditCard, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { createOrder } from '../services/ordersService';
import { getMe } from '../services/authService';
import { clearCart, getCartItems, removeFromCart, subscribeCartChanges, updateCartItemQuantity } from '../services/cartService';
import './CheckoutPage.css';

function formatVND(price) {
    return price.toLocaleString('vi-VN') + '₫';
}

const INITIAL_FORM_DATA = {
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    phone: '',
    shippingMethod: 'standard',
    paymentMethod: 'Credit Card',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    promoCode: '',
};

const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '');

const splitDisplayName = (fullName = '') => {
    const safeName = String(fullName || '').trim();
    if (!safeName) return { firstName: '', lastName: '' };

    const parts = safeName.split(/\s+/);
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' };
    }

    return {
        firstName: parts[parts.length - 1],
        lastName: parts.slice(0, -1).join(' '),
    };
};

const fillIfEmpty = (currentValue, nextValue) => {
    if (String(currentValue || '').trim()) return currentValue;
    return String(nextValue || '').trim();
};

const mergeProfileIntoForm = (prevForm, user) => {
    if (!user) return prevForm;

    const nameParts = splitDisplayName(user?.name);
    const profileAddress = user?.address || {};

    return {
        ...prevForm,
        email: fillIfEmpty(prevForm.email, user?.email),
        phone: fillIfEmpty(prevForm.phone, user?.phone),
        firstName: fillIfEmpty(prevForm.firstName, nameParts.firstName),
        lastName: fillIfEmpty(prevForm.lastName, nameParts.lastName),
        address: fillIfEmpty(prevForm.address, profileAddress?.street),
        city: fillIfEmpty(prevForm.city, profileAddress?.city),
        district: fillIfEmpty(prevForm.district, profileAddress?.district),
        ward: fillIfEmpty(prevForm.ward, profileAddress?.ward),
    };
};

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(String(email || '').trim());

const isValidExpiry = (expiry) => {
    const text = String(expiry || '').trim();
    if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(text)) return false;

    const [month, year2] = text.split('/').map(Number);
    const year = 2000 + year2;
    const now = new Date();
    const expiryDate = new Date(year, month, 0, 23, 59, 59);
    return expiryDate >= now;
};

const steps = [
    { id: 1, label: 'Vận chuyển', icon: <FiTruck /> },
    { id: 2, label: 'Thanh toán', icon: <FiCreditCard /> },
    { id: 3, label: 'Xác nhận', icon: <FiCheck /> },
];

export default function CheckoutPage() {
    const navigate = useNavigate();
    const isLoggedIn = Boolean(localStorage.getItem('user_token'));
    const [currentStep, setCurrentStep] = useState(1);
    const [cart, setCart] = useState(() => getCartItems());
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [createdOrder, setCreatedOrder] = useState(null);
    const [formData, setFormData] = useState(() => ({ ...INITIAL_FORM_DATA }));

    useEffect(() => {
        const unsubscribe = subscribeCartChanges((items) => setCart(items));
        setCart(getCartItems());
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!isLoggedIn) return;

        let isMounted = true;

        try {
            const cachedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
            if (cachedUser && isMounted) {
                setFormData((prev) => mergeProfileIntoForm(prev, cachedUser));
            }
        } catch {
            // Ignore invalid local profile cache.
        }

        const loadProfile = async () => {
            try {
                const data = await getMe();
                const user = data?.user;
                if (!user || !isMounted) return;

                setFormData((prev) => mergeProfileIntoForm(prev, user));
            } catch {
                // Keep current form values when profile fetch fails.
            }
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [isLoggedIn]);

    const updateField = (field, value) => {
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: '' }));
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const updateQuantity = (productId, delta, currentQty) => {
        updateCartItemQuantity(productId, Math.max(1, currentQty + delta));
    };

    const removeItem = (productId) => {
        removeFromCart(productId);
    };

    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        [cart],
    );
    const shipping = formData.shippingMethod === 'express' ? 50000 : (subtotal >= 2000000 ? 0 : 30000);
    const tax = 0; // VAT đã bao gồm trong giá tại Việt Nam
    const total = subtotal + shipping + tax;

    const validateShippingStep = () => {
        const errors = {};

        if (!isValidEmail(formData.email)) errors.email = 'Email không hợp lệ.';
        if (!String(formData.lastName || '').trim()) errors.lastName = 'Vui lòng nhập họ.';
        if (!String(formData.firstName || '').trim()) errors.firstName = 'Vui lòng nhập tên.';
        if (!String(formData.address || '').trim()) errors.address = 'Vui lòng nhập địa chỉ.';
        if (!String(formData.city || '').trim()) errors.city = 'Vui lòng nhập tỉnh/thành phố.';
        if (!String(formData.district || '').trim()) errors.district = 'Vui lòng nhập quận/huyện.';
        if (!String(formData.ward || '').trim()) errors.ward = 'Vui lòng nhập phường/xã.';

        const phoneDigits = normalizePhone(formData.phone);
        if (!/^[0-9]{10,11}$/.test(phoneDigits)) {
            errors.phone = 'Số điện thoại phải gồm 10-11 chữ số.';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePaymentStep = () => {
        const errors = {};

        if (formData.paymentMethod === 'Credit Card') {
            const cardNumber = String(formData.cardNumber || '').replace(/\s/g, '');
            if (!/^\d{13,19}$/.test(cardNumber)) {
                errors.cardNumber = 'Số thẻ không hợp lệ.';
            }

            if (!String(formData.cardName || '').trim()) {
                errors.cardName = 'Vui lòng nhập tên chủ thẻ.';
            }

            if (!isValidExpiry(formData.expiry)) {
                errors.expiry = 'Ngày hết hạn không hợp lệ hoặc đã hết hạn.';
            }

            if (!/^\d{3,4}$/.test(String(formData.cvv || '').trim())) {
                errors.cvv = 'CVV phải gồm 3-4 chữ số.';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const nextStep = () => {
        if (currentStep === 1 && cart.length === 0) {
            setCheckoutError('Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
            return;
        }

        if (currentStep === 1 && !validateShippingStep()) {
            setCheckoutError('Vui lòng kiểm tra lại thông tin giao hàng.');
            return;
        }

        setCheckoutError('');
        setCurrentStep((s) => Math.min(3, s + 1));
    };
    const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

    const handlePlaceOrder = async () => {
        const token = localStorage.getItem('user_token');
        if (!token) {
            setCheckoutError('Vui lòng đăng nhập để đặt hàng.');
            navigate('/login');
            return;
        }

        if (cart.length === 0) {
            setCheckoutError('Giỏ hàng đang trống.');
            return;
        }

        if (!validateShippingStep()) {
            setCurrentStep(1);
            setCheckoutError('Thông tin giao hàng chưa hợp lệ.');
            return;
        }

        if (!validatePaymentStep()) {
            setCheckoutError('Thông tin thanh toán chưa hợp lệ.');
            return;
        }

        try {
            setIsPlacingOrder(true);
            setCheckoutError('');

            const phoneDigits = normalizePhone(formData.phone);
            const fullName = `${formData.lastName} ${formData.firstName}`.trim();

            const payload = {
                orderItems: cart.map((item) => ({
                    product: item.product.id,
                    productId: item.product.id,
                    name: item.product.name,
                    image: item.product.image,
                    qty: item.quantity,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
                shippingAddress: {
                    address: formData.address,
                    ward: formData.ward,
                    district: formData.district,
                    city: formData.city,
                    phone: phoneDigits,
                    fullName,
                },
                paymentMethod: formData.paymentMethod,
                shippingPrice: shipping,
                taxPrice: tax,
                totalPrice: total,
                itemsPrice: subtotal,
            };

            const newOrder = await createOrder(payload);
            setCreatedOrder(newOrder);
            clearCart();
            setCurrentStep(3);
        } catch (error) {
            setCheckoutError(error.message || 'Không thể tạo đơn hàng.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div className="checkout">
            <div className="container">
                {/* Thanh tiến trình */}
                <div className="checkout__progress">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="checkout__progress-step-wrap">
                            <div
                                className={`checkout__progress-step ${currentStep === step.id ? 'checkout__progress-step--active' : ''
                                    } ${currentStep > step.id ? 'checkout__progress-step--done' : ''}`}
                                onClick={() => { if (step.id < currentStep) setCurrentStep(step.id); }}
                            >
                                <div className="checkout__progress-circle">
                                    {currentStep > step.id ? <FiCheck size={16} /> : step.icon}
                                </div>
                                <span className="checkout__progress-label">{step.label}</span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`checkout__progress-line ${currentStep > step.id ? 'checkout__progress-line--done' : ''}`}></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="checkout__layout">
                    {/* Form */}
                    <div className="checkout__form-area">
                        {/* Thông báo khách vãng lai */}
                        {currentStep < 3 && !isLoggedIn && (
                            <div className="checkout__guest-notice">
                                <span>Vui lòng đăng nhập để hoàn tất đặt hàng và theo dõi trạng thái đơn.</span>
                                <Link to="/login">Đăng nhập ngay</Link>
                            </div>
                        )}

                        {/* Bước 1: Vận chuyển */}
                        {currentStep === 1 && (
                            <div className="checkout__step">
                                <h2 className="checkout__step-title">Thông tin giao hàng</h2>

                                <div className="checkout__field">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        autoComplete="email"
                                    />
                                    {fieldErrors.email && <p className="checkout__field-error">{fieldErrors.email}</p>}
                                </div>

                                <div className="checkout__field-row">
                                    <div className="checkout__field">
                                        <label>Họ</label>
                                        <input
                                            type="text"
                                            placeholder="Nguyễn"
                                            value={formData.lastName}
                                            onChange={(e) => updateField('lastName', e.target.value)}
                                            autoComplete="family-name"
                                        />
                                        {fieldErrors.lastName && <p className="checkout__field-error">{fieldErrors.lastName}</p>}
                                    </div>
                                    <div className="checkout__field">
                                        <label>Tên</label>
                                        <input
                                            type="text"
                                            placeholder="Văn A"
                                            value={formData.firstName}
                                            onChange={(e) => updateField('firstName', e.target.value)}
                                            autoComplete="given-name"
                                        />
                                        {fieldErrors.firstName && <p className="checkout__field-error">{fieldErrors.firstName}</p>}
                                    </div>
                                </div>

                                <div className="checkout__field">
                                    <label>Địa chỉ</label>
                                    <input
                                        type="text"
                                        placeholder="123 Nguyễn Huệ, Quận 1"
                                        value={formData.address}
                                        onChange={(e) => updateField('address', e.target.value)}
                                        autoComplete="street-address"
                                    />
                                    {fieldErrors.address && <p className="checkout__field-error">{fieldErrors.address}</p>}
                                </div>

                                <div className="checkout__field-row checkout__field-row--3">
                                    <div className="checkout__field">
                                        <label>Tỉnh / Thành phố</label>
                                        <input
                                            type="text"
                                            placeholder="TP. Hồ Chí Minh"
                                            value={formData.city}
                                            onChange={(e) => updateField('city', e.target.value)}
                                            autoComplete="address-level1"
                                        />
                                        {fieldErrors.city && <p className="checkout__field-error">{fieldErrors.city}</p>}
                                    </div>
                                    <div className="checkout__field">
                                        <label>Quận / Huyện</label>
                                        <input
                                            type="text"
                                            placeholder="Quận 1"
                                            value={formData.district}
                                            onChange={(e) => updateField('district', e.target.value)}
                                            autoComplete="address-level2"
                                        />
                                        {fieldErrors.district && <p className="checkout__field-error">{fieldErrors.district}</p>}
                                    </div>
                                    <div className="checkout__field">
                                        <label>Phường / Xã</label>
                                        <input
                                            type="text"
                                            placeholder="Phường Bến Nghé"
                                            value={formData.ward}
                                            onChange={(e) => updateField('ward', e.target.value)}
                                            autoComplete="address-level3"
                                        />
                                        {fieldErrors.ward && <p className="checkout__field-error">{fieldErrors.ward}</p>}
                                    </div>
                                </div>

                                <div className="checkout__field">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        placeholder="0901 234 567"
                                        value={formData.phone}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                        autoComplete="tel"
                                    />
                                    {fieldErrors.phone && <p className="checkout__field-error">{fieldErrors.phone}</p>}
                                </div>

                                <h3 className="checkout__section-title">Phương thức vận chuyển</h3>
                                <div className="checkout__shipping-options">
                                    <label className={`checkout__shipping-option ${formData.shippingMethod === 'standard' ? 'checkout__shipping-option--active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value="standard"
                                            checked={formData.shippingMethod === 'standard'}
                                            onChange={() => updateField('shippingMethod', 'standard')}
                                        />
                                        <div className="checkout__shipping-radio"></div>
                                        <div className="checkout__shipping-info">
                                            <strong>Giao hàng tiêu chuẩn</strong>
                                            <span>3-5 ngày làm việc</span>
                                        </div>
                                        <span className="checkout__shipping-price">{subtotal >= 2000000 ? 'MIỄN PHÍ' : '30.000₫'}</span>
                                    </label>
                                    <label className={`checkout__shipping-option ${formData.shippingMethod === 'express' ? 'checkout__shipping-option--active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value="express"
                                            checked={formData.shippingMethod === 'express'}
                                            onChange={() => updateField('shippingMethod', 'express')}
                                        />
                                        <div className="checkout__shipping-radio"></div>
                                        <div className="checkout__shipping-info">
                                            <strong>Giao hàng nhanh</strong>
                                            <span>1-2 ngày làm việc</span>
                                        </div>
                                        <span className="checkout__shipping-price">50.000₫</span>
                                    </label>
                                </div>

                                <button
                                    className="btn btn-accent btn-lg checkout__continue"
                                    onClick={nextStep}
                                    disabled={cart.length === 0}
                                >
                                    Tiếp tục thanh toán
                                </button>
                                {checkoutError && <p style={{ color: 'var(--danger)', marginTop: '10px' }}>{checkoutError}</p>}
                            </div>
                        )}

                        {/* Bước 2: Thanh toán */}
                        {currentStep === 2 && (
                            <div className="checkout__step">
                                <button className="checkout__back-btn" onClick={prevStep}>
                                    <FiChevronLeft /> Quay lại Vận chuyển
                                </button>

                                <h2 className="checkout__step-title">Thông tin thanh toán</h2>

                                <div className="checkout__payment-choice">
                                    <label>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={formData.paymentMethod === 'Credit Card'}
                                            onChange={() => updateField('paymentMethod', 'Credit Card')}
                                        />
                                        <span>Thẻ tín dụng/Ghi nợ</span>
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={formData.paymentMethod === 'COD'}
                                            onChange={() => updateField('paymentMethod', 'COD')}
                                        />
                                        <span>Thanh toán khi nhận hàng (COD)</span>
                                    </label>
                                </div>

                                {formData.paymentMethod === 'Credit Card' && (
                                    <>
                                        <div className="checkout__secure-badge">
                                            <FiLock size={16} />
                                            <span>Mã hóa SSL 256-bit — Thông tin của bạn được bảo mật</span>
                                        </div>

                                        <div className="checkout__field">
                                            <label>Tên chủ thẻ</label>
                                            <input
                                                type="text"
                                                placeholder="NGUYEN VAN A"
                                                value={formData.cardName}
                                                onChange={(e) => updateField('cardName', e.target.value)}
                                                autoComplete="cc-name"
                                            />
                                            {fieldErrors.cardName && <p className="checkout__field-error">{fieldErrors.cardName}</p>}
                                        </div>

                                        <div className="checkout__field">
                                            <label>Số thẻ</label>
                                            <div className="checkout__card-input-wrap">
                                                <input
                                                    type="text"
                                                    placeholder="1234 5678 9012 3456"
                                                    value={formData.cardNumber}
                                                    onChange={(e) => updateField('cardNumber', e.target.value)}
                                                    autoComplete="cc-number"
                                                />
                                                <div className="checkout__card-icons">
                                                    <span>💳</span>
                                                </div>
                                            </div>
                                            {fieldErrors.cardNumber && <p className="checkout__field-error">{fieldErrors.cardNumber}</p>}
                                        </div>

                                        <div className="checkout__field-row">
                                            <div className="checkout__field">
                                                <label>Ngày hết hạn</label>
                                                <input
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    value={formData.expiry}
                                                    onChange={(e) => updateField('expiry', e.target.value)}
                                                    autoComplete="cc-exp"
                                                />
                                                {fieldErrors.expiry && <p className="checkout__field-error">{fieldErrors.expiry}</p>}
                                            </div>
                                            <div className="checkout__field">
                                                <label>CVV</label>
                                                <input
                                                    type="text"
                                                    placeholder="123"
                                                    value={formData.cvv}
                                                    onChange={(e) => updateField('cvv', e.target.value)}
                                                    autoComplete="cc-csc"
                                                />
                                                {fieldErrors.cvv && <p className="checkout__field-error">{fieldErrors.cvv}</p>}
                                            </div>
                                        </div>

                                        <div className="checkout__payment-methods">
                                            <span className="checkout__pm-label">Chấp nhận:</span>
                                            <div className="checkout__pm-icons">
                                                {['💳 Visa', '💳 MC', '💳 AMEX', '🏦 Chuyển khoản'].map((m, i) => (
                                                    <span key={i} className="checkout__pm-icon">{m}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {formData.paymentMethod === 'COD' && (
                                    <div className="checkout__secure-badge" style={{ background: '#fff7ed', borderColor: '#fdba74', color: '#c2410c' }}>
                                        <FiTruck size={16} />
                                        <span>Bạn sẽ thanh toán khi nhận hàng. Vui lòng giữ điện thoại để shipper liên hệ.</span>
                                    </div>
                                )}

                                <button
                                    className="btn btn-accent btn-lg checkout__continue"
                                    onClick={handlePlaceOrder}
                                    disabled={isPlacingOrder}
                                >
                                    <FiLock size={16} /> {isPlacingOrder ? 'Đang xử lý...' : `Đặt hàng — ${formatVND(total)}`}
                                </button>

                                {checkoutError && <p style={{ color: 'var(--danger)', marginTop: '10px' }}>{checkoutError}</p>}

                                <p className="checkout__terms">
                                    Bằng việc đặt hàng, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a> của chúng tôi.
                                </p>
                            </div>
                        )}

                        {/* Bước 3: Xác nhận */}
                        {currentStep === 3 && (
                            <div className="checkout__step checkout__confirmation">
                                <div className="checkout__success-icon">
                                    <FiCheck size={40} />
                                </div>
                                <h2 className="checkout__confirmation-title">Đặt hàng thành công! 🎉</h2>
                                <p className="checkout__confirmation-text">
                                    Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã được đặt thành công.
                                </p>
                                <div className="checkout__order-details">
                                    <div className="checkout__order-row">
                                        <span>Mã đơn hàng</span>
                                        <strong>{createdOrder?.id || createdOrder?._id || '#ES-2026-8742'}</strong>
                                    </div>
                                    <div className="checkout__order-row">
                                        <span>Dự kiến giao hàng</span>
                                        <strong>20/02 - 22/02/2026</strong>
                                    </div>
                                    <div className="checkout__order-row">
                                        <span>Tổng thanh toán</span>
                                        <strong>{formatVND(total)}</strong>
                                    </div>
                                </div>
                                <p className="checkout__confirmation-email">
                                    Email xác nhận đã được gửi đến <strong>{formData.email || 'email của bạn'}</strong>
                                </p>
                                <div className="checkout__confirmation-actions">
                                    <Link to="/" className="btn btn-primary btn-lg">Tiếp tục mua sắm</Link>
                                    <Link to="/profile?tab=orders" className="btn btn-outline">Theo dõi đơn hàng</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tóm tắt đơn hàng */}
                    {currentStep < 3 && (
                        <aside className="checkout__summary">
                            <h3 className="checkout__summary-title">Tóm tắt đơn hàng</h3>

                            <div className="checkout__summary-items">
                                {cart.length === 0 ? (
                                    <p style={{ color: 'var(--gray-600)', padding: '8px 0' }}>
                                        Giỏ hàng đang trống.
                                    </p>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.product.id} className="checkout__summary-item">
                                            <img src={item.product.image} alt={item.product.name} className="checkout__summary-img" />
                                            <div className="checkout__summary-item-info">
                                                <p className="checkout__summary-item-name">{item.product.name}</p>
                                                <div className="checkout__summary-item-qty">
                                                    <button onClick={() => updateQuantity(item.product.id, -1, item.quantity)}><FiMinus size={12} /></button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product.id, 1, item.quantity)}><FiPlus size={12} /></button>
                                                </div>
                                            </div>
                                            <div className="checkout__summary-item-right">
                                                <span className="checkout__summary-item-price">{formatVND(item.product.price * item.quantity)}</span>
                                                <button className="checkout__summary-remove" onClick={() => removeItem(item.product.id)}>
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Mã giảm giá */}
                            <div className="checkout__promo">
                                <input
                                    type="text"
                                    placeholder="Mã giảm giá"
                                    value={formData.promoCode}
                                    onChange={(e) => updateField('promoCode', e.target.value)}
                                />
                                <button className="btn btn-primary btn-sm">Áp dụng</button>
                            </div>

                            {/* Tổng cộng */}
                            <div className="checkout__totals">
                                <div className="checkout__total-row">
                                    <span>Tạm tính</span>
                                    <span>{formatVND(subtotal)}</span>
                                </div>
                                <div className="checkout__total-row">
                                    <span>Phí vận chuyển</span>
                                    <span>{shipping === 0 ? 'MIỄN PHÍ' : formatVND(shipping)}</span>
                                </div>
                                <div className="checkout__total-row checkout__total-row--grand">
                                    <span>Tổng cộng</span>
                                    <span>{formatVND(total)}</span>
                                </div>
                            </div>

                            {/* Cam kết an toàn */}
                            <div className="checkout__trust-badges">
                                <div className="checkout__trust-badge">
                                    <FiShield size={16} />
                                    <span>Thanh toán an toàn</span>
                                </div>
                                <div className="checkout__trust-badge">
                                    <FiLock size={16} />
                                    <span>Mã hóa SSL</span>
                                </div>
                                <div className="checkout__trust-badge">
                                    <span>💰</span>
                                    <span>Cam kết hoàn tiền</span>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
}
