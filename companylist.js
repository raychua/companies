const express = require("express");
const cookieParser = require("cookie-parser");
const apiVersion1 = require("./companylist_v1");

require("./utils/companyDB");

const app = express();

app.use(cookieParser(process.env.COOKIE_SECRET_KEY));
app.use("/v1", apiVersion1);

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  res.status(err.statusCode).send(err.message);
});

module.exports = app;
