const Company = require("../models/company.model");
const Joi = require("@hapi/joi");
const { uuid } = require("uuidv4");

function validateReview(review) {
  const schema = Joi.object({
    rating: Joi.number().min(0).max(5).required(),
    title: Joi.string().min(5).required(),
    review: Joi.string().min(5).required(),
  });
  return schema.validate(review);
}

const submitReview = async (req, res, next) => {
  console.log("In Submit Review");
  try {
    const company = await Company.findOne({ id: req.companyId });
    if (company) {
      const validation = validateReview(req.body);
      if (validation.error) {
        const validationError = new Error(validation.error.details[0].message);
        validationError.statusCode = 400;
        throw validationError;
      }
      const review = {
        id: uuid(),
        userId: req.userId,
        username: req.username,
        rating: parseInt(req.body.rating),
        title: req.body.title,
        review: req.body.review,
      };
      company.reviews.push(review);
      await company.save();
      res.status(201).json(review);
    } else {
      const companyNotFoundError = new Error("Company ID is not valid");
      companyNotFoundError.statusCode = 404;
      throw companyNotFoundError;
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { submitReview };
