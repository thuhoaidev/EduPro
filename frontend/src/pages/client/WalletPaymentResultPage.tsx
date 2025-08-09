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
        // Lấy tất cả tham số từ URL
        const paymentMethod = query.get("paymentMethod");
        const amountParam = query.get("amount");
        
        // Xác định transaction ID dựa trên phương thức thanh toán
        let transactionId = null;
        if (paymentMethod === "zalopay") {
          transactionId = query.get("apptransid") || query.get("orderId");
        } else if (paymentMethod === "momo") {
          transactionId = query.get("transId") || query.get("orderId");
        } else if (paymentMethod === "vnpay") {
          transactionId = query.get("transId") || query.get("orderId");
        } else {
          transactionId = query.get("orderId") || query.get("transactionId");
        }

        console.log('Payment result params:', {
          paymentMethod,
          transactionId,
          amount: amountParam,
          allParams: Object.fromEntries(query.entries())
        });

        // Log chi tiết cho ZaloPay
        if (paymentMethod === "zalopay") {
          console.log('ZaloPay specific params:', {
            apptransid: query.get("apptransid"),
            resultcode: query.get("resultcode"),
            message: query.get("message"),
            amount: query.get("amount"),
            checksum: query.get("checksum")
          });
        }

        // Kiểm tra nếu thiếu thông tin cần thiết
        if (!transactionId) {
          setStatus("error");
          setTitle("Nạp tiền thất bại hoặc bị hủy");
          setSubTitle("Thiếu thông tin giao dịch. Vui lòng thử lại hoặc liên hệ hỗ trợ.");
          setLoading(false);
          return;
        }

        const checkedKey = `walletPaymentChecked_${transactionId}`;
        
        // Nếu đã xác thực giao dịch này rồi, chuyển hướng về ví luôn
        if (sessionStorage.getItem(checkedKey)) {
          setRedirected(true);
          navigate('/wallet?fromPayment=true', { replace: true });
          return;
        }

        // Xác định endpoint dựa trên phương thức thanh toán
        let endpoint = "payment-callback";
        if (paymentMethod === "zalopay") {
          endpoint = "zalopay-callback";
        } else if (paymentMethod === "momo") {
          endpoint = "momo-callback";
        } else if (paymentMethod === "vnpay") {
          endpoint = "vnpay-callback";
        }

        // Gửi thông tin thanh toán về backend
        const params = query.toString();
        let res;
        
        if (paymentMethod === "zalopay") {
          // ZaloPay: Gửi GET request với query parameters
          res = await fetch(`http://localhost:5000/api/wallet/${endpoint}?${params}`);
        } else {
          // Các phương thức khác: Gửi POST request
          res = await fetch(`http://localhost:5000/api/wallet/${endpoint}?${params}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentMethod,
              transactionId,
              amount: amountParam ? parseInt(amountParam) : null,
              allParams: Object.fromEntries(query.entries())
            })
          });
        }

        let json = await res.json();
        
        // Fallback: nếu MoMo callback không thành công nhưng resultCode = '0', thử endpoint có auth để xác nhận giao dịch
        if ((!json.success) && (query.get('resultCode') === '0')) {
          try {
            const token = localStorage.getItem('token');
            const fallbackRes = await fetch(`http://localhost:5000/api/wallet/payment-callback`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                orderId: query.get('orderId') || query.get('orderid') || transactionId || undefined,
                resultCode: '0',
                message: query.get('message') || 'Thanh toán thành công',
                amount: amountParam ? parseInt(amountParam) : undefined,
                method: 'momo',
                transId: query.get('transId') || query.get('transid') || undefined
              })
            });
            const fallbackJson = await fallbackRes.json();
            if (fallbackJson && fallbackJson.success) {
              json = fallbackJson;
            }
          } catch (e) {
            // ignore, sẽ hiển thị lỗi như bình thường
          }
        }

        if (json.success) {
          setStatus("success");
          setTitle("Nạp tiền thành công!");
          setSubTitle(`Số dư mới: ${json.balance?.toLocaleString() || ""}₫`);
          setAmount((json.amount != null ? json.amount : (amountParam ? parseInt(amountParam) : null)) as any);
          
          // Đánh dấu đã xác thực giao dịch này
          sessionStorage.setItem(checkedKey, '1');
          
          // Tự động chuyển về ví sau 3 giây
          setTimeout(() => navigate('/wallet?fromPayment=true'), 3000);
        } else {
          setStatus("error");
          setTitle("Nạp tiền thất bại hoặc bị hủy");
          setSubTitle(json.message || "Vui lòng thử lại hoặc liên hệ hỗ trợ.");
          
          // Log lỗi để debug
          console.error('Payment callback error:', json);
        }
      } catch (error) {
        console.error('Payment result error:', error);
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

  const handleBackToWallet = () => {
    navigate('/wallet?fromPayment=true');
  };

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
          <Button type="primary" key="wallet" onClick={handleBackToWallet}>
            Về trang ví
          </Button>,
        ]}
      />
    </Card>
  );
};

export default WalletPaymentResultPage; 