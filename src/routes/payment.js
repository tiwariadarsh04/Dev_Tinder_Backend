const express = require("express");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const { userAuth } = require("../middlewares/auth");
const Payment = require("../models/payment");
const User = require("../models/user");
const crypto = require("crypto");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipType === "gold" ? 700 * 100 : 300 * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType,
      },
    });

    // save it in my database
    // Return back my order details to frontend
    const payment = new Payment({
      userId: req.user.id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    res.send({
      order: savedPayment,
      keyId: process.env.RAZORPAY_KEY_ID,
      message: "Every Thing Working fine",
    });
  } catch (error) {
    console.log("Error in creating the payment route :", error);
    res.send({
      message: "Error in creating order",
      error: error,
    });
  }
});

paymentRouter.post("/payment/verify", async (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;

    const secret = process.env.RAZORPAY_SECRET_KEY;

    //create signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(order_id + "|" + payment_id);
    const generated_signature2 = hmac.digest("hex");

    if (generated_signature2 == signature) {
      // payment is successful
      // here we can perform db opretions
      const payment = await Payment.findOne({ orderId: order_id });
      payment.status="captured";
      const updatedPayment=await payment.save();

      const user=await User.findById(payment.userId);
      user.isPremium=true;
      user.membershipType=payment?.notes?.membershipType;
      const updatedUser=await user.save();

      console.log("Payment is :", payment);
      res.send({
        paymentVerified: true,
        user:updatedUser,
        payment: updatedPayment,
        message: "Payment successfully completed",
      });
    } else {
      console.log("Payment Not verified");
      res.send({
        paymentVerified: false,
        message: "Payment Not verified",
      });
    }
  } catch (error) {
    console.log("Error in veryfing the payment :", error);
  }
});

module.exports = paymentRouter;
