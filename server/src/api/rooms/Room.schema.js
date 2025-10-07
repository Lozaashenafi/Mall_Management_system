import Joi from "joi";

const roomSchema = {
  create: Joi.object({
    unitNumber: Joi.string().required(),
    floor: Joi.number().integer().required(),
    size: Joi.number().precision(2).required(),
    roomTypeId: Joi.number().integer().required(),
    hasParking: Joi.boolean().default(false),
    parkingType: Joi.string().valid("Unlimited", "Limited").allow(null),
    parkingSpaces: Joi.number().integer().min(0).allow(null),
    status: Joi.string().valid("Vacant", "Occupied", "Maintenance"),
  }),
  update: Joi.object({
    unitNumber: Joi.string(),
    floor: Joi.number().integer(),
    size: Joi.number().precision(2),
    roomTypeId: Joi.number().integer(),
    hasParking: Joi.boolean().default(false),
    parkingType: Joi.string().valid("Unlimited", "Limited").allow(null),
    parkingSpaces: Joi.number().integer().min(0).allow(null),
    status: Joi.string().valid("Vacant", "Occupied", "Maintenance"),
  }),
};

export default roomSchema;
