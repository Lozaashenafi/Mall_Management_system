import Joi from "joi";

export default {
  register: Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().optional(),
    role: Joi.string()
      .valid("Admin", "SuperAdmin", "Tenant", "SecurityOfficer")
      .optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};
