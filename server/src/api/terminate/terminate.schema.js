import Joi from "joi";

export default {
  // ✅ Create Termination Request (Tenant)
  create: Joi.object({
    rentId: Joi.number().required().messages({
      "any.required": "rentId is required",
      "number.base": "rentId must be a number",
    }),
    reason: Joi.string().required().messages({
      "any.required": "Reason is required",
      "string.base": "Reason must be a string",
    }),
    effectiveDate: Joi.date().optional().messages({
      "date.base": "Effective Date must be a valid date",
    }),
  }),

  // ✅ Update Termination Request (Tenant)
  update: Joi.object({
    reason: Joi.string().optional(),
    effectiveDate: Joi.date().optional(),
  }),

  // ✅ Admin Update (Status / Admin Note)
  adminUpdate: Joi.object({
    status: Joi.string()
      .valid("Pending", "Approved", "Declined")
      .required()
      .messages({
        "any.only": "Status must be Pending, Approved, or Declined",
        "any.required": "Status is required",
      }),
    adminNote: Joi.string().optional(),
    effectiveDate: Joi.date().optional(),
  }),
};
