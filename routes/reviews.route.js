const express = require("express");
const router = express.Router();
const reviewscontroller = require("../controllers/review.controller");
router.use(express.json());

router.post("/", reviewscontroller.submitReview);

module.exports = router;
