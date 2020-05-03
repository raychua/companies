const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  id: {
    type: String,
  },
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  title: {
    type: String,
    required: true,
    minlength: 5,
  },
  review: {
    type: String,
    required: true,
    minlength: 5,
  },
});

const companySchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
    minlength: 5,
    unique: true,
  },
  companySuffix: {
    type: String,
    minlength: 3,
  },
  numberOfEmployees: {
    type: Number,
    min: 1,
  },
  description: {
    type: String,
  },

  reviews: [reviewSchema],
});

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
