var mongoose = require('mongoose'),
    _ = require("../public/javascripts/thirdparty/underscore-min");

// Schemas
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    name: { type: String },
    email: { type: String },
    password: { type: String }
});

var TeamSchema = new Schema({
    teamType: { type: String, enum: ["singles", "doubles"] },
    members: [{ type: ObjectId, ref: 'User' }]
});

var GoalSchema = new Schema ({
    team: { type: ObjectId, ref: 'Team' },
    date: { type: Date, default: Date.now }
});

var GameSchema = new Schema({
    gameType: { type: String, enum: ["singles", "doubles"] },
    teams: [{ type: ObjectId, ref: 'Team' }],
    goals: [{ type: ObjectId, ref: 'Goal' }],
    state: { type: String, enum: ["in-progress", "complete"] },
    startDate: { type: Date, default: Date.now },
    completeDate: { type: Date },
    winner: { type: ObjectId, ref: 'Team' },
    loser: { type: ObjectId, ref: 'Team' }
});

GameSchema.methods.isDoubles = function() {
    return this.gameType === 'doubles';
}

GameSchema.methods.teamScore = function (teamId) {
    return _.filter(this.goals, function(goal){
        return goal.team.equals(teamId);
    }).length;
};

GameSchema.methods.opponentTeamId = function (teamId) {
    return _.find(this.teams, function(team){ return team._id != teamId; })._id;
}

GameSchema.methods.completeGame = function (winnerTeamId) {
    this.state = "complete";
    this.completeDate = new Date();
    this.winner = winnerTeamId;
    this.loser = this.opponentTeamId(winnerTeamId);
}

// Models
exports.User = mongoose.model('User', UserSchema);
exports.Team = mongoose.model('Team', TeamSchema);
exports.Game = mongoose.model('Game', GameSchema);
exports.Goal = mongoose.model('Goal', GoalSchema);


