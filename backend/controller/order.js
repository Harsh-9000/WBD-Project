/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management APIs
 */
import express from "express";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import { isAdmin, isAuthenticated, isSeller } from "../middleware/auth.js";
import Product from "../model/product.js";
import Order from "../model/order.js";
import Shop from "../model/shop.js";

const router = express.Router();

/**
 * @swagger
 * /api/v2/order/create-order:
 *   post:
 *     summary: Create an order
 *     description: Create an order with items from the cart grouped by shop, and calculate the total price for each shop.
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cart:
 *                 type: array
 *                 items:
 *                   type: object
 *                   description: Cart items
 *               shippingAddress:
 *                 type: object
 *                 description: Shipping address
 *               user:
 *                 type: string
 *                 description: User ID
 *               totalPrice:
 *                 type: number
 *                 description: Total price of the order
 *               paymentInfo:
 *                 type: object
 *                 description: Payment information
 *     responses:
 *       '201':
 *         description: Successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Order details
 *       '500':
 *         description: Internal server error
 */

// create new order
router.post(
    "/create-order",
    catchAsyncErrors(async (req, res, next) => {
      try {
        const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;
  
        //   group cart items by shopId
        const shopItemsMap = new Map();
  
        for (const item of cart) {
          const shopId = item.shopId;
          if (!shopItemsMap.has(shopId)) {
            shopItemsMap.set(shopId, []);
          }
          shopItemsMap.get(shopId).push(item);
        }
  
        // create an order for each shop
        const orders = [];
  
        for (const [shopId, items] of shopItemsMap) {
          let totPrice=0;
          for (let i = 0; i < items.length; i++) {
             let price = items[i].discountPrice;
             totPrice+=price;
          }
          const order = await Order.create({
            cart: items,
            shippingAddress,
            user,
            totalPrice:totPrice,
            paymentInfo,
          });
          orders.push(order);
        }
  
        res.status(201).json({
          success: true,
          orders,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    })
  );

/**
* @swagger
* /api/v2/order/get-all-orders/{userId}:
*   get:
*     summary: Get all orders for a user
*     description: Retrieve all orders associated with a specific user.
*     tags: [Order]
*     parameters:
*       - in: path
*         name: userId
*         required: true
*         description: ID of the user whose orders are to be retrieved
*         schema:
*           type: string
*     responses:
*       '200':
*         description: Successfully retrieved
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   description: Indicates if the request was successful
*                 orders:
*                   type: array
*                   items:
*                     type: object
*                     description: Order details
*       '500':
*         description: Internal server error
*/

  // get all orders of user
router.get(
  "/get-all-orders/:userId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({ "user._id": req.params.userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/order/get-seller-all-orders/{shopId}:
 *   get:
 *     summary: Get all orders for a seller
 *     description: Retrieve all orders associated with a specific seller's shop.
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         description: ID of the shop whose orders are to be retrieved
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Order details
 *       '500':
 *         description: Internal server error
 */

// get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/order/update-order-status/{id}:
 *   put:
 *     summary: Update order status
 *     description: Update the status of a specific order identified by its ID.
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the order to be updated
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         description: JWT authorization header
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: New status of the order
 *           example:
 *             status: Delivered
 *     responses:
 *       '200':
 *         description: Successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 order:
 *                   type: object
 *                   description: Updated order details
 *       '500':
 *         description: Internal server error
 */

// update order status for seller
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }
      if (req.body.status === "Transferred to delivery partner") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
      }

      order.status = req.body.status;

      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";
        const serviceCharge = order.totalPrice * .10;
        await updateSellerInfo(order.totalPrice - serviceCharge);
      }

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
      });

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);

        product.stock -= qty;
        product.sold_out += qty;

        await product.save({ validateBeforeSave: false });
      }

      async function updateSellerInfo(amount) {
        const seller = await Shop.findById(req.seller.id);
        
        seller.availableBalance = amount;

        await seller.save();
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/order/order-refund/{id}:
 *   put:
 *     summary: Request order refund
 *     description: Request a refund for a specific order identified by its ID.
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the order to be refunded
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         description: JWT authorization header
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: New status of the order (e.g., "Refund Requested")
 *           example:
 *             status: Refund Requested
 *     responses:
 *       '200':
 *         description: Successfully requested order refund
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 order:
 *                   type: object
 *                   description: Updated order details
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       '500':
 *         description: Internal server error
 */

// give a refund ----- user
router.put(
  "/order-refund/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Order Refund Request successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/order/order-refund-success/{id}:
 *   put:
 *     summary: Confirm order refund success
 *     description: Confirm that the refund for a specific order identified by its ID was successful.
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the order for which the refund was successful
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         description: JWT authorization header
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: New status of the order (e.g., "Refund Success")
 *           example:
 *             status: Refund Success
 *     responses:
 *       '200':
 *         description: Successfully confirmed order refund success
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
 *                   description: Confirmation message
 *       '500':
 *         description: Internal server error
 */

// accept the refund ---- seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order Refund successfull!",
      });

      if (req.body.status === "Refund Success") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
      }

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);

        product.stock += qty;
        product.sold_out -= qty;

        await product.save({ validateBeforeSave: false });
      };

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/order/admin-all-orders:
 *   get:
 *     summary: Get all orders (admin)
 *     description: Retrieve all orders in the system. Only accessible to admins.
 *     tags: [Order]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: JWT authorization header
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: Successfully retrieved all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       '500':
 *         description: Internal server error
 */
// all orders --- for admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


export default router;
