// src/api/rentals/rental.schema.js
import Joi from "joi";

export default {
  create: Joi.object({
    tenantId: Joi.number().integer().required(),
    roomId: Joi.number().integer().required(),
    versionNumber: Joi.number().integer().min(1).default(1),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref("startDate")).required(),
    rentAmount: Joi.number().precision(2).required(),
    paymentDueDate: Joi.number().integer().min(1).max(31).required(),
    paymentInterval: Joi.string()
      .valid("Monthly", "Quarterly", "Yearly")
      .required(),
    status: Joi.string()
      .valid("Active", "Expired", "Terminated")
      .default("Active"),
  }),

  update: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    rentAmount: Joi.number().precision(2).optional(),
    paymentDueDate: Joi.number().integer().min(1).max(31).optional(),
    paymentInterval: Joi.string()
      .valid("Monthly", "Quarterly", "Yearly")
      .optional(),
  }),
};
