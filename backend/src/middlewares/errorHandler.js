const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error format
  const errorResponse = {
    error: err.message || 'Internal Server Error'
  };

  // If it's a specific known error, we can handle it
  // But for now, generic 500 or specified status
  const status = err.statusCode || 500;
  
  res.status(status).json(errorResponse);
};

module.exports = errorHandler;
