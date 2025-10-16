import Joi from "joi";

export default {
  create: Joi.object({
    invoiceId: Joi.number().integer().optional(),
    utilityInvoiceId: Joi.number().integer().optional(),
    amount: Joi.number().required(),
    method: Joi.string().valid("Cash", "Bank", "Mobile", "TeleBirr").optional(),
    paymentDate: Joi.date(),
    reference: Joi.string().optional(),
  }),

  update: Joi.object({
    amount: Joi.number().optional(),
    method: Joi.string().valid("Cash", "Bank", "Mobile", "TeleBirr").optional(),
    reference: Joi.string().optional(),

    paymentDate: Joi.date().optional(),
  }),
};
