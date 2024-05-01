/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management APIs
 */

import express from 'express';
import User from '../model/user.js';
import { upload } from '../multer.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import sendMail from '../utils/sendMail.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import sendToken from '../utils/jwtToken.js';
import { isAdmin, isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v2/user/create-user:
 *   post:
 *     summary: Create a new user
 *     description: Register a new user with name, email, password, and avatar.
 *     tags: [User]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: The avatar image file to upload
 *       - in: formData
 *         name: name
 *         type: string
 *         description: User's name
 *       - in: formData
 *         name: email
 *         type: string
 *         description: User's email
 *       - in: formData
 *         name: password
 *         type: string
 *         description: User's password
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Bad request or user already exists
 *       '500':
 *         description: Internal server error
 */

// create user
router.post('/create-user', upload.single('file'), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userEmail = await User.findOne({ email });

    if (userEmail) {
      //deleting avater file so that the file didn't get created in uploads when user email is already register
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: 'Error while deleting file' });
        }
      });
      return next(new ErrorHandler('User already exists', 400));
    }

    const filename = req.file.filename;
    const fileUrl = path.join(filename);

    const user = {
      name: name,
      email: email,
      password: password,
      avatar: fileUrl
    };
    
    const firstName = name.split(' ')[0];
    const activationToken = createActivationToken(user);
    const activationUrl = `https://wbd-project.onrender.com/activation/${activationToken}`;
    try {
      await sendMail({
        email: user.email,
        subject: 'Activate your account',
        message: `Hello ${firstName}, please click on the link to activate your account: ${activationUrl}`
      });
      return res.status(201).json({
        success: true,
        message: `please check your email:- ${user.email} to activate your account!`
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// create activation token
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: '5m'
  });
};

// activate user
router.post(
  '/activation',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );
      if (!newUser) {
        return next(new ErrorHandler('Invalid token', 400));
      }
      const { name, email, password, avatar } = newUser;

      let user = await User.findOne({ email });

      if (user) {
        return next(new ErrorHandler('User already exists', 400));
      }
      user = await User.create({
        name,
        email,
        avatar,
        password
      });

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/user/login-user:
 *   post:
 *     summary: Log in user
 *     description: Log in user with email and password.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       '201':
 *         description: User logged in successfully
 *       '400':
 *         description: Bad request or user doesn't exist or incorrect password
 *       '500':
 *         description: Internal server error
 */

// login user
router.post(
  '/login-user',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler('Please provide the all fields!', 400));
      }

      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler('Please provide the correct information', 400)
        );
      }

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/user/getuser:
 *   get:
 *     summary: Get user information
 *     description: Retrieve user information by user ID.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '400':
 *         description: Bad request or user doesn't exist
 *       '500':
 *         description: Internal server error
 */

