import Joi from "joi";

const roomSchema = {
  create: Joi.object({
    unitNumber: Joi.string().required(),
    floor: Joi.number().integer().required(),
    size: Joi.number().precision(2).required(),
    roomTypeId: Joi.number().integer().required(),
    status: Joi.string().valid("Vacant", "Occupied", "Maintenance"),
  }),
  update: Joi.object({
    unitNumber: Joi.string(),
    floor: Joi.number().integer(),
    size: Joi.number().precision(2),
    roomTypeId: Joi.number().integer(),
    status: Joi.string().valid("Vacant", "Occupied", "Maintenance"),
  }),
};

export default roomSchema;
