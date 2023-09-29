const mongoose = require('mongoose');
const { Schema } = mongoose;

const realGameSchema= new Schema({
  real_Users: Array
});

module.exports = mongoose.model('RealGames', realGameSchema);
