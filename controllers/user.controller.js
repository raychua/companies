const User = require("../models/user.model");
const { uuid } = require("uuidv4");
const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const { createJWTToken } = require("../middlewares/userlogin");

const getOneUser = async (req, res, next) => {
  try {
    console.log("In getOneUser");
    const userFound = await User.findOne({ username: req.username });

    if (userFound) {
      res.status(200).json(userFound);
    } else {
      const notFoundError = new Error("User name is not found");
      notFoundError.statusCode(404);
      throw notFoundError;
    }
  } catch (err) {
    next(err);
  }
};

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(5).required(),
    firstName: Joi.string().min(1).required(),
    lastName: Joi.string().min(1).required(),
    password: Joi.string().min(5),
    email: Joi.string().required(),
  });
  return schema.validate(user);
}

const registerUser = async (req, res, next) => {
  console.log("In registerUser:", req.body);
  try {
    const validationError = validateUser(req.body);
    if (validationError.error) {
      const valError = new Error(validationError.error.details[0].message);
      (valError.status = 400), next(valError);
    } else {
      const user = {
        userId: uuid(),
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      };
      const newUser = new User(user);
      await newUser.save();
      res.status(201).json(newUser);
    }
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  console.log("In login");
  try {
    const userFound = await User.findOne({ username: req.body.username });
    let correctPassword = false;
    if (userFound) {
      correctPassword = await bcrypt.compare(
        req.body.password,
        userFound.password
      );
    }
    if (userFound && correctPassword) {
      const cookieInfo = createJWTToken(userFound.username, userFound.userId);
      console.log("Before creating cookie");
      if (process.env.NODE_ENV === "production") {
        res.cookie("loginToken", cookieInfo.token, {
          expires: cookieInfo.exp,
          httpOnly: true,
          secure: true,
          //signed: true,
        });
      } else {
        res.cookie("loginToken", cookieInfo.token, {
          expires: cookieInfo.exp,
          httpOnly: true,
          //signed: true,
          //secure: true,
        });
      }
      res.status(200).send("You have logged in successfully");
    } else {
      const loginError = new Error(
        "Incorrect username or password. Please try again."
      );
      loginError.statusCode = 403;
      throw loginError;
    }
  } catch (err) {
    res.clearCookie("loginToken");
    next(err);
  }
};

const logout = (req, res, next) => {
  console.log("In logout");
  res.clearCookie("loginToken");
  res.status(200).json("You have logged out successfully");
  next();
};

module.exports = { getOneUser, registerUser, login, logout };
