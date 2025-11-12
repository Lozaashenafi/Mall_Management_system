import Joi from "joi";

export default {
  create: Joi.object({
    accountName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    bankName: Joi.string().required(),
    balance: Joi.number().precision(2).optional(),
    currency: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }),

  update: Joi.object({
    accountName: Joi.string().optional(),
    accountNumber: Joi.string().optional(),
    bankName: Joi.string().optional(),
    branch: Joi.string().optional(),
    currency: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }),
};
