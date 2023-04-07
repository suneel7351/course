const errorMiddle = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.status = err.status || 500;

  res.status(err.status).json({
    success: false,
    message: err.message,
  });
};
export default errorMiddle;
