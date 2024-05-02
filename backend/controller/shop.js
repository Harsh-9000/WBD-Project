/**
 * @swagger
 * tags:
 *   name: Shop
 *   description: Shop management APIs
 */

import express from 'express';
import { upload } from '../multer.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import sendMail from '../utils/sendMail.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import sendShopToken from '../utils/shopToken.js';
import { isAdmin, isAuthenticated, isSeller } from '../middleware/auth.js';
import Shop from '../model/shop.js';

const router = express.Router();

/**
 * @swagger
 * /api/v2/shop/create-shop:
 *   post:
 *     summary: Create a new shop
 *     description: Register a new shop with the provided information.
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The avatar image of the shop
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the shop owner
 *               name:
 *                 type: string
 *                 description: Name of the shop
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the shop owner
 *               address:
 *                 type: string
 *                 description: Address of the shop
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number of the shop owner
 *               zipCode:
 *                 type: string
 *                 description: Zip code of the shop location
 *     responses:
 *       '201':
 *         description: Shop created successfully
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
 *                   description: Success message
 *       '400':
 *         description: Bad request or shop already exists
 *       '500':
 *         description: Internal server error
 */

// create shop
router.post(
  '/create-shop',
  upload.single('file'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email ,name} = req.body;
      const sellerEmail = await Shop.findOne({ email });
      if (sellerEmail) {
        //deleting avater file so that the file didn't get created in uploads when seller email is already register
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: 'Error while deleting file' });
          }
        });
        return next(new ErrorHandler('Seller already exists', 400));
      }

      const filename = req.file.filename;
      const fileUrl = path.join(filename);

      const seller = {
        name: name,
        email: email,
        password: req.body.password,
        avatar: fileUrl,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        zipCode: req.body.zipCode
      };


      const firstName = name.split(' ')[0];
      const activationToken = createActivationToken(seller);
      const activationUrl = `https://wbd-project-client.vercel.app/activation/${activationToken}`;

      try {
        await sendMail({
          email: seller.email,
          subject: 'Activate your Shop',
          message: `Hello ${firstName}, please click on the link to activate your shop: ${activationUrl}`
        });
        res.status(201).json({
          success: true,
          message: `please check your email:- ${seller.email} to activate your shop!`
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// create activation token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: '5m'
  });
};

// activate user
router.post(
  '/activation',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        return next(new ErrorHandler('Invalid token', 400));
      }
      const { name, email, password, avatar, zipCode, address, phoneNumber } =
        newSeller;

      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(new ErrorHandler('User already exists', 400));
      }

      seller = await Shop.create({
        name,
        email,
        avatar,
        password,
        zipCode,
        address,
        phoneNumber
      });

      sendShopToken(seller, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/shop/login-shop:
 *   post:
 *     summary: Login as a seller
 *     description: Log in as a seller using email and password.
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the seller
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password of the seller
 *     responses:
 *       '201':
 *         description: Seller logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 token:
 *                   type: string
 *                   description: Authentication token for the logged-in seller
 *       '400':
 *         description: Bad request or seller not found
 *       '500':
 *         description: Internal server error
 */

// login shop
router.post(
  '/login-shop',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler('Please provide the all fields!', 400));
      }

      const user = await Shop.findOne({ email }).select('+password');

      if (!user) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler('Please provide the correct information', 400)
        );
      }

      sendShopToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/shop/getSeller:
 *   get:
 *     summary: Get seller information
 *     description: Retrieve information about the currently logged-in seller.
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Seller information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 seller:
 *                   type: object
 *                   description: Information about the seller
 *       '400':
 *         description: Bad request or seller not found
 *       '500':
 *         description: Internal server error
 */

