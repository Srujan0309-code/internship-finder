const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { generateTokenPair, verifyRefreshToken } = require('../services/tokenService');
const bcrypt = require('bcryptjs');

const setTokenCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 mins
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already registered');

  // Prevent arbitrary admin creation via API (only first admin or env-seeded)
  const safeRole = role === 'admin' ? 'user' : (role || 'user');

  const user = await User.create({ name, email, password, role: safeRole });
  const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);

  // Store hashed refresh token
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);

  return ApiResponse.created(res, {
    user: user.toSafeObject(),
    accessToken, // Keeping in body for legacy/mobile clients
  }, 'Registration successful');
});

/**
 * @desc    Login
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !user.isActive) throw ApiError.unauthorized('Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid credentials');

  const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);

  return ApiResponse.success(res, {
    user: user.toSafeObject(),
    accessToken,
  }, 'Login successful');
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) throw ApiError.badRequest('Refresh token is required');

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || !user.refreshToken) throw ApiError.unauthorized('Session expired, please login again');

  const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isValid) throw ApiError.unauthorized('Refresh token mismatch');

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id, user.role);
  user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, newRefreshToken);

  return ApiResponse.success(res, { accessToken }, 'Token refreshed');
});

/**
 * @desc    Logout (invalidate refresh token)
 * @route   POST /api/v1/auth/logout
 * @access  Protected
 */
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: '' } });
  
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  
  return ApiResponse.success(res, null, 'Logged out successfully');
});

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Protected
 */
const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, { user: req.user });
});

module.exports = { register, login, refresh, logout, getMe };
