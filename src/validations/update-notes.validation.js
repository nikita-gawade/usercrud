const Joi = require('joi');
const yapValidations = require('@yapsody/lib-validations');

const notes = Joi.array()
  .items(
    Joi.object()
      .keys({
        id: yapValidations.id
          .label('Id'),
        name: yapValidations
          .name
          .required()
          .label('Name'),
        description: yapValidations
          .description
          .label('Description'),
      }),
  ).optional();

module.exports = Joi.object()
  .keys({
    notes,
  });
