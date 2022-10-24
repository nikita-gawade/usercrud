const Joi = require('joi');
const yapValidations = require('@yapsody/lib-validations');

module.exports = Joi.object()
  .keys({
    name: yapValidations
      .name
      .required()
      .label('Name'),
    description: yapValidations
      .description
      .label('Description'),
  });