// load user
router.get(
  '/getuser',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/user/logout:
 *   get:
 *     summary: Log out user
 *     description: Log out the currently authenticated user by clearing the authentication token.
 *     tags: [User]
 *     responses:
 *       '201':
 *         description: User logged out successfully
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
 *                   description: Log out message
 *       '500':
 *         description: Internal server error
 */

// log out user
router.get(
  '/logout',
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie('token', '', {
        expires: new Date(0), // Set expiration to a past date
        httpOnly: true
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
 * /api/v2/user/update-user-info:
 *   put:
 *     summary: Update user information
 *     description: Update user information such as name, email, password, and phone number.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email
 *               password:
 *                 type: string
 *                 description: User's password
 *               name:
 *                 type: string
 *                 description: User's name
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number
 *     responses:
 *       '201':
 *         description: User information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '400':
 *         description: Bad request or user not found or incorrect password
 *       '500':
 *         description: Internal server error
 */

// update user info
router.put(
  '/update-user-info',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password, phoneNumber, name } = req.body;

      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return next(new ErrorHandler('User not found', 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler('Please provide the correct information', 400)
        );
      }

      user.name = name;
      user.email = email;
      user.phoneNumber = phoneNumber;

      await user.save();

      res.status(201).json({
        success: true,
        user
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/user/update-avatar:
 *   put:
 *     summary: Update user avatar
 *     description: Update the avatar image of the authenticated user.
 *     tags: [User]
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
 *                 description: The avatar image file to upload
 *     responses:
 *       '200':
 *         description: Avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '500':
 *         description: Internal server error
 */

// update user avatar
router.put(
  '/update-avatar',
  isAuthenticated,
  upload.single('image'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const existsUser = await User.findById(req.user.id);

      const existAvatarPath = `uploads/${existsUser.avatar}`;

      fs.unlinkSync(existAvatarPath);

      const fileUrl = path.join(req.file.filename);

      const user = await User.findByIdAndUpdate(req.user.id, {
        avatar: fileUrl
      });

      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/user/update-user-addresses:
 *   put:
 *     summary: Update user addresses
 *     description: Update user addresses by adding a new address or modifying an existing one.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: ID of the address to update (optional, if updating an existing address)
 *               addressType:
 *                 type: string
 *                 description: Type of the address (e.g., home, work)
 *     responses:
 *       '200':
 *         description: User addresses updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '500':
 *         description: Internal server error
 */

// update user addresses
router.put(
  '/update-user-addresses',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      const sameTypeAddress = user.addresses.find(
        (address) => address.addressType === req.body.addressType
      );
      if (sameTypeAddress) {
        return next(
          new ErrorHandler(`${req.body.addressType} address already exists`)
        );
      }

      const existsAddress = user.addresses.find(
        (address) => address._id === req.body._id
      );
      if (existsAddress) {
        Object.assign(existsAddress, req.body);
      } else {
        // add the new address to the array
        user.addresses.push(req.body);
      }

      await user.save();

      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/user/delete-user-address/{id}:
 *   delete:
 *     summary: Delete user address
 *     description: Delete a specific address of the authenticated user by its ID.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the address to delete
 *     responses:
 *       '200':
 *         description: User address deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '500':
 *         description: Internal server error
 */

// delete user address
router.delete(
  '/delete-user-address/:id',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;

      // console.log(addressId);

      await User.updateOne(
        {
          _id: userId
        },
        { $pull: { addresses: { _id: addressId } } }
      );

      const user = await User.findById(userId);

      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/user/update-user-password:
 *   put:
 *     summary: Update user password
 *     description: Update the password of the authenticated user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: The user's current password
 *               newPassword:
 *                 type: string
 *                 description: The user's new password
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmation of the new password
 *     responses:
 *       '200':
 *         description: Password updated successfully
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
 *         description: Bad request or old password is incorrect or passwords do not match
 *       '500':
 *         description: Internal server error
 */

// update user password
router.put(
  '/update-user-password',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select('+password');

      const isPasswordMatched = await user.comparePassword(
        req.body.oldPassword
      );

      if (!isPasswordMatched) {
        return next(new ErrorHandler('Old password is incorrect!', 400));
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(
          new ErrorHandler("Password doesn't matched with each other!", 400)
        );
      }
      user.password = req.body.newPassword;

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password updated successfully!'
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/user/user-info/{id}:
 *   get:
 *     summary: Get user information by ID
 *     description: Retrieve user information by user ID.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve information
 *     responses:
 *       '201':
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '500':
 *         description: Internal server error
 */

// find user infoormation with the userId
router.get(
  '/user-info/:id',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      res.status(201).json({
        success: true,
        user
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/user/admin-all-users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Retrieve all users excluding the admin users.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '201':
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       '500':
 *         description: Internal server error
 */

// all users --- for admin
router.get(
  '/admin-all-users',
  isAuthenticated,
  isAdmin('Admin'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const users = await User.find({ role: { $ne: 'Admin' } }).sort({
        createdAt: -1
      });
      res.status(201).json({
        success: true,
        users
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @swagger
 * /api/v2/user/delete-user/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     description: Delete a user by their ID. This operation is restricted to administrators only.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to delete
 *     responses:
 *       '201':
 *         description: User deleted successfully
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
 *         description: Bad request or user not found
 *       '500':
 *         description: Internal server error
 */

// delete users --- admin
router.delete(
  '/delete-user/:id',
  isAuthenticated,
  isAdmin('Admin'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(
          new ErrorHandler('User is not available with this id', 400)
        );
      }

      await User.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: 'User deleted successfully!'
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

export default router;
