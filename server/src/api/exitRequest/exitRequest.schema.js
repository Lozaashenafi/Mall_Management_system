import Joi from "joi";

export default {
  create: Joi.object({
    userId: Joi.number().integer().required(),
    rentId: Joi.number().integer().required(),
    exitDate: Joi.date().required(),
    purpose: Joi.string().required().max(500),
    type: Joi.string().valid("Temporary", "Permanent").required(),
    items: Joi.array()
      .items(
        Joi.object({
          itemName: Joi.string().trim().required().max(200),
          description: Joi.string().trim().max(500).allow("", null),
          quantity: Joi.number().integer().min(1).required(),
          serialNumber: Joi.optional(),
          estimatedValue: Joi.optional(),
        })
      )
      .min(1)
      .required(),
  }),

  adminReview: Joi.object({
    status: Joi.string().valid("Approved", "Rejected").required(),
    adminNote: Joi.string().max(1000).empty(""),
  }),

  securityVerify: Joi.object({
    status: Joi.string().valid("Verified", "Blocked").required(),
    securityNote: Joi.string().max(1000).empty(""),
  }),

  filter: Joi.object({
    status: Joi.string().valid(
      "Pending",
      "Approved",
      "Rejected",
      "Verified",
      "Blocked"
    ),
    type: Joi.string().valid("Temporary", "Permanent"),
    startDate: Joi.date(),
    endDate: Joi.date(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};
