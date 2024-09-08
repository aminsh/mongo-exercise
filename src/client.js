require('dotenv').config()
const { MongoClient } = require('mongodb')

console.log('MONGO_URL', process.env.MONGO_URL)

module.exports = new MongoClient(process.env.MONGO_URL)
