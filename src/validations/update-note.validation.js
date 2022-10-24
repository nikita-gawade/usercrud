const Joi = require('joi');
const yapValidations = require('@yapsody/lib-validations');

module.exports = Joi.object()
  .keys({
    name: yapValidations
      .name
      .label('Name'),
    description: yapValidations
      .description
      .label('Description'),
    enable: yapValidations
      .enable
      .label('Enable'),
    version: yapValidations
      .id
      .when('enable', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      })
      .label('Version'),
  }).min(1);
