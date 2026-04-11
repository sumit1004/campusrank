const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and protect routes
 */

const protect = (req, res, next) => {
  let token;

  // Check if token exists in headers with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token (Remove "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // Verify and decode token using JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the decoded user data (id, role) to req.user
      req.user = decoded;

      next(); // Proceed to the next middleware or route
    } catch (error) {
      console.error(error);
      res.status(401);
      return next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token available'));
  }
};

/**
 * Middleware to restrict access based on user role
 * @param  {...string} roles - Dynamic roles allowed to pass
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is guaranteed to be set by the preceding "protect" middleware
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403); // HTTP 403 Forbidden
      return next(new Error(`Role: '${req.user ? req.user.role : 'Unknown'}' is not authorized to access this resource`));
    }
    next();
  };
};

const optionalProtect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Don't error out, just don't set req.user
    }
  }
  next();
};

const allowRoles = authorize;
module.exports = { protect, optionalProtect, authorize, allowRoles };
