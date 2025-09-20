import Joi from "joi";

export default {
  // ✅ Create Tenant
  create: Joi.object({
    companyName: Joi.string().required(),
    contactPerson: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
  }),

  // ✅ Update Tenant
  update: Joi.object({
    companyName: Joi.string().optional(),
    contactPerson: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    status: Joi.string().valid("Active", "Inactive").optional(),
  }),
};
