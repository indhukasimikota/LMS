const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js c-ares to use Google DNS (fixes ECONNREFUSED on SRV lookups
// when the system resolver does not support SRV record type queries)
dns.setDefaultResultOrder('ipv4first');
const { Resolver } = dns;
const resolver = new Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1']);
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
