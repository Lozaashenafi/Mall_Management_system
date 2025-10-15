import Joi from "joi";

export default {
  create: Joi.object({
    invoiceId: Joi.number().integer().optional(),
    utilityInvoiceId: Joi.number().integer().optional(),
    amount: Joi.number().required(),
    method: Joi.string().valid("Cash", "Bank", "Mobile", "Other").optional(),
    reference: Joi.string().optional(),
  }),

  update: Joi.object({
    amount: Joi.number().optional(),
    method: Joi.string().valid("Cash", "Bank", "Mobile", "Other").optional(),
    reference: Joi.string().optional(),
    status: Joi.string().valid("Pending", "Completed", "Failed").optional(),
  }),
};
