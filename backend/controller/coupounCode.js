/**
 * @swagger
 * tags:
 *   name: Coupon
 *   description: Coupon management APIs
 */
import express from "express";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import { isSeller } from "../middleware/auth.js";
import Shop from "../model/shop.js";
import CoupounCode from "../model/coupounCode.js";

const router = express.Router();

/**
 * @swagger
 * /api/v2/coupon/create-coupon-code:
 *   post:
 *     summary: Create a new coupon code
 *     description: Create a new coupon code, accessible only to sellers.
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CouponCode'
 *     responses:
 *       '201':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 coupounCode:
 *                   $ref: '#/components/schemas/CouponCode'
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

// create coupoun code
router.post(
  "/create-coupon-code",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const isCoupounCodeExists = await CoupounCode.find({
        name: req.body.name,
      });

      if (isCoupounCodeExists.length !== 0) {
        return next(new ErrorHandler("Coupoun code already exists!", 400));
      }

      const coupounCode = await CoupounCode.create(req.body);

      res.status(201).json({
        success: true,
        coupounCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

/**
 * @swagger
 * /api/v2/coupon/get-coupon/{id}:
 *   get:
 *     summary: Get coupon codes by shop ID
 *     description: Retrieve coupon codes associated with a specific shop, accessible only to sellers.
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Shop ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 couponCodes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CouponCode'
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

// get all coupons of a shop
router.get(
  "/get-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCodes = await CoupounCode.find({ shopId: req.seller.id });
      res.status(201).json({
        success: true,
        couponCodes,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

/**
 * @swagger
 * /api/v2/coupon/delete-coupon/{id}:
 *   delete:
 *     summary: Delete coupon code by ID
 *     description: Delete a coupon code by its ID, accessible only to sellers.
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Coupon code ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 message:
 *                   type: string
 *                   description: Message indicating the success of the operation
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

// delete coupoun code of a shop
router.delete(
  "/delete-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findByIdAndDelete(req.params.id);

      if (!couponCode) {
        return next(new ErrorHandler("Coupon code dosen't exists!", 400));
      }
      res.status(201).json({
        success: true,
        message: "Coupon code deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

/**
 * @swagger
 * /api/v2/coupon/get-coupon-value/{name}:
 *   get:
 *     summary: Get coupon code by name
 *     description: Get the details of a coupon code by its name.
 *     tags: [Coupon]
 *     parameters:
 *       - in: path
 *         name: name
 *         description: Coupon code name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 couponCode:
 *                   type: object
 *                   description: Details of the coupon code
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

// get coupon code value by its name
router.get(
  "/get-coupon-value/:name",
  catchAsyncErrors(async (req, res, next) => {
    console.log(req.params);
    try {
      const couponCode = await CoupounCode.findOne({ name: req.params.name });

      res.status(200).json({
        success: true,
        couponCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

export default router;
