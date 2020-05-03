const Company = require("../models/company.model");
const { uuid } = require("uuidv4");
const Joi = require("@hapi/joi");

const getAllCompanies = async (req, res, next) => {
  console.log("In getAllCompanies");
  try {
    const tempCompany = await Company.find({}, "-_id -__v");
    return res.status(200).json(tempCompany);
  } catch (err) {
    next(err);
  }
};

const getCompanybyID = async (req, res, next) => {
  console.log("In getCompanybyID");
  try {
    console.log("req.companyId:", req.companyId);
    const companyFound = await Company.findOne(
      { id: req.companyId },
      "-_id -__v"
    );
    console.log("companyFound", companyFound);
    if (companyFound) {
      return res.status(200).json(companyFound);
    } else {
      let CompanyNotFoundError = new Error("Company ID is not found");
      CompanyNotFoundError.statusCode = 404;
      throw CompanyNotFoundError;
    }
  } catch (err) {
    next(err);
  }
};

function validateCompanyInfo(comp) {
  const schema = Joi.object({
    companyName: Joi.string().min(5).required(),
    companySuffix: Joi.string().min(3),
    numberOfEmployees: Joi.number().min(1),
    description: Joi.string(),
  });
  return schema.validate(comp);
}

const createNewCompany = async (req, res, next) => {
  console.log("In create NewCompany:", req.body);
  try {
    const validation = validateCompanyInfo(req.body);
    if (validation.error) {
      const validationError = new Error(validation.error.details[0].message);
      validationError.statusCode = 400;
      next(validationError);
    } else {
      console.log("Creating new company");
      let company = {};
      company.id = uuid();
      company.companyName = req.body.companyName;
      company.companySuffix = req.body.companySuffix;
      company.numberOfEmployees = req.body.numberOfEmployees;
      company.description = req.body.description;

      const newCompany = new Company(company);
      await newCompany.save();
      res.status(201).json(newCompany);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCompanies,
  getCompanybyID,
  createNewCompany,
};
