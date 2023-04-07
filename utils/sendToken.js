const sendToken = (res, status, message, token) => {
  const options = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.COOKIE_MAX_AGE * 24 * 60 * 60 * 1000
    ),
    secure: true,
    sameSite: "none",
  };

  res
    .status(status)
    .cookie("token", token, options)
    .json({ success: true, message });
};
export default sendToken;
