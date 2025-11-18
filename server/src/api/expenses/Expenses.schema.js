import Joi from "joi";

export default {
  create: Joi.object({
    utilityTypeId: Joi.number(),
    description: Joi.string().required(),
    amount: Joi.number().precision(2).required(),
    date: Joi.date().required(),
    createdBy: Joi.number().integer().required(),
    bankAccountId: Joi.number().integer().required(),
    account: Joi.string().optional(),
    Name: Joi.string().optional(),
  }),

  update: Joi.object({
    utilityTypeId: Joi.number(),
    description: Joi.string().optional(),
    amount: Joi.number().precision(2).optional(),
    date: Joi.date().optional(),
  }),
};
