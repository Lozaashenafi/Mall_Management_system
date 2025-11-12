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
  }),
  update: Joi.object({
    unitNumber: Joi.string(),
    roomPrice: Joi.number(),
    floor: Joi.number().integer(),
    size: Joi.number().precision(2),
    roomTypeId: Joi.number().integer(),
    hasParking: Joi.boolean().default(false),
    parkingType: Joi.string().valid("Unlimited", "Limited").allow(null),
    parkingSpaces: Joi.number().integer().min(0).allow(null),
  }),
};

export default roomSchema;
