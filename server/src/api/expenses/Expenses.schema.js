import Joi from "joi";

export default {
  create: Joi.object({
    utilityTypeId: Joi.number(),
    description: Joi.string().required(),
    amount: Joi.number().precision(2).required(),
    date: Joi.date().required(),
    createdBy: Joi.number().integer().required(),
  }),

  update: Joi.object({
    utilityTypeId: Joi.number(),
    description: Joi.string().optional(),
    amount: Joi.number().precision(2).optional(),
    date: Joi.date().optional(),
  }),
};
