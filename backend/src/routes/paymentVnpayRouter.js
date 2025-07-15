const express = require("express");
const moment = require("moment");

const vnpayRouter = express.Router();

vnpayRouter.get("/create_payment", async (req, res) => {
  const { amount } = req.query;

  // Giả lập paymentUrl cho test
  const fakeVnpayUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?amount=${amount}&orderId=${moment().format("YYMMDD_HHmmss")}`;

  return res.status(200).json({ paymentUrl: fakeVnpayUrl });
});

module.exports = vnpayRouter;
