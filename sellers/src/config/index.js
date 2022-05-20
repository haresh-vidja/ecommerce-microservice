export default {
  // Service Identifiers
  CUSTOMER_SERVICE: "customer_service",
  PRODUCT_SERVICE: "product_service",
  SELLER_SERVICE: "seller_service",

  /**
   * Kafka Topic Configuration
   * Used when creating or asserting a topic.
   */
  KAFKA_SERVICE_CONFIG: {
    topic: process.env.RUNNING_SERVICE,       // Topic name, typically matches service
    numPartitions: 2,                          // Number of partitions (adjust based on scale)
    replicationFactor: 1,                      // Set to 2+ in production for fault tolerance
    configEntries: [
      { name: 'cleanup.policy', value: 'delete' },      // Delete old messages when retention expires
      { name: 'retention.ms', value: '1800000' }         // Retain messages for 30 minutes
    ]
  },

  /**
   * Kafka Consumer Group Configuration
   * Used by Kafka clients to coordinate message consumption.
   */
  KAFKA_CONSUMER_GROUP: {
    groupId: "local",                          // Group ID for consumer instance (can be overridden per env)
    sessionTimeout: 90000,                     // Timeout to detect dead consumers (ms)
    heartbeatInterval: 10000,                  // Heartbeat frequency to Kafka broker (ms)
    rebalanceTimeout: 100000,                  // Timeout for partition rebalancing (ms)
    allowAutoTopicCreation: false              // Prevent accidental creation of topics
  }
};
