const sendToken = (res, status, message, token, user) => {
  user = {
    avatar: user.avatar,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    playlist: user.playlist,
  };
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
    .json({ success: true, message, user });
};
export default sendToken;
