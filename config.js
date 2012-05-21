var config = {}

config.mongodb = {};
config.mongodb.url=  process.env.MONGODB_URL || 'mongodb://localhost/fooscore';

module.exports = config;
