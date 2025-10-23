import Joi from "joi";

export default {
  create: Joi.object({
    rentId: Joi.number().integer().required(),
    paperInvoiceNumber: Joi.string().required(), // Manual entry
    invoiceDate: Joi.date().required(),
    dueDate: Joi.date().required(),
    baseRent: Joi.number().optional(),
    taxPercentage: Joi.number().optional(),
    taxAmount: Joi.number().optional(),
    totalAmount: Joi.number().required(),
    paymentInterval: Joi.string()
      .valid("Monthly", "Quarterly", "Yearly")
      .optional(),
  }),

  update: Joi.object({
    paperInvoiceNumber: Joi.string().optional(),
    invoiceDate: Joi.date().optional(),
    dueDate: Joi.date().optional(),
    baseRent: Joi.number().optional(),
    taxPercentage: Joi.number().optional(),
    taxAmount: Joi.number().optional(),
    totalAmount: Joi.number().optional(),
  }),
};
