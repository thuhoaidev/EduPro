import React, { useEffect, useState } from "react";
import { Card, Result, Button, Spin, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const WalletPaymentResultPage: React.FC = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "error">("error");
  const [title, setTitle] = useState("Đang xác minh giao dịch...");
  const [subTitle, setSubTitle] = useState("Vui lòng đợi trong giây lát...");
  const [amount, setAmount] = useState<number | null>(null);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    const checkWalletPayment = async () => {
      setLoading(true);
      try {
        // Lấy mã giao dịch (orderId hoặc transactionId)
        const transactionId = query.get("orderId") || query.get("transactionId");
        const checkedKey = transactionId ? `walletPaymentChecked_${transactionId}` : null;
        // Nếu đã xác thực giao dịch này rồi, chuyển hướng về ví luôn
        if (checkedKey && sessionStorage.getItem(checkedKey)) {
          setRedirected(true);
          navigate('/wallet', { replace: true });
          return;
        }
        const params = query.toString();
        const paymentMethod = query.get("paymentMethod");
        let endpoint = "vnpay-callback";
        if (paymentMethod === "zalopay") endpoint = "zalopay-callback";
        if (paymentMethod === "momo") endpoint = "momo-callback";
        const res = await fetch(`http://localhost:5000/api/wallet/${endpoint}?${params}`);
        const json = await res.json();
        if (json.success) {
          setStatus("success");
          setTitle("Nạp tiền thành công!");
          setSubTitle(`Số dư mới: ${json.balance?.toLocaleString() || ""}₫`);
          setAmount(json.amount || null);
          // Đánh dấu đã xác thực giao dịch này
          if (checkedKey) {
            sessionStorage.setItem(checkedKey, '1');
          }
          // Tự động chuyển về ví sau 20 giây
          setTimeout(() => navigate('/wallet'), 1000);
        } else {
          setStatus("error");
          setTitle("Nạp tiền thất bại hoặc bị hủy");
          setSubTitle(json.message || "Vui lòng thử lại hoặc liên hệ hỗ trợ.");
        }
      } catch (error) {
        setStatus("error");
        setTitle("Đã có lỗi xảy ra khi xác nhận giao dịch");
        setSubTitle("Vui lòng thử lại hoặc liên hệ hỗ trợ.");
        message.error("Lỗi xác thực kết quả nạp tiền!");
      } finally {
        setLoading(false);
      }
    };
    checkWalletPayment();
    // eslint-disable-next-line
  }, [query]);

  if (redirected) return null;
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <Card style={{ maxWidth: 480, margin: '40px auto' }}>
      <Result
        status={status}
        title={title}
        subTitle={
          <>
            {subTitle}<br />
            {amount !== null && (
              <span>Số tiền: <b>{amount.toLocaleString()}₫</b></span>
            )}
          </>
        }
        extra={[
          <Button type="primary" key="wallet" onClick={() => navigate('/wallet')}>
            Về trang ví
          </Button>,
        ]}
      />
    </Card>
  );
};

export default WalletPaymentResultPage; 