const mongoose = require('mongoose');
const { Schema } = mongoose;

const currentGameUsersSchema= new Schema({
  gameCurrentUsers: Array
});

module.exports = mongoose.model('CurrentGameUsers', currentGameUsersSchema);
