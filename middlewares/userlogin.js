const JWT = require("jsonwebtoken");

const createJWTToken = (username, userId) => {
  console.log("In createJWTToken for ", username);
  const today = new Date();
  const exp = new Date(today);
  console.log("process.env.JWT_SECRET_KEY ", process.env.JWT_SECRET_KEY);
  const secret = process.env.JWT_SECRET_KEY;
  exp.setTime(today.getTime() + 900000);
  const payload = {
    username: username,
    userId: userId,
    exp: parseInt(exp.getTime() / 1000),
  };
  const token = JWT.sign(payload, secret);
  return { token, exp };
};

const protectRoute = (req, res, next) => {
  try {
    console.log("In protectRoute");
    const cookieName = "loginToken";
    const tokenCookie = req.cookies[cookieName];

    if (tokenCookie) {
      const loginToken = JWT.decode(tokenCookie, process.env.JWT_SECRET_KEY);
      console.log("loginToken.username", loginToken.username);
      req.username = loginToken.username;
      req.userId = loginToken.userId;
    } else {
      const notLoginError = new Error(
        "You are not authorised to perform this action"
      );
      notLoginError.statusCode = 403;
      throw notLoginError;
    }
  } catch (err) {
    next(err);
  }
  next();
};

module.exports = { createJWTToken, protectRoute };
