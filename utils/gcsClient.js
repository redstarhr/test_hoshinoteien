// utils/gcsClient.js
const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

module.exports = storage;
