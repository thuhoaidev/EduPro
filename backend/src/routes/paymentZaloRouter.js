import express from "express";
import axios from "axios";
import moment from "moment";
import CryptoJS from "crypto-js";

const paymentZaloRouter = express.Router();

const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

paymentZaloRouter.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  const transID = Math.floor(Math.random() * 1000000);
  const items = [{}];

  const embed_data = {
    preferred_payment_method: ["international_card"],
    redirecturl: "http://localhost:5173/payment-result?paymentMethod=zalopay"
  };
  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
    app_user: "user123",
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: amount,
    description: "ZaloPay Integration Demo",
    bank_code: "",
    callback_url:"https://d769-123-16-125-218.ngrok-free.app/zalo/callback",
  };

  const data =
    config.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;
    // message authentication code MAC
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  try {
    const { data } = await axios.post(config.endpoint, null, { params: order });
    return res.status(200).json({
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Some thing wrong",
    });
  }
});

paymentZaloRouter.post('/callback',(req,res)=> {
    let result = {};

    try {
      let dataStr = req.body.data;
      let reqMac = req.body.mac;

      let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
      console.log("mac =", mac);


      // kiểm tra callback hợp lệ (đến từ ZaloPay server)
      if (reqMac !== mac) {
        // callback không hợp lệ
        result.return_code = -1;
        result.return_message = "mac not equal";
      }
      else {
        // thanh toán thành công
        // merchant cập nhật trạng thái cho đơn hàng
        let dataJson = JSON.parse(dataStr, config.key2);
        console.log("update order's status = success where app_trans_id =", dataJson["app_trans_id"]);

        result.return_code = 1;
        result.return_message = "success";
      }
    } catch (ex) {
      result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
      result.return_message = ex.message;
    }

    // thông báo kết quả cho ZaloPay server
    res.json(result);
})

export default paymentZaloRouter;
