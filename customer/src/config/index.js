/**
 * Configuration constants for services and Kafka setup.
 * Includes dynamic topic setup and consumer group settings.
 */
export default {
  // Identifiers for core microservices
  CUSTOMER_SERVICE: "customer_service",
  PRODUCT_SERVICE: "product_service",
  SELLER_SERVICE: "seller_service",

  // Kafka topic configuration (used for dynamic topic creation)
  KAFKA_SERVICE_CONFIG: {
    topic: process.env.RUNNING_SERVICE || "default_service_topic", // Fallback to default topic
    numPartitions: 2, // Set to 2 for local; scale to 20+ in prod
    replicationFactor: 1, // Adjust for multi-broker setups

    configEntries: [
      { name: 'cleanup.policy', value: 'delete' },       // Automatically delete old records
      { name: 'retention.ms', value: '1800000' }          // Retain messages for 30 minutes
    ]
  },

  // Kafka consumer group configuration (used by KafkaJS or node-rdkafka)
  KAFKA_CONSUMER_GROUP: {
    groupId: process.env.KAFKA_GROUP_ID || "local",       // Use env override if available
    sessionTimeout: 90000,                                // Session timeout in ms
    heartbeatInterval: 10000,                             // Heartbeat interval to keep consumer alive
    rebalanceTimeout: 100000,                             // Timeout for rebalancing consumer group
    allowAutoTopicCreation: false                         // Prevent unintentional topic creation
  }
};
