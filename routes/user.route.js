const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protectRoute } = require("../middlewares/userlogin");
router.use(express.json());

/* router.param("username", (req, res, next, username) => {
  req.username = username;
  next();
}); */

router.get("/", protectRoute, userController.getOneUser);
router.post("/registerUser", userController.registerUser);
router.post("/login", userController.login);
router.post("/logout", protectRoute, userController.logout);

module.exports = router;
