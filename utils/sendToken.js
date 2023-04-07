const sendToken = (res, status, message, token) => {
  const options = {
    httpOnly: true,
    maxAge: process.env.COOKIE_MAX_AGE * 60 * 1000,
    // secure: true,
  };

  res
    .status(status)
    .cookie("token", token, options)
    .json({ success: true, message });
};
export default sendToken;
