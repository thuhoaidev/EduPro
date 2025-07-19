import { Button, Result, message, Spin } from "antd";
import axios from "axios";
import config from "../../api/axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import orderService from "../../services/orderService";
import { useAuth } from "../../hooks/Auths/useAuth";
import { useCart } from "../../contexts/CartContext"; // ✅ Import đúng vị trí

interface PendingOrderItem {
  courseId: string;
  quantity?: number;
}

function CheckPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { clearCart } = useCart(); // ✅ Hook phải gọi ở top-level

  const [status, setStatus] = useState<"success" | "error">("error");
  const [title, setTitle] = useState("Đang xác minh thanh toán...");
  const [subTitle, setSubTitle] = useState("Vui lòng đợi trong giây lát...");
  const [isProcessing, setIsProcessing] = useState(true);

  const paymentMethod = searchParams.get("paymentMethod");

  useEffect(() => {
    const handlePayment = async () => {
      try {
        let isPaid = false;

        // ✅ BƯỚC 1: Xác minh thanh toán
        if (paymentMethod === "zalopay") {
          const status = searchParams.get("status");
          if (Number(status) === 1) {
            isPaid = true;
            setStatus("success"); // Thêm dòng này để hiển thị thành công ngay
            setTitle("Thanh toán thành công");
          } else {
            setStatus("error");
            setTitle("Khách hàng đã hủy thanh toán");
            return;
          }
        } else {
          const { data } = await axios.get(
            `http://localhost:5000/api/check_payment?${searchParams.toString()}`
          );
          const code = data?.data?.vnp_ResponseCode;

          if (code === "00") {
            isPaid = true;
            setStatus("success"); // Thêm dòng này để hiển thị thành công ngay
            setTitle("Thanh toán thành công");
          } else if (code === "24") {
            setStatus("error");
            setTitle("Khách hàng đã hủy thanh toán");
            return;
          } else {
            setStatus("error");
            setTitle("Thanh toán thất bại");
            setSubTitle("Vui lòng thử lại hoặc liên hệ hỗ trợ");
            return;
          }
        }

        // ✅ BƯỚC 2: Gửi đơn hàng
        if (isPaid) {
          const rawOrder = localStorage.getItem("pendingOrder");

          if (!rawOrder || !token) {
            setStatus("error");
            setTitle("Không tìm thấy dữ liệu đơn hàng");
            setSubTitle("Vui lòng thử lại");
            return;
          }

          const parsed = JSON.parse(rawOrder);

          const validItems = (parsed.items as PendingOrderItem[]).filter(
            (item) => item.courseId && typeof item.courseId === "string"
          );

          if (validItems.length === 0) {
            throw new Error("Khóa học không hợp lệ hoặc thiếu courseId!");
          }

          const orderData = {
            items: validItems.map((item) => ({
              courseId: item.courseId,
              quantity: item.quantity ?? 1,
            })),
            voucherCode: parsed.voucherCode,
            paymentMethod: parsed.paymentMethod,
            shippingInfo: {
              fullName: parsed.fullName,
              phone: parsed.phone,
              email: parsed.email,
            },
            notes: parsed.notes,
          };

          const res = await orderService.createOrder(orderData, token);

          // ✅ Xóa giỏ hàng và localStorage
          clearCart();
          localStorage.removeItem("pendingOrder");
          localStorage.removeItem("checkoutData");

          // ✅ Load lại dữ liệu khóa học đã mua
          try {
            await config.get("/users/me/enrollments");
          } catch (error) {
            console.log("Refresh enrollment data failed:", error);
          }

          setStatus("success");
          setTitle("Đơn hàng đã được ghi nhận!");
          setSubTitle(`Mã đơn hàng: ${res.order.id}`);
        }
      } catch (error: unknown) {
        console.error("❌ Payment processing error:", error);
        setStatus("error");
        setTitle("Đã có lỗi xảy ra khi xác nhận thanh toán");
        if (error instanceof Error) {
          setSubTitle(error.message || "Vui lòng thử lại hoặc liên hệ hỗ trợ.");
        } else {
          setSubTitle("Vui lòng thử lại hoặc liên hệ hỗ trợ.");
        }
        message.error("Lỗi xử lý thanh toán!");
      } finally {
        setIsProcessing(false);
      }
    };

    handlePayment();
  }, [searchParams, paymentMethod, token, clearCart]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang xử lý thanh toán..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        status={status}
        icon={
          status === "success" ? (
            <svg width="72" height="72" fill="none" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="36" fill="#52c41a" opacity="0.15" />
              <path d="M22 37l10 10 18-18" stroke="#52c41a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="72" height="72" fill="none" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="36" fill="#ff4d4f" opacity="0.15" />
              <path d="M27 27l18 18M45 27L27 45" stroke="#ff4d4f" strokeWidth="4" strokeLinecap="round" />
            </svg>
          )
        }
        title={<span style={{ fontSize: 28, fontWeight: 700 }}>{title}</span>}
        subTitle={<span style={{ fontSize: 18 }}>{subTitle}</span>}
        extra={[
          <Button type="primary" key="orders" size="large" onClick={() => navigate("/profile/orders")}>Xem đơn hàng</Button>,
          <Button key="home" size="large" onClick={() => navigate("/")}>Về trang chủ</Button>,
        ]}
        style={{ width: 480, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32 }}
      />
      {/* Hiệu ứng confetti khi thành công */}
      {status === "success" && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 1000 }}>
          <canvas id="confetti-canvas" style={{ width: '100vw', height: '100vh' }}></canvas>
        </div>
      )}
    </div>
  );
}

export default CheckPayment;
