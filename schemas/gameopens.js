const mongoose = require('mongoose')
const { Schema } = mongoose

const { Types: { ObjectId } } = Schema;
const gameOpensSchema = new Schema({
  gameType: {
    type: String,
    require: true
  },
  gameMaxUserCount: {
    type: Number,
    require: true
  },
  gameStopGameOpening: {
    type: Date,
    require: true
  },
  gameCurrID: {
    type: ObjectId,
    ref: 'CurrentGameUsers'
  },
  gameRealId: {
    type: ObjectId,
    ref: "RealGames"
  }
})

module.exports = mongoose.model('GameOpens', gameOpensSchema)
