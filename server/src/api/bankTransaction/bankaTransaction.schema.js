import Joi from "joi";

export default {
  create: Joi.object({
    bankAccountId: Joi.number().optional(),
    receiptImage: Joi.string(),
    receiverName: Joi.string().optional(),
    receiverAccount: Joi.string().optional(),
    paymentId: Joi.number().optional(),
    type: Joi.string().valid("Deposit", "Withdrawal", "Transfer").required(),
    amount: Joi.number().precision(2).required(),
    description: Joi.string().optional(),
    transactionDate: Joi.date().optional(),
  }),
};
