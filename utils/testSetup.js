const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async () => {
  const mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();
  process.env.MONGODB_URI = mongoUri;
  global.__MONGOSERVER__ = mongoServer;
};
