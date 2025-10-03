import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import startConsumer from './kafka/consumer.js';

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  // start kafka consumer (does nothing if no brokers configured)
  try {
    startConsumer().then(() => console.log('Kafka consumer started')).catch(err => console.error('Kafka consumer failed', err));
  } catch (err) {
    console.error('Failed to initialize Kafka consumer', err);
  }
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
};

start().catch(err => {
  console.error('Failed to start application', err);
  process.exit(1);
});
