export default {
  CUSTOMER_SERVICE: "customer_service",
  PRODUCT_SERVICE: "product_service",
  SELLER_SERVICE: "seller_service",
  KAFKA_SERVICE_CONFIG: {
    topic: process.env.RUNNING_SERVICE,
    numPartitions: 2, //will keep 20 partitions
    replicationFactor: 1,
    configEntries: [
      { name: 'cleanup.policy', value: 'delete' },
      { name: 'retention.ms', value: '1800000' }
    ]
  },
  KAFKA_CONSUMER_GROUP: {
    groupId: "local",
    sessionTimeout: 90000, //important to set based on process
    heartbeatInterval: 10000,
    rebalanceTimeout: 100000,
    allowAutoTopicCreation: false
  }
};
