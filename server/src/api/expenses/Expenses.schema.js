import Joi from "joi";

export default {
  create: Joi.object({
    type: Joi.string().required(),
    description: Joi.string().required(),
    amount: Joi.number().precision(2).required(),
    date: Joi.date().required(),
    createdBy: Joi.number().integer().required(),
  }),

  update: Joi.object({
    type: Joi.string().optional(),
    description: Joi.string().optional(),
    amount: Joi.number().precision(2).optional(),
    date: Joi.date().optional(),
  }),
};
