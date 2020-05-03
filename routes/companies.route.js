const express = require("express");
const router = express.Router();
const companycontroller = require("../controllers/company.controller");
const { protectRoute } = require("../middlewares/userlogin");
router.use(express.json());
const reviewRouter = require("../routes/reviews.route");

router.param("id", (req, res, next, id) => {
  req.companyId = id;
  next();
});

router.get("/", companycontroller.getAllCompanies);
router.get("/:id", companycontroller.getCompanybyID);
router.post("/", companycontroller.createNewCompany);
router.use("/:id/reviews", reviewRouter);

module.exports = router;
