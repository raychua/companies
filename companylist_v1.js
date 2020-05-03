const express = require("express");
const api = express.Router();
const { protectRoute } = require("./middlewares/userlogin");
const companyRouter = require("./routes/companies.route");
const userRouter = require("./routes/user.route");

api.use("/companies", protectRoute, companyRouter);
api.use("/user", userRouter);

api.get("/", (req, res) => {
  res.status(200).send("Version 1 of company list API");
});

module.exports = api;
