const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * Verifies the Bearer JWT access token and attaches req.user
 */
const verifyJWT = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized('Access token is missing or malformed');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Access token has expired');
    throw ApiError.unauthorized('Invalid access token');
  }

  const user = await User.findById(decoded.id).select('-password -refreshToken');
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User not found or account deactivated');
  }

  req.user = user;
  next();
});

/**
 * Restricts access to admins only. Must be used after verifyJWT.
 */
const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    throw ApiError.forbidden('Admin access required');
  }
  next();
};

/**
 * Optionally attaches user if token is present (does not throw on missing token)
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
    } catch {
      // silently ignore invalid tokens in optional auth
    }
  }
  next();
});

module.exports = { verifyJWT, verifyAdmin, optionalAuth };