// load shop
router.get(
  '/getSeller',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        seller
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/shop/logout:
 *   get:
 *     summary: Logout from seller account
 *     description: Logout from the currently logged-in seller account.
 *     tags: [Shop]
 *     responses:
 *       '201':
 *         description: Seller logged out successfully
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
 *                   description: Logout success message
 *       '500':
 *         description: Internal server error
 */

// log out from shop
router.get(
  '/logout',
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie('seller_token', null, {
        expires: new Date(0),
        secure: true,
        sameSite: "none"
      });
      res.status(201).json({
        success: true,
        message: 'Log out successful!'
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/shop/get-shop-info/{id}:
 *   get:
 *     summary: Get shop information by ID
 *     description: Retrieve information about a shop by its ID.
 *     tags: [Shop]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the shop to retrieve information about
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: Shop information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 shop:
 *                   type: object
 *                   description: Information about the shop
 *       '400':
 *         description: Bad request or shop not found
 *       '500':
 *         description: Internal server error
 */

// get shop info
router.get(
  '/get-shop-info/:id',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/shop/update-shop-avatar:
 *   put:
 *     summary: Update shop avatar
 *     description: Update the avatar image of the logged-in seller's shop.
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to be uploaded as the shop's new avatar
 *     responses:
 *       '200':
 *         description: Shop avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 seller:
 *                   type: object
 *                   description: Information about the updated shop
 *       '500':
 *         description: Internal server error
 */

// update shop profile picture
router.put(
  '/update-shop-avatar',
  isSeller,
  upload.single('image'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const existsUser = await Shop.findById(req.seller._id);

      const existAvatarPath = `uploads/${existsUser.avatar}`;

      fs.unlinkSync(existAvatarPath);

      const fileUrl = path.join(req.file.filename);

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        avatar: fileUrl
      });

      res.status(200).json({
        success: true,
        seller
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/shop/update-seller-info:
 *   put:
 *     summary: Update seller information
 *     description: Update the information of the logged-in seller.
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the seller/shop
 *               description:
 *                 type: string
 *                 description: The new description of the seller/shop
 *               address:
 *                 type: string
 *                 description: The new address of the seller/shop
 *               phoneNumber:
 *                 type: string
 *                 description: The new phone number of the seller/shop
 *               zipCode:
 *                 type: string
 *                 description: The new zip code of the seller/shop
 *     responses:
 *       '201':
 *         description: Seller information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 shop:
 *                   type: object
 *                   description: Information about the updated seller/shop
 *       '500':
 *         description: Internal server error
 */

// update seller info
router.put(
  '/update-seller-info',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findOne(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler('User not found', 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;

      await shop.save();

      res.status(201).json({
        success: true,
        shop
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/shop/admin-all-sellers:
 *   get:
 *     summary: Get all sellers (for admin)
 *     description: Fetch all sellers registered in the system. Only accessible by admin users.
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for paginated results (default: 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The maximum number of results per page (default: 10)
 *     responses:
 *       '201':
 *         description: List of sellers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 sellers:
 *                   type: array
 *                   description: List of sellers
 *                   items:
 *                     $ref: '#/components/schemas/Shop'
 *       '500':
 *         description: Internal server error
 */

// all sellers --- for admin
router.get(
  '/admin-all-sellers',
  isAuthenticated,
  isAdmin('Admin'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1
      });
      res.status(201).json({
        success: true,
        sellers
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/shop/delete-seller/{id}:
 *   delete:
 *     summary: Delete a seller (for admin)
 *     description: Delete a seller by ID. Only accessible by admin users.
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the seller to delete
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: Seller deleted successfully
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
 *                   description: Message indicating successful deletion
 *       '400':
 *         description: Seller not found
 *       '500':
 *         description: Internal server error
 */

// delete seller ---admin
router.delete(
  '/delete-seller/:id',
  isAuthenticated,
  isAdmin('Admin'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(
          new ErrorHandler('Seller is not available with this id', 400)
        );
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: 'Seller deleted successfully!'
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/shop/update-payment-methods:
 *   put:
 *     summary: Update payment methods
 *     description: Update payment methods for the current seller.
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               withdrawMethod:
 *                 type: string
 *                 description: The updated payment method
 *     responses:
 *       '201':
 *         description: Payment methods updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 seller:
 *                   $ref: '#/components/schemas/Seller'
 *       '500':
 *         description: Internal server error
 */

// update seller withdraw methods --- sellers
router.put(
  '/update-payment-methods',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        withdrawMethod
      });

      res.status(201).json({
        success: true,
        seller
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/shop/delete-withdraw-method:
 *   delete:
 *     summary: Delete withdraw method
 *     description: Delete the withdraw method for the current seller.
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '201':
 *         description: Withdraw method deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 seller:
 *                   $ref: '#/components/schemas/Seller'
 *       '500':
 *         description: Internal server error
 */

// delete seller withdraw merthods --- only seller
router.delete(
  '/delete-withdraw-method/',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler('Seller not found with this id', 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

export default router;
