import Joi from "joi";

export default {
  create: Joi.object({
    companyName: Joi.string().required(),
    contactPerson: Joi.string().required(),
    tinNumber: Joi.string().optional(),
    vatNumber: Joi.string().optional(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
  }),

  update: Joi.object({
    companyName: Joi.string().optional(),
    contactPerson: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    tinNumber: Joi.string().optional(),
    vatNumber: Joi.string().optional(),
    status: Joi.string().valid("Active", "Inactive").optional(),
  }),
};
