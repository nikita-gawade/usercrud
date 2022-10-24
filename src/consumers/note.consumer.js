const { SQS } = require('@aws-sdk/client-sqs');
const { Consumer } = require('@yapsody/lib-sqs-consumer');

const config = require('../config');
const consumerAction = require('./note.consumer.action');

const queueConsumer = Consumer.create({
  queueUrl: config.AWS_SQS_ENDPOINT,
  batchSize: config.AWS_SQS_MESSAGE_LIMIT,
  handleMessage: async (message) => {
    try {
      const eventBody = JSON.parse(message.Body);
      console.info('Message body', JSON.stringify(eventBody, null, 2));
      await consumerAction.getNotes(eventBody);
    } catch (err) {
      console.error(err);
    }
  },
  sqs: new SQS({ apiVersion: config.AWS_API_VERSION, region: config.AWS_REGION }),
});

queueConsumer.on('error', (err) => {
  console.error(err);
});

queueConsumer.on('processing_error', (err) => {
  console.error(err);
});

queueConsumer.on('timeout_error', (err) => {
  console.error(err);
});

module.exports = {
  queueConsumer,
};
