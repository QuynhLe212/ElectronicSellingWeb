import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiSettings,
  FiLogOut,
  FiEdit2,
  FiPhone,
  FiMail,
  FiCalendar,
  FiChevronRight,
  FiCamera,
  FiX,
} from "react-icons/fi";
import {
  changeMyPassword,
  clearSession,
  getMe,
  logout,
  updateMyProfile,
  uploadAvatar,
} from "../services/authService";
import { getMyOrders } from "../services/ordersService";
import "./ProfilePage.css";

const DEFAULT_AVATAR_URL = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";
const DEFAULT_MEMBER_SINCE = "--/----";

function formatVND(price) {
  return price.toLocaleString("vi-VN") + "₫";
}

const tabs = [
  { id: "overview", label: "Tổng quan", icon: <FiUser size={18} /> },
  { id: "orders", label: "Đơn hàng", icon: <FiPackage size={18} /> },
  { id: "addresses", label: "Địa chỉ", icon: <FiMapPin size={18} /> },
  { id: "settings", label: "Cài đặt", icon: <FiSettings size={18} /> },
  { id: "admin", label: "Admin", icon: <FiSettings size={18} /> },
];

function splitName(fullName = "") {
  const safeName = fullName.trim();
  if (!safeName) return { firstName: "", lastName: "" };
  const parts = safeName.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

function formatMemberSince(dateString) {
  if (!dateString) return DEFAULT_MEMBER_SINCE;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return DEFAULT_MEMBER_SINCE;
  return date.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" });
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState({ type: "", text: "" });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [addressMessage, setAddressMessage] = useState({ type: "", text: "" });
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    createdAt: "",
    avatarUrl: DEFAULT_AVATAR_URL,
    address: {
      street: "",
      city: "",
      district: "",
      ward: "",
      zipCode: "",
    },
  });
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [addressData, setAddressData] = useState({
    street: "",
    ward: "",
    district: "",
    city: "",
    zipCode: "",
  });
  const [settings, setSettings] = useState({
    emailNotif: true,
    smsNotif: false,
    promoNotif: true,
    orderNotif: true,
  });
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const userDisplayName = useMemo(() => {
    const combined = `${profileData.firstName} ${profileData.lastName}`.trim();
    return combined || userInfo.name || "Người dùng";
  }, [profileData.firstName, profileData.lastName, userInfo.name]);

  const hasAddress = useMemo(() => (
    Object.values(addressData).some((value) => String(value || "").trim())
  ), [addressData]);

  const formattedAddress = useMemo(() => {
    return [
      addressData.street,
      addressData.ward,
      addressData.district,
      addressData.city,
      addressData.zipCode,
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(", ");
  }, [addressData]);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsProfileLoading(true);
        const data = await getMe();
        const user = data?.user;
        if (!user) {
          throw new Error("Không lấy được thông tin người dùng.");
        }

        const parsedName = splitName(user.name);
        setUserInfo({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || "user",
          createdAt: user.createdAt || "",
          avatarUrl: user?.avatar?.url || DEFAULT_AVATAR_URL,
          address: {
            street: user?.address?.street || "",
            city: user?.address?.city || "",
            district: user?.address?.district || "",
            ward: user?.address?.ward || "",
            zipCode: user?.address?.zipCode || "",
          },
        });
        setProfileData({
          firstName: parsedName.firstName,
          lastName: parsedName.lastName,
          email: user.email || "",
          phone: user.phone || "",
        });
        setAddressData({
          street: user?.address?.street || "",
          ward: user?.address?.ward || "",
          district: user?.address?.district || "",
          city: user?.address?.city || "",
          zipCode: user?.address?.zipCode || "",
        });

        try {
          setIsOrdersLoading(true);
          setOrdersError("");
          const myOrders = await getMyOrders();
          setOrders(Array.isArray(myOrders) ? myOrders : []);
        } catch (orderError) {
          setOrders([]);
          setOrdersError(orderError.message || "Không thể tải danh sách đơn hàng.");
        }
      } catch (error) {
        clearSession();
        navigate("/login");
      } finally {
        setIsProfileLoading(false);
        setIsOrdersLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const updateProfile = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field, value) => {
    setAddressData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
    if (!fullName) {
      setProfileMessage({ type: "error", text: "Họ tên không được để trống." });
      return;
    }

    try {
      setIsSaving(true);
      setProfileMessage({ type: "", text: "" });
      const response = await updateMyProfile({
        name: fullName,
        phone: profileData.phone,
      });

      const updatedUser = response?.user;
      setUserInfo((prev) => ({
        ...prev,
        name: updatedUser?.name || fullName,
        phone: updatedUser?.phone || profileData.phone,
      }));
      setEditingProfile(false);
      setProfileMessage({ type: "success", text: "Cập nhật thông tin thành công." });
    } catch (error) {
      setProfileMessage({ type: "error", text: error.message || "Cập nhật thất bại." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Cho phép đăng xuất local ngay cả khi API logout gặp lỗi.
    } finally {
      clearSession();
      navigate("/login");
    }
  };

  const handleSaveAddress = async () => {
    const normalizedAddress = {
      street: String(addressData.street || "").trim(),
      ward: String(addressData.ward || "").trim(),
      district: String(addressData.district || "").trim(),
      city: String(addressData.city || "").trim(),
      zipCode: String(addressData.zipCode || "").trim(),
    };

    if (!Object.values(normalizedAddress).some(Boolean)) {
      setAddressMessage({ type: "error", text: "Vui lòng nhập ít nhất một thông tin địa chỉ." });
      return;
    }

    try {
      setIsSavingAddress(true);
      setAddressMessage({ type: "", text: "" });
      const response = await updateMyProfile({ address: normalizedAddress });
      const updatedAddress = response?.user?.address || normalizedAddress;

      setAddressData({
        street: updatedAddress.street || "",
        ward: updatedAddress.ward || "",
        district: updatedAddress.district || "",
        city: updatedAddress.city || "",
        zipCode: updatedAddress.zipCode || "",
      });
      setUserInfo((prev) => ({
        ...prev,
        address: {
          street: updatedAddress.street || "",
          ward: updatedAddress.ward || "",
          district: updatedAddress.district || "",
          city: updatedAddress.city || "",
          zipCode: updatedAddress.zipCode || "",
        },
      }));
      setEditingAddress(false);
      setAddressMessage({ type: "success", text: "Đã cập nhật địa chỉ thành công." });
    } catch (error) {
      setAddressMessage({ type: "error", text: error.message || "Không thể cập nhật địa chỉ." });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordMessage({ type: "error", text: "Vui lòng nhập đủ thông tin mật khẩu." });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Xác nhận mật khẩu mới không khớp." });
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordMessage({ type: "", text: "" });
      await changeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage({ type: "success", text: "Đổi mật khẩu thành công." });
    } catch (error) {
      setPasswordMessage({ type: "error", text: error.message || "Không thể đổi mật khẩu." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarMessage({ type: "error", text: "Vui lòng chọn file hình ảnh." });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarMessage({ type: "error", text: "Kích thước file không được vượt quá 2MB." });
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setAvatarMessage({ type: "", text: "" });

      const response = await uploadAvatar(file);
      const avatarUrl =
        (response && response.avatar && response.avatar.url) ||
        (response && response.user && response.user.avatar && response.user.avatar.url);

      if (avatarUrl) {
        setUserInfo((prev) => ({
          ...prev,
          avatarUrl: avatarUrl,
        }));
        setAvatarMessage({ type: "success", text: "Cập nhật avatar thành công." });
        // Close modal after successful upload with a small delay to show success message
        setTimeout(() => {
          setShowAvatarModal(false);
        }, 1500);
      } else {
        throw new Error("Không nhận được URL avatar từ server.");
      }
    } catch (error) {
      setAvatarMessage({ type: "error", text: error.message || "Không thể tải avatar lên." });
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const orderStats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + Number(order.total || order.totalPrice || 0),
      0,
    );

    return {
      totalOrders,
      totalSpent,
    };
  }, [orders]);

  return (
    <div className="profile">
      <div className="container">
        {/* Header */}
        <div className="profile__header">
          <div className="profile__header-bg"></div>
          <div className="profile__header-content">
            <div className="profile__avatar-wrap">
              <img
                src={userInfo.avatarUrl}
                alt="Avatar"
                className="profile__avatar"
              />
              <button
                className="profile__avatar-edit"
                onClick={() => setShowAvatarModal(true)}
                disabled={isUploadingAvatar}
                title="Nhấp để thay đổi avatar"
              >
                <FiEdit2 size={14} />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
              />
            </div>
            <div className="profile__header-info">
              <h1 className="profile__name">{userDisplayName}</h1>
              <div className="profile__meta">
                <span>
                  <FiMail size={14} /> {userInfo.email || profileData.email}
                </span>
                <span>
                  <FiPhone size={14} /> {userInfo.phone || profileData.phone || "Chưa cập nhật"}
                </span>
                <span>
                  <FiCalendar size={14} /> Thành viên từ {formatMemberSince(userInfo.createdAt)}
                </span>
              </div>
              <div className="profile__badges">
                <span className="profile__tier-badge">
                  Vai trò: {userInfo.role === "admin" ? "Quản trị viên" : "Người dùng"}
                </span>
              </div>
            </div>
          </div>

          {avatarMessage.text && (
            <div style={{
              marginTop: "12px",
              padding: "10px 12px",
              borderRadius: "4px",
              color: avatarMessage.type === "error" ? "#d32f2f" : "#2e7d32",
              backgroundColor: avatarMessage.type === "error" ? "#ffebee" : "#f1f8e9",
              fontSize: "14px",
            }}>
              {avatarMessage.text}
            </div>
          )}

          {/* Stats */}
          <div className="profile__stats">
            <div className="profile__stat">
              <span className="profile__stat-num">{orderStats.totalOrders}</span>
              <span className="profile__stat-label">Đơn hàng</span>
            </div>
            <div className="profile__stat">
              <span className="profile__stat-num">{hasAddress ? 1 : 0}</span>
              <span className="profile__stat-label">Địa chỉ</span>
            </div>
            <div className="profile__stat">
              <span className="profile__stat-num">{formatVND(orderStats.totalSpent)}</span>
              <span className="profile__stat-label">Tổng chi tiêu</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="profile__layout">
          {/* Sidebar */}
          <aside className="profile__sidebar">
            <nav className="profile__nav">
              {tabs
                .filter((tab) => tab.id !== "admin" || userInfo.role === "admin")
                .map((tab) => (
                <button
                  key={tab.id}
                  className={`profile__nav-btn ${activeTab === tab.id ? "profile__nav-btn--active" : ""}`}
                  onClick={() => {
                    if (tab.id === "admin") {
                      if (userInfo.role === "admin") {
                        navigate("/admin");
                      }
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <FiChevronRight size={16} className="profile__nav-arrow" />
                </button>
              ))}
            </nav>
            <button
              className="profile__nav-btn profile__nav-btn--logout"
              onClick={handleLogout}
            >
              <FiLogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </aside>

          {/* Main Content */}
          <main className="profile__main">
            {isProfileLoading && (
              <div className="profile__section">
                <p>Đang tải thông tin tài khoản...</p>
              </div>
            )}

            {!isProfileLoading && (
              <>
            {/* ===== TỔNG QUAN ===== */}
            {activeTab === "overview" && (
              <div className="profile__section">
                <div className="profile__section-header">
                  <h2>Thông tin cá nhân</h2>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setEditingProfile(!editingProfile)}
                  >
                    <FiEdit2 size={14} /> {editingProfile ? "Hủy" : "Chỉnh sửa"}
                  </button>
                </div>

                <div className="profile__info-card">
                  {profileMessage.text && (
                    <p style={{ color: profileMessage.type === "error" ? "#d32f2f" : "#2e7d32", marginBottom: "12px" }}>
                      {profileMessage.text}
                    </p>
                  )}
                  {editingProfile ? (
                    <div className="profile__edit-form">
                      <div className="profile__edit-row">
                        <div className="profile__edit-field">
                          <label>Họ</label>
                          <input
                            value={profileData.firstName}
                            onChange={(e) =>
                              updateProfile("firstName", e.target.value)
                            }
                          />
                        </div>
                        <div className="profile__edit-field">
                          <label>Tên</label>
                          <input
                            value={profileData.lastName}
                            onChange={(e) =>
                              updateProfile("lastName", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="profile__edit-field">
                        <label>Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                        />
                      </div>
                      <div className="profile__edit-field">
                        <label>Số điện thoại</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            updateProfile("phone", e.target.value)
                          }
                        />
                      </div>
                      <div className="profile__edit-actions">
                        <button
                          className="btn btn-accent btn-sm"
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                        >
                          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setEditingProfile(false)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="profile__info-grid">
                      <div className="profile__info-item">
                        <span className="profile__info-label">Họ và tên</span>
                        <span className="profile__info-value">
                          {profileData.firstName} {profileData.lastName}
                        </span>
                      </div>
                      <div className="profile__info-item">
                        <span className="profile__info-label">Email</span>
                        <span className="profile__info-value">
                          {profileData.email}
                        </span>
                      </div>
                      <div className="profile__info-item">
                        <span className="profile__info-label">
                          Số điện thoại
                        </span>
                        <span className="profile__info-value">
                          {profileData.phone}
                        </span>
                      </div>
                      <div className="profile__info-item">
                        <span className="profile__info-label">
                          Thành viên từ
                        </span>
                        <span className="profile__info-value">
                          {formatMemberSince(userInfo.createdAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {orderStats.totalOrders === 0 ? (
                  <div className="profile__empty" style={{ marginTop: "24px" }}>
                    <FiPackage size={40} />
                    <p>Chưa có đơn hàng</p>
                  </div>
                ) : (
                  <div style={{ marginTop: "24px", display: "grid", gap: "10px" }}>
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id || order._id} className="profile__info-card">
                        <strong>Đơn #{order.id || order._id}</strong>
                        <p>Trạng thái: {order.statusLabel || order.status || "Đang xử lý"}</p>
                        <p>Tổng tiền: {formatVND(Number(order.total || order.totalPrice || 0))}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

              </>
            )}

            {/* ===== ĐƠN HÀNG ===== */}
            {activeTab === "orders" && (
              <div className="profile__section">
                <div className="profile__section-header">
                  <h2>Đơn hàng của tôi</h2>
                </div>

                {isOrdersLoading && <p>Đang tải đơn hàng...</p>}
                {!isOrdersLoading && ordersError && (
                  <p style={{ color: "var(--danger)" }}>{ordersError}</p>
                )}
                {!isOrdersLoading && !ordersError && orders.length === 0 && (
                  <div className="profile__empty">
                    <FiPackage size={48} />
                    <p>Chưa có dữ liệu đơn hàng.</p>
                  </div>
                )}
                {!isOrdersLoading && !ordersError && orders.length > 0 && (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {orders.map((order) => (
                      <div key={order.id || order._id} className="profile__info-card">
                        <div className="profile__section-header" style={{ marginBottom: "10px" }}>
                          <h3 style={{ fontSize: "16px" }}>Đơn #{order.id || order._id}</h3>
                        </div>
                        <div className="profile__info-grid">
                          <div className="profile__info-item">
                            <span className="profile__info-label">Ngày đặt</span>
                            <span className="profile__info-value">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                                : order.date || "-"}
                            </span>
                          </div>
                          <div className="profile__info-item">
                            <span className="profile__info-label">Trạng thái</span>
                            <span className="profile__info-value">{order.statusLabel || order.status || "Đang xử lý"}</span>
                          </div>
                          <div className="profile__info-item">
                            <span className="profile__info-label">Tổng tiền</span>
                            <span className="profile__info-value">
                              {formatVND(Number(order.total || order.totalPrice || 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== ĐỊA CHỈ ===== */}
            {activeTab === "addresses" && (
              <div className="profile__section">
                <div className="profile__section-header">
                  <h2>Sổ địa chỉ</h2>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setEditingAddress((prev) => !prev);
                      setAddressMessage({ type: "", text: "" });
                    }}
                  >
                    <FiEdit2 size={14} /> {editingAddress ? "Hủy" : hasAddress ? "Chỉnh sửa" : "Thêm địa chỉ"}
                  </button>
                </div>

                <div className="profile__info-card">
                  {addressMessage.text && (
                    <p style={{ color: addressMessage.type === "error" ? "var(--danger)" : "var(--success)", marginBottom: "12px" }}>
                      {addressMessage.text}
                    </p>
                  )}

                  {editingAddress ? (
                    <div className="profile__edit-form">
                      <div className="profile__edit-field">
                        <label>Địa chỉ cụ thể</label>
                        <input
                          value={addressData.street}
                          onChange={(e) => updateAddress("street", e.target.value)}
                          placeholder="Số nhà, tên đường"
                          autoComplete="street-address"
                        />
                      </div>

                      <div className="profile__edit-row">
                        <div className="profile__edit-field">
                          <label>Phường/Xã</label>
                          <input
                            value={addressData.ward}
                            onChange={(e) => updateAddress("ward", e.target.value)}
                            autoComplete="address-level3"
                          />
                        </div>
                        <div className="profile__edit-field">
                          <label>Quận/Huyện</label>
                          <input
                            value={addressData.district}
                            onChange={(e) => updateAddress("district", e.target.value)}
                            autoComplete="address-level2"
                          />
                        </div>
                      </div>

                      <div className="profile__edit-row">
                        <div className="profile__edit-field">
                          <label>Tỉnh/Thành phố</label>
                          <input
                            value={addressData.city}
                            onChange={(e) => updateAddress("city", e.target.value)}
                            autoComplete="address-level1"
                          />
                        </div>
                        <div className="profile__edit-field">
                          <label>Mã bưu chính</label>
                          <input
                            value={addressData.zipCode}
                            onChange={(e) => updateAddress("zipCode", e.target.value)}
                            autoComplete="postal-code"
                          />
                        </div>
                      </div>

                      <div className="profile__edit-actions">
                        <button
                          className="btn btn-accent btn-sm"
                          onClick={handleSaveAddress}
                          disabled={isSavingAddress}
                        >
                          {isSavingAddress ? "Đang lưu..." : "Lưu địa chỉ"}
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setEditingAddress(false)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : hasAddress ? (
                    <div className="profile__info-grid" style={{ gridTemplateColumns: "1fr" }}>
                      <div className="profile__info-item">
                        <span className="profile__info-label">Địa chỉ mặc định</span>
                        <span className="profile__info-value">{formattedAddress}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="profile__empty">
                      <FiMapPin size={48} />
                      <p>Bạn chưa thêm địa chỉ nào.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== CÀI ĐẶT ===== */}
            {activeTab === "settings" && (
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
                        <p>Cập nhật mật khẩu để bảo vệ tài khoản tốt hơn</p>
                      </div>
                    </div>
                    <div className="profile__edit-form" style={{ width: "100%" }}>
                      <div className="profile__edit-field">
                        <label>Mật khẩu hiện tại</label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                          }
                        />
                      </div>
                      <div className="profile__edit-field">
                        <label>Mật khẩu mới</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                          }
                        />
                      </div>
                      <div className="profile__edit-field">
                        <label>Xác nhận mật khẩu mới</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                          }
                        />
                      </div>
                      {passwordMessage.text && (
                        <p style={{ color: passwordMessage.type === "error" ? "var(--danger)" : "var(--success)" }}>
                          {passwordMessage.text}
                        </p>
                      )}
                      <div className="profile__edit-actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={handleChangePassword}
                          disabled={isChangingPassword}
                        >
                          {isChangingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                        </button>
                      </div>
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
                      {
                        key: "emailNotif",
                        label: "Thông báo qua Email",
                        desc: "Nhận thông báo đơn hàng và cập nhật qua email",
                      },
                      {
                        key: "smsNotif",
                        label: "Thông báo qua SMS",
                        desc: "Nhận tin nhắn cập nhật đơn hàng",
                      },
                      {
                        key: "promoNotif",
                        label: "Khuyến mãi",
                        desc: "Nhận thông tin ưu đãi và khuyến mãi",
                      },
                      {
                        key: "orderNotif",
                        label: "Cập nhật đơn hàng",
                        desc: "Nhận thông báo khi trạng thái đơn hàng thay đổi",
                      },
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
                            onChange={() =>
                              setSettings((prev) => ({
                                ...prev,
                                [item.key]: !prev[item.key],
                              }))
                            }
                          />
                          <span className="profile__toggle-slider"></span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Xóa tài khoản */}
                <div className="profile__settings-group">
                  <h3 className="profile__settings-title profile__settings-title--danger">
                    Vùng nguy hiểm
                  </h3>
                  <div className="profile__settings-card profile__settings-card--danger">
                    <div className="profile__settings-item">
                      <div>
                        <strong>Xóa tài khoản</strong>
                        <p>
                          Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu. Hành động
                          này không thể hoàn tác.
                        </p>
                      </div>
                      <button className="btn btn-sm profile__btn-danger">
                        Xóa tài khoản
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Avatar Modal */}
        {showAvatarModal && (
          <div className="profile__modal-overlay" onClick={() => setShowAvatarModal(false)}>
            <div className="profile__modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="profile__modal-close"
                onClick={() => setShowAvatarModal(false)}
                title="Đóng"
              >
                <FiX size={24} />
              </button>

              <h2 className="profile__modal-title">Chọn ảnh đại diện</h2>

              <div className="profile__modal-content">
                <div className="profile__modal-icon">
                  <FiCamera size={48} />
                </div>
                <p className="profile__modal-description">
                  Chọn một hình ảnh từ thiết bị của bạn
                </p>
              </div>

              <div className="profile__modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (avatarInputRef.current) {
                      avatarInputRef.current.click();
                    }
                  }}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? "Đang tải lên..." : "Chọn ảnh"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowAvatarModal(false)}
                  disabled={isUploadingAvatar}
                >
                  Hủy
                </button>
              </div>

              {avatarMessage.text && (
                <div
                  className={`profile__modal-message profile__modal-message--${avatarMessage.type}`}
                >
                  {avatarMessage.text}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
