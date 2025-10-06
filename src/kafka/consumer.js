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

const processEvent = async (message) => {
  console.log("CUSTOMER EVENT PROCESSED: ", {message});
  // Expecting event shape: { type: 'Customer.Created', payload: {...} }
  if (!message || !message.event) return;

  const { event, data } = message;

  switch (event) {
    case 'Customer.Created': {
      // Create user if not exists and create initial billing
      const userData = {
        userId: data?.userId,
        address: data?.address || {},
        isActive: data?.isActive ?? true
      };

      await User.updateOne({ userId: userData.userId }, { $set: userData }, { upsert: true });

      // initialize a billing for that customer
      const billing = new Billing({
        userId: userData.userId,
        billingId: data?.billingId || `bill-${Date.now()}`,
        generationDate: data?.generationDate ? new Date(data?.generationDate) : new Date(),
        dueDate: data?.dueDate ? new Date(data?.dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        serviceId: data?.serviceId || '1',
        totalInvoice: data?.totalInvoice ? Number(data?.totalInvoice) : 0,
        isPaid: false,
        paymentDate: null
      });

      await billing.save();

      console.log("CUSTOMER CREATED");
      break;
    }

    case 'Customer.Updated': {
      // update user fields coming from event
      const update = {};
      if (data?.address) update.address = data?.address;
      if (typeof data?.isActive === 'boolean') update.isActive = data?.isActive;
      if (data?.email) update.email = data?.email;

      await User.updateOne({ userId: data?.userId }, { $set: update });
      break;
    }

    case 'Customer.Suspended': {
      await User.updateOne({ userId: data?.userId }, { $set: { isActive: false } });
      break;
    }

    case 'Customer.Deleted': {
      await User.deleteOne({ userId: data?.userId });
      await Billing.deleteMany({ userId: data?.userId });
      break;
    }

    case 'Customer.Reactivated': {
      await User.updateOne({ userId: data?.userId }, { $set: { isActive: true } });
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
