import { React, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import styles from '../../styles/styles';
import { Link } from 'react-router-dom';
import { RxAvatar } from 'react-icons/rx';
import axios from 'axios';
import { server } from '../../server';
import { toast } from 'react-toastify';
import images from '../../Assests';
import { CgSpinner } from 'react-icons/cg';


const Singup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [errors, setErrors] = useState({});
  const [isRequesting, setIsRequesting] = useState(false);


  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (/\d/.test(name)) {
      newErrors.name = 'Name should not contain numbers';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password should be at least 8 characters long';
    }

    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

  const handleChangeName = (e) => {
    setName(e.target.value);
    // Clear the error for name when user starts typing
    setErrors((prevErrors) => ({ ...prevErrors, name: undefined }));
  };

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
    // Clear the error for email when user starts typing
    setErrors((prevErrors) => ({ ...prevErrors, email: undefined }));
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    // Clear the error for password when user starts typing
    setErrors((prevErrors) => ({ ...prevErrors, password: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsRequesting(true);
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const newForm = new FormData();

      newForm.append('file', avatar);
      newForm.append('name', name);
      newForm.append('email', email);
      newForm.append('password', password);

      axios
        .post(`${server}/user/create-user`, newForm, config)
        .then((res) => {
          setIsRequesting(false);
          toast.success(res.data.message);
          setName('');
          setEmail('');
          setPassword('');
          setAvatar(null);
          setErrors({});
        })
        .catch((error) => {
          setIsRequesting(false);
          toast.error(error.response.data.message);
        });
    }
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
          <h2 className="mb-10 text-center text-3xl font-extrabold text-gray-900">
            Register as a new user
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={handleChangeName}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="text-red-500 text-sm mt-2">
                {errors.name && errors.name}
              </div>
            </div>

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

            <div>
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700"
              ></label>
              <div className="mt-2 flex items-center">
                <span className="inline-block h-8 w-8 rounded-full overflow-hidden">
                  {avatar ? (
                    <img
                      src={URL.createObjectURL(avatar)}
                      alt="avatar"
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <RxAvatar className="h-8 w-8" />
                  )}
                </span>
                <label
                  htmlFor="file-input"
                  className="ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <span>Upload a file</span>
                  <input
                    type="file"
                    name="avatar"
                    id="file-input"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                    className="sr-only"
                  />
                </label>
              </div>
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
              <h4>Already have an account?</h4>
              <Link to="/login" className="text-blue-600 pl-2">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Singup;
