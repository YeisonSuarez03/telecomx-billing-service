// Adapter to abstract kafkajs - so provider can be swapped later
import kafkaConfig from './config.js';

class KafkaAdapter {
  constructor() {
    if (KafkaAdapter.instance) return KafkaAdapter.instance;
    this.kafka = kafkaConfig.getClient();
    KafkaAdapter.instance = this;
  }

  producer() {
    if (!this._producer) this._producer = this.kafka.producer();
    return this._producer;
  }

  consumer({ groupId }) {
    // return a new consumer for given groupId
    return this.kafka.consumer({ groupId });
  }
}

export default new KafkaAdapter();
