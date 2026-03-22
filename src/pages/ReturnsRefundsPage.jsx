import { FiRefreshCw, FiRotateCcw, FiPackage, FiCheckCircle, FiClock, FiAlertCircle, FiShield } from "react-icons/fi";
import "./ReturnsRefundsPage.css";

const policyItems = [
  {
    title: "Thời gian áp dụng",
    description:
      "Đổi trả trong 7 ngày kể từ ngày nhận hàng với hầu hết sản phẩm. Một số ngành hàng đặc thù có thể áp dụng 14-30 ngày theo mô tả sản phẩm.",
    icon: <FiClock size={18} />,
  },
  {
    title: "Điều kiện đổi trả",
    description:
      "Sản phẩm còn tem niêm phong (nếu có), đầy đủ hộp/phụ kiện/quà tặng kèm và chưa có dấu hiệu rơi vỡ, vào nước, can thiệp kỹ thuật trái phép.",
    icon: <FiPackage size={18} />,
  },
  {
    title: "Trường hợp được hỗ trợ nhanh",
    description:
      "Sản phẩm lỗi do nhà sản xuất, giao sai mẫu/màu/dung lượng, thiếu phụ kiện hoặc hư hỏng trong quá trình vận chuyển.",
    icon: <FiCheckCircle size={18} />,
  },
  {
    title: "Trường hợp từ chối",
    description:
      "Quá thời hạn đổi trả, mất hóa đơn/chứng từ cần thiết, hỏng do người dùng hoặc thiếu phụ kiện quan trọng không thể kiểm tra lại sản phẩm.",
    icon: <FiAlertCircle size={18} />,
  },
];

const returnSteps = [
  {
    step: "Bước 1",
    title: "Gửi yêu cầu",
    content:
      "Liên hệ CSKH qua hotline 0901 234 567 hoặc email hotro@electroshop.vn, cung cấp mã đơn hàng và lý do đổi trả.",
  },
  {
    step: "Bước 2",
    title: "Xác nhận điều kiện",
    content:
      "Đội ngũ hỗ trợ kiểm tra thông tin đơn hàng và hướng dẫn bạn đóng gói sản phẩm theo đúng tiêu chuẩn hoàn trả.",
  },
  {
    step: "Bước 3",
    title: "Gửi hàng về trung tâm",
    content:
      "Bạn gửi hàng theo hướng dẫn, hoặc được hỗ trợ lấy hàng tận nơi ở các khu vực đủ điều kiện.",
  },
  {
    step: "Bước 4",
    title: "Kiểm định và xử lý",
    content:
      "Sau khi nhận hàng, kỹ thuật kiểm định trong 1-3 ngày làm việc để xác định phương án đổi mới, sửa chữa hoặc hoàn tiền.",
  },
];

const refundMethods = [
  "Thanh toán COD: hoàn tiền qua chuyển khoản ngân hàng do khách hàng cung cấp.",
  "Thanh toán chuyển khoản: hoàn về đúng tài khoản đã thanh toán hoặc tài khoản xác nhận hợp lệ.",
  "Thanh toán qua cổng online: hoàn về phương thức gốc, thời gian phụ thuộc ngân hàng/tổ chức trung gian.",
];

export default function ReturnsRefundsPage() {
  return (
    <div className="returns-page">
      <div className="container returns-page__container">
        <section className="returns-hero">
          <p className="returns-hero__tag">
            <FiShield size={15} /> Chính sách khách hàng
          </p>
          <h1>Chính sách đổi trả và hoàn tiền</h1>
          <p>
            ElectroShop luôn ưu tiên trải nghiệm mua sắm minh bạch và an tâm. Dưới đây là điều kiện áp dụng,
            quy trình xử lý và thời gian hoàn tiền để bạn dễ theo dõi.
          </p>
        </section>

        <section className="returns-section">
          <h2 className="returns-section__title">
            <FiRefreshCw size={18} /> Chính sách đổi trả
          </h2>
          <div className="returns-policy-grid">
            {policyItems.map((item) => (
              <article key={item.title} className="returns-policy-card">
                <div className="returns-policy-card__icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="returns-section">
          <h2 className="returns-section__title">
            <FiRotateCcw size={18} /> Cách đổi trả sản phẩm
          </h2>
          <div className="returns-steps">
            {returnSteps.map((item) => (
              <article key={item.step} className="returns-step">
                <span className="returns-step__badge">{item.step}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="returns-section returns-refund-box">
          <h2 className="returns-section__title">
            <FiClock size={18} /> Chính sách hoàn tiền
          </h2>
          <p className="returns-refund-box__intro">
            Sau khi yêu cầu được duyệt, thời gian hoàn tiền thường từ 3-10 ngày làm việc tùy phương thức thanh toán.
          </p>
          <ul>
            {refundMethods.map((method) => (
              <li key={method}>{method}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
