/**
 * Basic Error Handling Middleware
 * Catch errors thrown from routes or database queries and return a uniform JSON response
 */
const errorHandler = (err, req, res, next) => {
  // Log the complete error trace in the console
  console.error(err.stack);

  // If the status code is inadvertently still 200, assume 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // We only expose stack trace during development to avoid leaking sensitve code details
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  errorHandler
};
