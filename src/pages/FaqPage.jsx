import { FiHelpCircle, FiMessageCircle, FiTruck, FiRefreshCw, FiShield, FiCreditCard, FiClock, FiMail } from "react-icons/fi";
import "./FaqPage.css";

const faqGroups = [
  {
    title: "Đặt hàng & thanh toán",
    icon: <FiCreditCard size={18} />,
    items: [
      {
        question: "Làm sao để đặt hàng trên ElectroShop?",
        answer:
          "Bạn chọn sản phẩm, thêm vào giỏ, điền thông tin giao hàng và hoàn tất thanh toán tại trang Checkout. Sau khi đặt thành công, hệ thống sẽ gửi mã đơn hàng về email của bạn.",
      },
      {
        question: "ElectroShop hỗ trợ những phương thức thanh toán nào?",
        answer:
          "Hiện tại chúng tôi hỗ trợ thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng và một số cổng thanh toán trực tuyến. Tùy khu vực, bạn sẽ thấy phương thức phù hợp ở bước thanh toán.",
      },
      {
        question: "Đặt hàng xong tôi có thể hủy đơn không?",
        answer:
          "Bạn có thể hủy khi đơn vẫn ở trạng thái chờ xử lý. Nếu đơn đã chuyển sang giao vận, hãy liên hệ hỗ trợ để được hướng dẫn nhanh nhất.",
      },
    ],
  },
  {
    title: "Vận chuyển & giao nhận",
    icon: <FiTruck size={18} />,
    items: [
      {
        question: "Bao lâu tôi nhận được hàng?",
        answer:
          "Nội thành TP.HCM/Hà Nội thường từ 1-2 ngày làm việc. Các tỉnh thành khác từ 2-5 ngày tùy khu vực và đơn vị vận chuyển.",
      },
      {
        question: "Tôi có thể theo dõi đơn hàng ở đâu?",
        answer:
          "Bạn vào Tài khoản của tôi > Đơn hàng hoặc truy cập trực tiếp trang hồ sơ với tab Đơn hàng để xem trạng thái mới nhất.",
      },
      {
        question: "Phí vận chuyển được tính như thế nào?",
        answer:
          "Phí ship phụ thuộc địa chỉ nhận hàng, khối lượng kiện và chương trình khuyến mãi hiện hành. Phí cuối cùng được hiển thị rõ trước khi bạn xác nhận đặt hàng.",
      },
    ],
  },
  {
    title: "Đổi trả & bảo hành",
    icon: <FiShield size={18} />,
    items: [
      {
        question: "Chính sách đổi trả của shop là gì?",
        answer:
          "Bạn có thể yêu cầu đổi trả trong 7-30 ngày tùy loại sản phẩm, với điều kiện sản phẩm còn đầy đủ phụ kiện và không có dấu hiệu can thiệp phần cứng trái phép.",
      },
      {
        question: "Sản phẩm lỗi kỹ thuật thì xử lý ra sao?",
        answer:
          "Khi phát sinh lỗi từ nhà sản xuất, bạn được hỗ trợ kiểm tra và bảo hành theo chính sách hãng. Đội ngũ CSKH sẽ hướng dẫn quy trình cụ thể theo từng sản phẩm.",
      },
      {
        question: "Hoàn tiền mất bao lâu?",
        answer:
          "Sau khi yêu cầu hoàn tiền được duyệt, thời gian nhận tiền thường từ 3-10 ngày làm việc tùy phương thức thanh toán ban đầu và ngân hàng của bạn.",
      },
    ],
  },
  {
    title: "Tài khoản & hỗ trợ",
    icon: <FiMessageCircle size={18} />,
    items: [
      {
        question: "Tôi quên mật khẩu, phải làm sao?",
        answer:
          "Bạn chọn Đăng nhập > Quên mật khẩu và làm theo hướng dẫn khôi phục. Nếu chưa nhận email, hãy kiểm tra thư mục Spam hoặc liên hệ hỗ trợ.",
      },
      {
        question: "Làm sao cập nhật thông tin cá nhân và địa chỉ?",
        answer:
          "Bạn vào trang Tài khoản của tôi để chỉnh sửa hồ sơ, số điện thoại và địa chỉ giao hàng. Thông tin mới sẽ được áp dụng cho các đơn tiếp theo.",
      },
      {
        question: "Cần hỗ trợ gấp thì liên hệ ở đâu?",
        answer:
          "Bạn có thể gửi email đến hotro@electroshop.vn hoặc gọi hotline 0901 234 567 trong giờ hành chính để được hỗ trợ nhanh nhất.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="faq-page">
      <div className="container faq-page__container">
        <div className="faq-page__hero">
          <p className="faq-page__eyebrow">
            <FiHelpCircle size={16} /> Hỗ trợ khách hàng
          </p>
          <h1 className="faq-page__title">Câu hỏi thường gặp</h1>
          <p className="faq-page__subtitle">
            Tổng hợp các thắc mắc phổ biến nhất khi mua sắm tại ElectroShop. Nếu chưa thấy câu trả lời bạn cần,
            hãy liên hệ đội ngũ CSKH để được hỗ trợ ngay.
          </p>
          <div className="faq-page__quick-info">
            <span><FiClock size={15} /> Hỗ trợ 8:00 - 22:00</span>
            <span><FiRefreshCw size={15} /> Cập nhật nội dung mỗi tuần</span>
            <span><FiMail size={15} /> hotro@electroshop.vn</span>
          </div>
        </div>

        <div className="faq-page__groups">
          {faqGroups.map((group) => (
            <section key={group.title} className="faq-group">
              <h2 className="faq-group__title">
                {group.icon}
                <span>{group.title}</span>
              </h2>

              <div className="faq-group__items">
                {group.items.map((item) => (
                  <details key={item.question} className="faq-item">
                    <summary className="faq-item__question">{item.question}</summary>
                    <p className="faq-item__answer">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
