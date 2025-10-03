import { Kafka } from 'kafkajs';

// Kafka config singleton
class KafkaConfig {
  constructor() {
    if (KafkaConfig.instance) return KafkaConfig.instance;

    const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
    const clientId = process.env.KAFKA_CLIENT_ID || 'telecomx-billing-service';

    this.kafka = new Kafka({ clientId, brokers });
    KafkaConfig.instance = this;
  }

  getClient() {
    return this.kafka;
  }
}

export default new KafkaConfig();
