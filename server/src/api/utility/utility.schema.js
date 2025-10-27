import Joi from "joi";

export default {
  createCharge: Joi.object({
    type: Joi.string()
      .valid("Water", "Electricity", "Generator", "Service", "Other")
      .required(),
    month: Joi.string()
      .pattern(/^\d{4}-\d{2}$/)
      .required(), // e.g., "2025-10"
    totalCost: Joi.number().positive().precision(2).required(),
    description: Joi.string().optional(),
  }),

  distribute: Joi.object({
    utilityChargeId: Joi.number().integer().required(),
  }),
};
