import adapter from './adapter.js';
import User from '../models/User.js';
import Billing from '../models/Billing.js';

const TOPIC = process.env.KAFKA_TOPIC || 'customers';
const GROUP_ID = process.env.KAFKA_GROUP_ID || 'telecomx-billing-consumer';

const parseMessage = (message) => {
  try {
    const value = message.value.toString();
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
};

const processEvent = async (event) => {
  console.log("CUSTOMER EVENT PROCESSED: ", {event});
  // Expecting event shape: { type: 'Customer.Created', payload: {...} }
  if (!event || !event.type) return;

  const { type, payload } = event;

  switch (type) {
    case 'Customer.Created': {
      // Create user if not exists and create initial billing
      const userData = {
        userId: payload.userId,
        address: payload.address || {},
        isActive: payload.isActive ?? true
      };

      await User.updateOne({ userId: userData.userId }, { $set: userData }, { upsert: true });

      // initialize a billing for that customer
      const billing = new Billing({
        userId: userData.userId,
        billingId: payload.billingId || `bill-${Date.now()}`,
        generationDate: payload.generationDate ? new Date(payload.generationDate) : new Date(),
        dueDate: payload.dueDate ? new Date(payload.dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        serviceId: payload.serviceId || 'default',
        totalInvoice: payload.totalInvoice ? Number(payload.totalInvoice) : 0,
        isPaid: false,
        paymentDate: null
      });

      await billing.save();
      break;
    }

    case 'Customer.Updated': {
      // update user fields coming from event
      const update = {};
      if (payload.address) update.address = payload.address;
      if (typeof payload.isActive === 'boolean') update.isActive = payload.isActive;
      if (payload.email) update.email = payload.email;

      await User.updateOne({ userId: payload.userId }, { $set: update });
      break;
    }

    case 'Customer.Suspended': {
      await User.updateOne({ userId: payload.userId }, { $set: { isActive: false } });
      break;
    }

    case 'Customer.Deleted': {
      await User.deleteOne({ userId: payload.userId });
      await Billing.deleteMany({ userId: payload.userId });
      break;
    }

    case 'Customer.Reactivated': {
      await User.updateOne({ userId: payload.userId }, { $set: { isActive: true } });
      break;
    }

    default:
      // unknown event
      break;
  }
};

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const startConsumer = async () => {
  const consumer = adapter.consumer({ groupId: GROUP_ID });

  let attempt = 0;
  const maxAttempts = Number(process.env.KAFKA_MAX_RETRIES || 5);

  while (true) {
    try {
      attempt += 1;
      await consumer.connect();
      await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const event = parseMessage(message);
          if (!event) return;
          try {
            await processEvent(event);
          } catch (err) {
            console.error('Failed to process event', err, event);
          }
        }
      });

      // connected and running
      return consumer;
    } catch (err) {
      console.error('Kafka consumer error on attempt', attempt, err);
      if (attempt >= maxAttempts) {
        console.error('Max Kafka connect attempts reached, giving up for now. Will not crash server.');
        return null;
      }

      const backoff = Math.min(1000 * attempt, 10000);
      console.log(`Kafka consumer retrying in ${backoff}ms...`);
      await sleep(backoff);
    }
  }
};

export default startConsumer;
