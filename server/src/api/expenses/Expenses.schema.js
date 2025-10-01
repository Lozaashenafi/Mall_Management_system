import Joi from "joi";

export default {
  create: Joi.object({
    category: Joi.string().required(),
    description: Joi.string().required(),
    amount: Joi.number().precision(2).required(),
    date: Joi.date().required(),
    recordedBy: Joi.number().integer().required(), // userId
  }),

  update: Joi.object({
    category: Joi.string().optional(),
    description: Joi.string().optional(),
    amount: Joi.number().precision(2).optional(),
    date: Joi.date().optional(),
  }),
};
