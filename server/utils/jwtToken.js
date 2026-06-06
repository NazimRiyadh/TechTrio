import jwt from "jsonwebtoken";

// Strip any fields that must never leave the server
const sanitizeUser = (user) => {
  const { password, reset_password_token, reset_password_expires, ...safe } =
    user;
  return safe;
};

export const sendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.cookie("token", token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: sanitizeUser(user),
  });
};

