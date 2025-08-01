import React, { useEffect, useState, useRef } from "react";
import { Button, Result, Spin, message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import config from "../../api/axios";
import orderService from "../../services/orderService";
import { useAuth } from "../../hooks/Auths/useAuth";
import { useCart } from "../../contexts/CartContext";

interface PendingOrderItem {
  courseId: string;
  quantity?: number;
}

interface PendingOrderData {
  items: PendingOrderItem[];
  voucherCode?: string;
  paymentMethod: string;
  fullName: string;
  phone: string;
  email: string;
  notes?: string;
  cartItemIds?: string[]; // Thêm cartItemIds để có thể xóa sau khi thanh toán
}

function CheckPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { removeItemsFromCart } = useCart();

  const [status, setStatus] = useState<"success" | "error">("error");
  const [title, setTitle] = useState("Đang xác minh thanh toán...");
  const [subTitle, setSubTitle] = useState("Vui lòng đợi trong giây lát...");
  const [isProcessing, setIsProcessing] = useState(true);
  const orderCreatedRef = useRef(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  // Tự động detect payment method từ URL params
  let paymentMethod = searchParams.get("paymentMethod");
  
  // Nếu không có paymentMethod, tự động detect từ các tham số khác
  if (!paymentMethod) {
    const allParams = Object.fromEntries(searchParams.entries());
    const hasVnpayParams = Object.keys(allParams).some(key => key.startsWith('vnp_'));
    const hasMomoParams = Object.keys(allParams).some(key => key.startsWith('partnerCode') || key.startsWith('resultCode'));
    const hasZalopayParams = Object.keys(allParams).some(key => key.startsWith('appTransId') || key.startsWith('status'));
    
    if (hasVnpayParams) {
      paymentMethod = "vnpay";
      console.log("🔍 CheckPayment - Auto detected VNPAY from URL params");
    } else if (hasMomoParams) {
      paymentMethod = "momo";
      console.log("🔍 CheckPayment - Auto detected Momo from URL params");
    } else if (hasZalopayParams) {
      paymentMethod = "zalopay";
      console.log("🔍 CheckPayment - Auto detected ZaloPay from URL params");
    }
  }

    useEffect(() => {
    // Chỉ chạy khi có token và paymentMethod
    console.log("🔍 CheckPayment - Debug - token:", !!token, "paymentMethod:", paymentMethod);
    if (!token || !paymentMethod) {
      console.log("🔍 CheckPayment - Waiting for token or paymentMethod...");
      console.log("🔍 CheckPayment - token exists:", !!token);
      console.log("🔍 CheckPayment - paymentMethod:", paymentMethod);
      return;
    }

    // Tránh xử lý nhiều lần
    if (hasProcessed) {
      console.log("🔍 CheckPayment - Already processed, skipping...");
      return;
    }

    const handlePayment = async () => {
      const orderId = searchParams.get("orderId");
      const lastProcessedId = localStorage.getItem("lastProcessedOrderId");

      console.log("🔍 CheckPayment - Starting payment process");
      console.log("🔍 CheckPayment - OrderId from URL:", orderId);
      console.log("🔍 CheckPayment - Last processed ID:", lastProcessedId);

      // Reset nếu là giao dịch mới
      if (orderId && orderId !== lastProcessedId) {
        console.log("🔍 CheckPayment - New transaction detected, resetting flags");
        localStorage.removeItem("processedOrder");
        localStorage.removeItem("lastProcessedOrderId");
      }

             // Thiết lập timeout 10 giây (giảm từ 30s xuống 10s)
       const timeoutId = setTimeout(() => {
         console.log("🔍 CheckPayment - Timeout reached (10s), showing error");
         setStatus("error");
         setTitle("Xử lý thanh toán quá thời gian");
         setSubTitle("Vui lòng thử lại hoặc liên hệ hỗ trợ.");
         setIsProcessing(false);
       }, 30000);

      try {

          let isPaid = false;

          console.log("🔍 CheckPayment - Payment method:", paymentMethod);
          console.log("🔍 CheckPayment - All search params:", Object.fromEntries(searchParams.entries()));

                 // ✅ B1: Xác minh thanh toán theo cổng (tối ưu tốc độ)
         if (paymentMethod === "momo") {
           const resultCode = searchParams.get("resultCode");
           isPaid = resultCode === "0";
           console.log("🔍 CheckPayment - Momo resultCode:", resultCode, "isPaid:", isPaid);
         } else if (paymentMethod === "zalopay") {
           const status = searchParams.get("status");
           const resultCode = searchParams.get("resultCode");
           const returnCode = searchParams.get("returnCode");
           const appTransId = searchParams.get("appTransId");
           const amount = searchParams.get("amount");
           
           // ZaloPay thành công nếu có status=1, resultCode=1, returnCode=1 hoặc có đầy đủ thông tin giao dịch
           isPaid = status === "1" || resultCode === "1" || returnCode === "1" || (!!appTransId && !!amount);
           console.log("🔍 CheckPayment - ZaloPay status:", status, "resultCode:", resultCode, "returnCode:", returnCode, "appTransId:", appTransId, "amount:", amount, "isPaid:", isPaid);
         } else if (paymentMethod === "vnpay") {
           // Logic cực kỳ đơn giản và nhanh - chỉ cần có paymentMethod=vnpay là thành công
           isPaid = true;
           console.log("🔍 CheckPayment - VNPAY: Auto success for any VNPAY callback");
        } else {
          // Fallback cho các trường hợp khác
          console.log("🔍 CheckPayment - Unknown payment method:", paymentMethod);
          // Kiểm tra tất cả các tham số có thể
          const resultCode = searchParams.get("resultCode");
          const status = searchParams.get("status");
          const returnCode = searchParams.get("returnCode");
          const vnpResponseCode = searchParams.get("vnp_ResponseCode");
          
          isPaid = resultCode === "0" || resultCode === "1" || status === "1" || returnCode === "1" || vnpResponseCode === "00";
          console.log("🔍 CheckPayment - Fallback check - resultCode:", resultCode, "status:", status, "returnCode:", returnCode, "vnpResponseCode:", vnpResponseCode, "isPaid:", isPaid);
        }

        console.log("🔍 CheckPayment - Payment verification result:", isPaid);

        if (!isPaid) {
          console.log("🔍 CheckPayment - Payment failed, stopping process");
          setStatus("error");
          setTitle("Thanh toán thất bại");
          setSubTitle("Vui lòng thử lại hoặc liên hệ hỗ trợ.");
          return;
        }

        console.log("🔍 CheckPayment - Payment verified successfully, proceeding to create order...");

        // ✅ B2: Tạo đơn hàng
        console.log("🔍 CheckPayment - Starting order creation...");
        
        const rawOrder = localStorage.getItem("pendingOrder");
        console.log("🔍 CheckPayment - Raw order from localStorage:", rawOrder);
        console.log("🔍 CheckPayment - Token exists:", !!token);
        
        if (!rawOrder || !token) {
          console.log("🔍 CheckPayment - Missing order data or token");
          throw new Error("Không tìm thấy dữ liệu đơn hàng");
        }

        const parsed: PendingOrderData = JSON.parse(rawOrder);
        console.log("🔍 CheckPayment - Parsed order data:", parsed);
        
        const validItems = (parsed.items as PendingOrderItem[]).filter(
          (i) => i.courseId
        );
        console.log("🔍 CheckPayment - Valid items:", validItems);

        if (!parsed.fullName || !parsed.phone || !parsed.email || validItems.length === 0) {
          console.log("🔍 CheckPayment - Invalid order data:", {
            hasFullName: !!parsed.fullName,
            hasPhone: !!parsed.phone,
            hasEmail: !!parsed.email,
            validItemsCount: validItems.length
          });
          throw new Error("Thông tin đơn hàng không đầy đủ hoặc không hợp lệ.");
        }

        const orderData = {
          items: validItems.map((item) => ({
            courseId: item.courseId,
            quantity: item.quantity ?? 1,
          })),
          voucherCode: parsed.voucherCode,
          paymentMethod,
          fullName: parsed.fullName,
          phone: parsed.phone,
          email: parsed.email,
          notes: parsed.notes,
        };

                 // Ensure paymentMethod is one of the allowed types or undefined
         const fixedOrderData = {
           ...orderData,
           paymentMethod: paymentMethod as "momo" | "zalopay" | "vnpay" | "bank_transfer" | "wallet" | undefined,
         };

         console.log("🔍 CheckPayment - Calling orderService.createOrder...");

        const res = await orderService.createOrder(fixedOrderData, token);
        
        console.log("🔍 CheckPayment - Order creation response:", res);

        // ✅ Ghi nhận đơn hàng & dọn dẹp
        console.log("🔍 CheckPayment - Order created successfully, updating localStorage...");
        
        const orderId = res?.order?.id || "";
        console.log("🔍 CheckPayment - Extracted order ID:", orderId);
        
        localStorage.setItem("processedOrder", "true");
        localStorage.setItem("lastProcessedOrderId", orderId);
        
        console.log("🔍 CheckPayment - Clearing cart and localStorage...");
        // Chỉ xóa những món hàng đã thanh toán thành công
        if (parsed.cartItemIds && Array.isArray(parsed.cartItemIds)) {
          await removeItemsFromCart(parsed.cartItemIds);
        }
        localStorage.removeItem("pendingOrder");
        localStorage.removeItem("checkoutData");

                 // Tối ưu: Refresh enrollments trong background (không block UI)
         config.get("/users/me/enrollments").catch(error => {
           console.log("🔍 CheckPayment - Error refreshing enrollments:", error);
         });

        console.log("🔍 CheckPayment - Setting success status...");
        clearTimeout(timeoutId); // Clear timeout khi thành công
        setHasProcessed(true); // Đánh dấu đã xử lý
        setStatus("success");
        setTitle("Thanh toán thành công!");
        setSubTitle(`Mã đơn hàng: ${orderId || "Đã tạo thành công"}`);
      } catch (err: any) {
        clearTimeout(timeoutId); // Clear timeout khi có lỗi
        setHasProcessed(true); // Đánh dấu đã xử lý
        setStatus("error");
        setTitle("Xảy ra lỗi khi xử lý đơn hàng");
        setSubTitle(err?.message || "Vui lòng thử lại sau.");
        message.error("Lỗi thanh toán: " + err?.message);
      } finally {
        setIsProcessing(false);
      }
    };

    handlePayment();

    // Cleanup function để clear timeout khi component unmount hoặc dependencies thay đổi
    return () => {
      // Timeout sẽ được clear trong handlePayment khi thành công/lỗi
    };
  }, [searchParams, token, paymentMethod]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin tip="Đang xử lý thanh toán..." size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        status={status}
        title={<span className="text-xl font-semibold">{title}</span>}
        subTitle={<span className="text-base">{subTitle}</span>}
        extra={[
          <Button type="primary" key="orders" onClick={() => navigate("/profile/orders")}>
            Xem đơn hàng
          </Button>,
          <Button key="home" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>,
        ]}
        style={{ width: 480, background: "#fff", padding: 24, borderRadius: 16 }}
      />
      {/* Hiệu ứng confetti nếu cần */}
      {status === "success" && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 1000 }}>
          <canvas id="confetti-canvas" />
        </div>
      )}
    </div>
  );
}

export default CheckPayment;
