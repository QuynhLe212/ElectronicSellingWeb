import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiUser, FiPackage, FiMapPin, FiHeart, FiSettings, FiLogOut,
    FiEdit2, FiPhone, FiMail, FiCalendar, FiAward, FiStar,
    FiChevronRight, FiPlus, FiTrash2, FiEye, FiShoppingCart,
    FiTruck, FiCheckCircle, FiXCircle, FiClock
} from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { mockUser, mockOrders, mockAddresses, products } from '../data/data';
import './ProfilePage.css';

function formatVND(price) {
    return price.toLocaleString('vi-VN') + '₫';
}

const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: <FiUser size={18} /> },
    { id: 'orders', label: 'Đơn hàng', icon: <FiPackage size={18} /> },
    { id: 'addresses', label: 'Địa chỉ', icon: <FiMapPin size={18} /> },
    { id: 'wishlist', label: 'Yêu thích', icon: <FiHeart size={18} /> },
    { id: 'settings', label: 'Cài đặt', icon: <FiSettings size={18} /> },
];

const orderStatusIcon = {
    delivered: <FiCheckCircle size={16} />,
    shipping: <FiTruck size={16} />,
    processing: <FiClock size={16} />,
    cancelled: <FiXCircle size={16} />,
};

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [orderFilter, setOrderFilter] = useState('all');
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        phone: mockUser.phone,
    });
    const [settings, setSettings] = useState({
        emailNotif: true,
        smsNotif: false,
        promoNotif: true,
        orderNotif: true,
    });

    const wishlistProducts = products.slice(2, 6);

    const filteredOrders = orderFilter === 'all'
        ? mockOrders
        : mockOrders.filter((o) => o.status === orderFilter);

    const updateProfile = (field, value) => {
        setProfileData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="profile">
            <div className="container">
                {/* Header */}
                <div className="profile__header">
                    <div className="profile__header-bg"></div>
                    <div className="profile__header-content">
                        <div className="profile__avatar-wrap">
                            <img src={mockUser.avatar} alt="Avatar" className="profile__avatar" />
                            <button className="profile__avatar-edit"><FiEdit2 size={14} /></button>
                        </div>
                        <div className="profile__header-info">
                            <h1 className="profile__name">{mockUser.firstName} {mockUser.lastName}</h1>
                            <div className="profile__meta">
                                <span><FiMail size={14} /> {mockUser.email}</span>
                                <span><FiPhone size={14} /> {mockUser.phone}</span>
                                <span><FiCalendar size={14} /> Thành viên từ {mockUser.memberSince}</span>
                            </div>
                            <div className="profile__badges">
                                <span className="profile__tier-badge">
                                    <FiAward size={14} /> Hạng {mockUser.tier}
                                </span>
                                <span className="profile__points-badge">
                                    <FiStar size={14} /> {mockUser.points.toLocaleString()} điểm
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="profile__stats">
                        <div className="profile__stat">
                            <span className="profile__stat-num">{mockUser.totalOrders}</span>
                            <span className="profile__stat-label">Đơn hàng</span>
                        </div>
                        <div className="profile__stat">
                            <span className="profile__stat-num">{wishlistProducts.length}</span>
                            <span className="profile__stat-label">Yêu thích</span>
                        </div>
                        <div className="profile__stat">
                            <span className="profile__stat-num">{formatVND(mockUser.totalSpent)}</span>
                            <span className="profile__stat-label">Tổng chi tiêu</span>
                        </div>
                        <div className="profile__stat">
                            <span className="profile__stat-num">{mockAddresses.length}</span>
                            <span className="profile__stat-label">Địa chỉ</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="profile__layout">
                    {/* Sidebar */}
                    <aside className="profile__sidebar">
                        <nav className="profile__nav">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`profile__nav-btn ${activeTab === tab.id ? 'profile__nav-btn--active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                    <FiChevronRight size={16} className="profile__nav-arrow" />
                                </button>
                            ))}
                        </nav>
                        <button className="profile__nav-btn profile__nav-btn--logout">
                            <FiLogOut size={18} />
                            <span>Đăng xuất</span>
                        </button>
                    </aside>

                    {/* Main Content */}
                    <main className="profile__main">
                        {/* ===== TỔNG QUAN ===== */}
                        {activeTab === 'overview' && (
                            <div className="profile__section">
                                <div className="profile__section-header">
                                    <h2>Thông tin cá nhân</h2>
                                    <button className="btn btn-outline btn-sm" onClick={() => setEditingProfile(!editingProfile)}>
                                        <FiEdit2 size={14} /> {editingProfile ? 'Hủy' : 'Chỉnh sửa'}
                                    </button>
                                </div>

                                <div className="profile__info-card">
                                    {editingProfile ? (
                                        <div className="profile__edit-form">
                                            <div className="profile__edit-row">
                                                <div className="profile__edit-field">
                                                    <label>Họ</label>
                                                    <input value={profileData.firstName} onChange={(e) => updateProfile('firstName', e.target.value)} />
                                                </div>
                                                <div className="profile__edit-field">
                                                    <label>Tên</label>
                                                    <input value={profileData.lastName} onChange={(e) => updateProfile('lastName', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="profile__edit-field">
                                                <label>Email</label>
                                                <input type="email" value={profileData.email} onChange={(e) => updateProfile('email', e.target.value)} />
                                            </div>
                                            <div className="profile__edit-field">
                                                <label>Số điện thoại</label>
                                                <input type="tel" value={profileData.phone} onChange={(e) => updateProfile('phone', e.target.value)} />
                                            </div>
                                            <div className="profile__edit-actions">
                                                <button className="btn btn-accent btn-sm" onClick={() => setEditingProfile(false)}>Lưu thay đổi</button>
                                                <button className="btn btn-outline btn-sm" onClick={() => setEditingProfile(false)}>Hủy</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="profile__info-grid">
                                            <div className="profile__info-item">
                                                <span className="profile__info-label">Họ và tên</span>
                                                <span className="profile__info-value">{profileData.firstName} {profileData.lastName}</span>
                                            </div>
                                            <div className="profile__info-item">
                                                <span className="profile__info-label">Email</span>
                                                <span className="profile__info-value">{profileData.email}</span>
                                            </div>
                                            <div className="profile__info-item">
                                                <span className="profile__info-label">Số điện thoại</span>
                                                <span className="profile__info-value">{profileData.phone}</span>
                                            </div>
                                            <div className="profile__info-item">
                                                <span className="profile__info-label">Thành viên từ</span>
                                                <span className="profile__info-value">{mockUser.memberSince}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Đơn hàng gần đây */}
                                <div className="profile__section-header" style={{ marginTop: '32px' }}>
                                    <h2>Đơn hàng gần đây</h2>
                                    <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('orders')}>
                                        Xem tất cả <FiChevronRight size={14} />
                                    </button>
                                </div>

                                <div className="profile__recent-orders">
                                    {mockOrders.slice(0, 2).map((order) => (
                                        <div key={order.id} className="profile__order-mini">
                                            <div className="profile__order-mini-left">
                                                <div className="profile__order-mini-images">
                                                    {order.items.slice(0, 3).map((item, i) => (
                                                        <img key={i} src={item.image} alt={item.product} className="profile__order-mini-img" />
                                                    ))}
                                                </div>
                                                <div>
                                                    <strong>#{order.id}</strong>
                                                    <span className="profile__order-mini-date">{order.date}</span>
                                                </div>
                                            </div>
                                            <div className="profile__order-mini-right">
                                                <span className={`profile__order-status profile__order-status--${order.status}`}>
                                                    {orderStatusIcon[order.status]} {order.statusLabel}
                                                </span>
                                                <strong>{formatVND(order.total)}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ===== ĐƠN HÀNG ===== */}
                        {activeTab === 'orders' && (
                            <div className="profile__section">
                                <div className="profile__section-header">
                                    <h2>Đơn hàng của tôi</h2>
                                </div>

                                <div className="profile__order-filters">
                                    {[
                                        { id: 'all', label: 'Tất cả' },
                                        { id: 'shipping', label: 'Đang giao' },
                                        { id: 'delivered', label: 'Đã giao' },
                                        { id: 'cancelled', label: 'Đã hủy' },
                                    ].map((f) => (
                                        <button
                                            key={f.id}
                                            className={`profile__order-filter ${orderFilter === f.id ? 'profile__order-filter--active' : ''}`}
                                            onClick={() => setOrderFilter(f.id)}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="profile__orders-list">
                                    {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                        <div key={order.id} className="profile__order-card">
                                            <div className="profile__order-header">
                                                <div className="profile__order-id">
                                                    <strong>Đơn hàng #{order.id}</strong>
                                                    <span>{order.date}</span>
                                                </div>
                                                <span className={`profile__order-status profile__order-status--${order.status}`}>
                                                    {orderStatusIcon[order.status]} {order.statusLabel}
                                                </span>
                                            </div>
                                            <div className="profile__order-items">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="profile__order-item">
                                                        <img src={item.image} alt={item.product} />
                                                        <div className="profile__order-item-info">
                                                            <p>{item.product}</p>
                                                            <span>x{item.qty}</span>
                                                        </div>
                                                        <span className="profile__order-item-price">{formatVND(item.price)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="profile__order-footer">
                                                <div className="profile__order-total">
                                                    Tổng: <strong>{formatVND(order.total)}</strong>
                                                </div>
                                                <div className="profile__order-actions">
                                                    <button className="btn btn-outline btn-sm"><FiEye size={14} /> Chi tiết</button>
                                                    {order.status === 'delivered' && (
                                                        <button className="btn btn-primary btn-sm"><FiShoppingCart size={14} /> Mua lại</button>
                                                    )}
                                                    {order.status === 'shipping' && (
                                                        <button className="btn btn-primary btn-sm"><FiTruck size={14} /> Theo dõi</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="profile__empty">
                                            <FiPackage size={48} />
                                            <p>Không có đơn hàng nào</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ===== ĐỊA CHỈ ===== */}
                        {activeTab === 'addresses' && (
                            <div className="profile__section">
                                <div className="profile__section-header">
                                    <h2>Sổ địa chỉ</h2>
                                    <button className="btn btn-primary btn-sm"><FiPlus size={14} /> Thêm địa chỉ</button>
                                </div>

                                <div className="profile__addresses">
                                    {mockAddresses.map((addr) => (
                                        <div key={addr.id} className={`profile__address-card ${addr.isDefault ? 'profile__address-card--default' : ''}`}>
                                            <div className="profile__address-header">
                                                <span className="profile__address-label">
                                                    {addr.label === 'Nhà riêng' ? '🏠' : '🏢'} {addr.label}
                                                </span>
                                                {addr.isDefault && <span className="profile__address-default">Mặc định</span>}
                                            </div>
                                            <div className="profile__address-body">
                                                <p className="profile__address-name">{addr.name}</p>
                                                <p>{addr.phone}</p>
                                                <p>{addr.address}</p>
                                                <p>{addr.district}, {addr.city}</p>
                                            </div>
                                            <div className="profile__address-actions">
                                                <button className="profile__address-btn"><FiEdit2 size={14} /> Sửa</button>
                                                {!addr.isDefault && (
                                                    <>
                                                        <button className="profile__address-btn profile__address-btn--default">Đặt mặc định</button>
                                                        <button className="profile__address-btn profile__address-btn--delete"><FiTrash2 size={14} /> Xóa</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Thêm địa chỉ mới */}
                                    <button className="profile__address-add">
                                        <FiPlus size={24} />
                                        <span>Thêm địa chỉ mới</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ===== YÊU THÍCH ===== */}
                        {activeTab === 'wishlist' && (
                            <div className="profile__section">
                                <div className="profile__section-header">
                                    <h2>Sản phẩm yêu thích ({wishlistProducts.length})</h2>
                                </div>

                                {wishlistProducts.length > 0 ? (
                                    <div className="profile__wishlist-grid">
                                        {wishlistProducts.map((product) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="profile__empty">
                                        <FiHeart size={48} />
                                        <p>Chưa có sản phẩm yêu thích</p>
                                        <Link to="/products" className="btn btn-primary">Khám phá sản phẩm</Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===== CÀI ĐẶT ===== */}
                        {activeTab === 'settings' && (
                            <div className="profile__section">
                                <div className="profile__section-header">
                                    <h2>Cài đặt tài khoản</h2>
                                </div>

                                {/* Đổi mật khẩu */}
                                <div className="profile__settings-group">
                                    <h3 className="profile__settings-title">Bảo mật</h3>
                                    <div className="profile__settings-card">
                                        <div className="profile__settings-item">
                                            <div>
                                                <strong>Mật khẩu</strong>
                                                <p>Cập nhật lần cuối: 15/01/2026</p>
                                            </div>
                                            <button className="btn btn-outline btn-sm">Đổi mật khẩu</button>
                                        </div>
                                        <div className="profile__settings-item">
                                            <div>
                                                <strong>Xác thực hai bước</strong>
                                                <p>Bảo vệ tài khoản với xác thực 2 yếu tố</p>
                                            </div>
                                            <label className="profile__toggle">
                                                <input type="checkbox" />
                                                <span className="profile__toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông báo */}
                                <div className="profile__settings-group">
                                    <h3 className="profile__settings-title">Thông báo</h3>
                                    <div className="profile__settings-card">
                                        {[
                                            { key: 'emailNotif', label: 'Thông báo qua Email', desc: 'Nhận thông báo đơn hàng và cập nhật qua email' },
                                            { key: 'smsNotif', label: 'Thông báo qua SMS', desc: 'Nhận tin nhắn cập nhật đơn hàng' },
                                            { key: 'promoNotif', label: 'Khuyến mãi', desc: 'Nhận thông tin ưu đãi và khuyến mãi' },
                                            { key: 'orderNotif', label: 'Cập nhật đơn hàng', desc: 'Nhận thông báo khi trạng thái đơn hàng thay đổi' },
                                        ].map((item) => (
                                            <div key={item.key} className="profile__settings-item">
                                                <div>
                                                    <strong>{item.label}</strong>
                                                    <p>{item.desc}</p>
                                                </div>
                                                <label className="profile__toggle">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings[item.key]}
                                                        onChange={() => setSettings((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                                                    />
                                                    <span className="profile__toggle-slider"></span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Xóa tài khoản */}
                                <div className="profile__settings-group">
                                    <h3 className="profile__settings-title profile__settings-title--danger">Vùng nguy hiểm</h3>
                                    <div className="profile__settings-card profile__settings-card--danger">
                                        <div className="profile__settings-item">
                                            <div>
                                                <strong>Xóa tài khoản</strong>
                                                <p>Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu. Hành động này không thể hoàn tác.</p>
                                            </div>
                                            <button className="btn btn-sm profile__btn-danger">Xóa tài khoản</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
