const express = require("express");
const axios = require("axios");
const moment = require("moment");
const CryptoJS = require("crypto-js");

const paymentZaloRouter = express.Router();

const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

paymentZaloRouter.post("/create_zalopay_payment", async (req, res) => {
  const { amount } = req.body;

  const transID = Math.floor(Math.random() * 1000000);
  const items = [{}];

  const embed_data = {
    return_url: "http://localhost:3000/payment-result?paymentMethod=zalopay&status=1",
    redirecturl: "http://localhost:3000/payment-result?paymentMethod=zalopay&status=1"
  };

  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
    app_user: "user123",
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: amount,
    description: "ZaloPay Integration Demo",
    bank_code: "",
    callback_url: "https://d769-123-16-125-218.ngrok-free.app/zalo/callback",
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

  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  try {
    const response = await axios.post(config.endpoint, null, { params: order });
    return res.status(200).json({
      payUrl: response.data.order_url,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

paymentZaloRouter.post("/callback", (req, res) => {
  let result = {};
  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;
    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      let dataJson = JSON.parse(dataStr);
      console.log("✅ ZaloPay callback success:", dataJson["app_trans_id"]);
      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0;
    result.return_message = ex.message;
  }
  res.json(result);
});

module.exports = paymentZaloRouter;
