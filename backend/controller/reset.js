import express from 'express';
import User from '../model/user.js';
import sendMail from '../utils/sendMail.js';
import Shop from '../model/shop.js';
import ErrorHandler from '../utils/ErrorHandler.js';

const router = express.Router();

import { v4 as uuidv4 } from 'uuid';

router.post('/reset', async (req, res, next) => {
  try {
    let person;
    const { role, email } = req.body;
    if (!role) {
      return next(new ErrorHandler('Role is not mentioned!', 400));
    }
    if (!email) {
      return next(new ErrorHandler('Email not Provided!', 400));
    }
    const lowercaseRole = role.toLowerCase();
    switch (lowercaseRole) {
      case 'user':
        person = await User.findOne({ email: email });
        break;
      case 'seller':
        person = await Shop.findOne({ email: email });
        break;
      default:
        // Handle invalid or unsupported role values
        return next(new ErrorHandler('Role is not valid!', 400));
    }
    if (!person) {
      return next(new ErrorHandler('Email does not exist!', 400));
    }

    const token = uuidv4();
    person.resetToken = token;
    person.resetTokenExpiration = Date.now() + 5 * 60 * 1000; // 5 minutes in milliseconds
    await person.save();

    const firstName = person.name.split(' ')[0];
    const ResetTokenUrl = `http://localhost:3000/reset/${token}`;

    try {
      await sendMail({
        email: person.email,
        subject: 'Reset Your Password',
        message: `Hello ${firstName},\nPlease click on the link to reset your Password: ${ResetTokenUrl}\nThis link is valid for 5 minutes only.`
      });
      return res.status(201).json({
        success: true,
        message: `please check your email:- ${person.email} to Reset your password!`
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

router.post('/change-password', async (req, res, next) => {
  try {
    let person;
    const { token, password } = req.body;

    if (!token) {
      return next(new ErrorHandler('token is not provided!', 400));
    }
    if (!password) {
      return next(new ErrorHandler('password is not provided!', 400));
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }
    });

    const seller = await Shop.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }
    });

    if (!user && !seller) {
      return next(new ErrorHandler('Invalid token or token expired!', 400));
    }

    person = user || seller;

    person.password = password;
    person.resetToken = undefined;
    person.resetTokenExpiration = undefined;

    await person.save();

    const firstName = person.name.split(' ')[0];
    try {
      await sendMail({
        email: person.email,
        subject: 'Password Changed Successfully',
        message: `Hello ${firstName}, Your Password has been changed successfully.`
      });
      return res.status(201).json({
        success: true,
        message: `password changed successfully!`
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export default router;
