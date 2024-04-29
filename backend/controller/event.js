/**
 * @swagger
 * tags:
 *   name: Event
 *   description: Event management APIs
 */
import express from "express";
import { upload } from "../multer.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import fs from "fs";
import { isAdmin, isAuthenticated, isSeller } from "../middleware/auth.js";
import Shop from "../model/shop.js";
import Event from "../model/event.js";

const router = express.Router();

/**
 * @swagger
 * /api/v2/event/create-event:
 *   post:
 *     summary: Create a new event
 *     description: Create a new event in the system. Images can be uploaded along with the event creation.
 *     tags: [Event]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               shopId:
 *                 type: string
 *                 description: The ID of the shop where the event is associated.
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Images related to the event
 *               OtherEventData:
 *                 type: string
 *                 description: Other data related to the event
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
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

// create event
router.post(
  "/create-event",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      } else {
        const files = req.files;
        const imageUrls = files.map((file) => `${file.filename}`);

        const eventData = req.body;
        eventData.images = imageUrls;
        eventData.shop = shop;

        const product = await Event.create(eventData);

        res.status(201).json({
          success: true,
          product,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

/**
 * @swagger
 * /api/v2/event/get-all-events:
 *   get:
 *     summary: Get all events
 *     description: Retrieve all events available in the system.
 *     tags: [Event]
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
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

// get all events
router.get("/get-all-events", async (req, res, next) => {
  try {
    const events = await Event.find();
    res.status(201).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

/**
 * @swagger
 * /api/v2/event/get-all-events/{id}:
 *   get:
 *     summary: Get all events by shop ID
 *     description: Retrieve all events associated with a specific shop ID.
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Shop ID to retrieve events for
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
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

// get all events of a shop
router.get(
  "/get-all-events/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find({ shopId: req.params.id });

      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

/**
 * @swagger
 * /api/v2/event/delete-shop-event/{id}:
 *   delete:
 *     summary: Delete a shop event by ID
 *     description: Delete a shop event by its ID.
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the event to delete
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

// delete event of a shop
router.delete(
  "/delete-shop-event/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;

      const eventData = await Event.findById(productId);

      eventData.images.forEach((imageUrl) => {
        const filename = imageUrl;
        const filePath = `uploads/${filename}`;

        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
          }
        });
      });

      const event = await Event.findByIdAndDelete(productId);

      if (!event) {
        return next(new ErrorHandler("Event not found with this id!", 500));
      }

      res.status(201).json({
        success: true,
        message: "Event Deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

/**
 * @swagger
 * /api/v2/event/admin-all-events:
 *   get:
 *     summary: Get all events (admin only)
 *     description: Retrieve all events, accessible only to admin users.
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
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
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       '500':
 *         description: Internal server error
 */

// all events --- for admin
router.get(
  "/admin-all-events",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

export default router;
