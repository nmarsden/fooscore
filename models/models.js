var mongoose = require('mongoose'),
    _ = require("../underscore-min");

// Schemas
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    name: { type: String },
    email: { type: String },
    password: { type: String }
});

var GoalSchema = new Schema ({
    user: { type: ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
});

var GameSchema = new Schema({
    gameType: { type: String, enum: ["singles", "doubles"] },
    players: [{ type: ObjectId, ref: 'User' }],
    goals: [GoalSchema],
    state: { type: String, enum: ["in-progress", "complete"] },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    winner: [{ type: ObjectId, ref: 'User' }],
    loser: [{ type: ObjectId, ref: 'User' }]
});

GameSchema.methods.playerScore = function (playerId) {
    return _.filter(this.goals, function(goal){
        return goal.user.equals(playerId);
    }).length;
};

GameSchema.methods.populateForWinner = function (playerId) {
    this.state = "complete";
    // TODO set endDate
//game.endDate = Date.now;
    this.winner = playerId;
    this.loser = _.find(this.players, function(player){ return player._id != playerId; })._id;
}

// Models
exports.User = mongoose.model('User', UserSchema);
exports.Game = mongoose.model('Game', GameSchema);
exports.Goal = mongoose.model('Goal', GoalSchema);


