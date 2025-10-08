import Joi from "joi";

export default {
  // RoomFeature schema
  create: Joi.object({
    roomId: Joi.number().integer().required(),
    featureTypeId: Joi.number().integer().required(),
    count: Joi.number().integer().min(1).default(1),
  }),

  update: Joi.object({
    count: Joi.number().integer().min(1).optional(),
  }),

  // RoomFeatureType schema
  featureTypeCreate: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().allow(null, "").optional(),
  }),

  featureTypeUpdate: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().allow(null, "").optional(),
  }),
};
