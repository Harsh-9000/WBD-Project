import express from "express";
const router = express.Router();
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import dotenv from "dotenv";

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({
    path: "config/.env",
  });
}

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/process", async (req, res, next) => {
  try {
    const { name, shippingAddress } = req.body.shippingDetails;
    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.paymentData.amount,
      currency: "USD",
      description: "Products money earned",
      shipping: {
        name: name,
        address: {
          line1: shippingAddress.address1,
          postal_code: shippingAddress.zipCode,
          city: shippingAddress.city,
          state: shippingAddress.city,
          country: shippingAddress.country,
        }
      },
    });
    res.status(200).json({
      success: true,
      client_secret: myPayment.client_secret,
    });
  } catch (error) {
    // console.log(error);
    res.status(401).json({ error });
  }
});

router.get(
  "/stripeapikey",
  catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({ stripeApikey: process.env.STRIPE_API_KEY });
  })
);

export default router;
