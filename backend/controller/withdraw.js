/**
 * @swagger
 * tags:
 *   name: Withdraw
 *   description: Withdraw management APIs
 */
import express from 'express';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import Withdraw from '../model/withdraw.js';
import sendMail from '../utils/sendMail.js';
import { isAdmin, isAuthenticated,isSeller } from '../middleware/auth.js';
import Shop from '../model/shop.js';


const router = express.Router();


/**
 * @swagger
 * /api/v2/withdraw/create-withdraw-request:
 *   post:
 *     summary: Create withdraw request
 *     description: Allows sellers to create a withdraw request for the available balance.
 *     tags: [Withdraw]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to withdraw
 *     responses:
 *       '201':
 *         description: Successfully created withdraw request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 withdraw:
 *                   $ref: '#/components/schemas/Withdraw'
 *       '500':
 *         description: Internal server error
 */

// create withdraw request --- only for seller
router.post(
  "/create-withdraw-request",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { amount } = req.body;

      const data = {
        seller: req.seller,
        amount,
      };

      try {
        await sendMail({
          email: req.seller.email,
          subject: "Withdraw Request",
          message: `Hello ${req.seller.name}, Your withdraw request of ${amount}$ is processing. It will take 3days to 7days to processing! `,
        });
        res.status(201).json({
          success: true,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }

      const withdraw = await Withdraw.create(data);

      const shop = await Shop.findById(req.seller._id);

      shop.availableBalance = shop.availableBalance - amount;

      await shop.save();

      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/withdraw/get-all-withdraw-request:
 *   get:
 *     summary: Get all withdraw requests
 *     description: Allows admins to retrieve all withdraw requests.
 *     tags: [Withdraw]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '201':
 *         description: Successfully retrieved all withdraw requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 withdraws:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Withdraw'
 *       '500':
 *         description: Internal server error
 */

// get all withdraws --- admnin

router.get(
  "/get-all-withdraw-request",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const withdraws = await Withdraw.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        withdraws,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/withdraw/update-withdraw-request/{id}:
 *   put:
 *     summary: Update withdraw request
 *     description: Allows admins to update the status of a withdraw request.
 *     tags: [Withdraw]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the withdraw request to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sellerId:
 *                 type: string
 *                 description: ID of the seller associated with the withdraw request
 *     responses:
 *       '201':
 *         description: Successfully updated withdraw request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 withdraw:
 *                   $ref: '#/components/schemas/Withdraw'
 *       '500':
 *         description: Internal server error
 */
// update withdraw request ---- admin
router.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { sellerId } = req.body;

      const withdraw = await Withdraw.findByIdAndUpdate(
        req.params.id,
        {
          status: "succeed",
          updatedAt: Date.now(),
        },
        { new: true }
      );

      const seller = await Shop.findById(sellerId);

      const transection = {
        _id: withdraw._id,
        amount: withdraw.amount,
        updatedAt: withdraw.updatedAt,
        status: withdraw.status,
      };

      seller.transections = [...seller.transections, transection];

      await seller.save();

      try {
        await sendMail({
          email: seller.email,
          subject: "Payment confirmation",
          message: `Hello ${seller.name}, Your withdraw request of ${withdraw.amount}$ is on the way. Delivery time depends on your bank's rules it usually takes 3days to 7days.`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

export default router;
