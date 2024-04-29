import React, { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import styles from '../../styles/styles';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../server';
import { toast } from 'react-toastify';
import images from '../../Assests';
import { RxCross1 } from 'react-icons/rx';
import { CgSpinner } from 'react-icons/cg';

const ShopLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsRequesting(true);
      await axios
        .post(
          `${server}/shop/login-shop`,
          {
            email,
            password
          },
          { withCredentials: true }
        )
        .then((res) => {
          setIsRequesting(false);
          toast.success('Login Success!');
          navigate('/dashboard');
          window.location.reload(true);
        })
        .catch((err) => {
          setIsRequesting(false);
          toast.error(err.response.data.message);
        });
    }
  };

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
    // Clear the error for email when the user starts typing
    setErrors((prevErrors) => ({ ...prevErrors, email: undefined }));
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    // Clear the error for password when the user starts typing
    setErrors((prevErrors) => ({ ...prevErrors, password: undefined }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white pb-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex items-center justify-center">
            <Link to="/">
              <img
                className="h-[90px] w-[100px] scale-75"
                src={images.Logo}
                alt="Logo"
              />
            </Link>
          </div>
          <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
            Login to your shop
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleChangeEmail}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="text-red-500 text-sm mt-2">
                {errors.email && errors.email}
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={visible ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handleChangePassword}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {visible ? (
                  <AiOutlineEye
                    className="absolute right-2 top-2 cursor-pointer"
                    size={25}
                    onClick={() => setVisible(false)}
                  />
                ) : (
                  <AiOutlineEyeInvisible
                    className="absolute right-2 top-2 cursor-pointer"
                    size={25}
                    onClick={() => setVisible(true)}
                  />
                )}
              </div>
              <div className="text-red-500 text-sm mt-2">
                {errors.password && errors.password}
              </div>
            </div>
            <div className={`${styles.noramlFlex} justify-between`}>
              <div className={`${styles.noramlFlex}`}>
                <input
                  type="checkbox"
                  name="remember-me"
                  id="remember-me"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <div
                  onClick={() => setOpen(!open)}
                  className="cursor-pointer font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </div>
              </div>
              {open ? (
                <ForgotPasswordCard setOpen={setOpen} role="seller" />
              ) : null}
            </div>
            <div>
              <button
                disabled={isRequesting}
                type="submit"
                className="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black disabled:cursor-not-allowed "
              >
                {isRequesting ? (
                  <CgSpinner size={20} className=" inline animate-spin" />
                ) : (
                  <span>Submit</span>
                )}
              </button>
            </div>
            <div className={`${styles.noramlFlex} w-full`}>
              <h4>Not have any account?</h4>
              <Link to="/shop-create" className="text-blue-600 pl-2">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ForgotPasswordCard = ({ setOpen, role }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isRequesting, setIsRequesting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (validateForm()) {
      setIsRequesting(true);
      await axios
        .post(`${server}/auth/reset`, {
          role,
          email: email
        })
        .then((res) => {
          setOpen(false);
          setIsRequesting(false);
          toast.success(res.data.message);
          setErrors({});
          setEmail('');
          console.log(res);
        })
        .catch((err) => {
          setIsRequesting(false);
          toast.error(err.response.data.message);
        });
    }
  };

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
    // Clear the error for email when the user starts typing
    setErrors((prevErrors) => ({ ...prevErrors, email: undefined }));
  };

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="fixed w-full h-screen top-0 left-0 bg-[#1a1a1a30] z-40 flex items-center justify-center  ">
      <div className=" min-w-[40%] 1200px:min-w-[30%]  800px:max-w-[50%] 1200px:w-[35%] h-[45%] bg-white rounded-lg  shadow-xl relative p-8 800px:p-4">
        <RxCross1
          size={20}
          className="absolute right-3 top-3 z-50 cursor-pointer"
          onClick={() => setOpen(false)}
        />
        <div className="flex flex-col justify-evenly">
          <h4 className="my-8 text-center text-3xl font-extrabold text-gray-900">
            Enter the Email Address
          </h4>

          <div>
            <label
              htmlFor="email"
              className="block text-sm md:text-base font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleChangeEmail}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm md:text-base"
              />
            </div>
            <div className="text-red-500 text-sm mt-2 mb-4">
              {errors.email && errors.email}
            </div>
          </div>
          <button
            disabled={isRequesting}
            onClick={handleSubmit}
            className="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black disabled:cursor-not-allowed "
          >
            {isRequesting ? (
              <CgSpinner size={20} className=" inline animate-spin" />
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                  />
                </svg>
                &nbsp;
                <span>Reset password</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopLogin;
