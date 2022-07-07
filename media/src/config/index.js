export default {
  // Identifiers for different microservices
  CUSTOMER_SERVICE: "customer_service",
  PRODUCT_SERVICE: "product_service",
  SELLER_SERVICE: "seller_service",

  /**
   * Kafka Topic Configuration
   * Used for topic creation or setup during producer-side operations.
   */
  KAFKA_SERVICE_CONFIG: {
    topic: process.env.RUNNING_SERVICE, // Dynamically set topic name from environment variable
    numPartitions: 2,                   // Number of partitions (can be increased for scaling)
    replicationFactor: 1,              // Typically 2+ in production; 1 is fine for local/dev

    // Custom configuration entries for the topic
    configEntries: [
      { name: 'cleanup.policy', value: 'delete' },      // Defines how Kafka cleans old logs
      { name: 'retention.ms', value: '1800000' }         // Retention time: 30 minutes in ms
    ]
  },

  /**
   * Kafka Consumer Group Configuration
   * Used for setting up a Kafka consumer group that listens to messages.
   */
  KAFKA_CONSUMER_GROUP: {
    groupId: "local",                  // Consumer group ID (can be service/env specific)
    sessionTimeout: 90000,            // Time before broker considers consumer dead (ms)
    heartbeatInterval: 10000,         // Interval between heartbeat messages (ms)
    rebalanceTimeout: 100000,         // Maximum time to complete group rebalance (ms)
    allowAutoTopicCreation: false     // Prevents accidental creation of unknown topics
  }
};
