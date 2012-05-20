var models = require('../models/models'),
    _ = require("../underscore-min");

module.exports = function(app){

    function viewGame(res, gameId) {
        models.Game.findById(gameId)
            .populate('teams')
            .populate('goals', ['team'])
            .run(function (err, game) {
                if (err) {
                    return console.log("ERROR RETRIEVING GAME", err);
                }
                var userId1 = game.teams[0].members[0];
                var userId2 = game.teams[1].members[0];

                models.User.where('_id').in([userId1,userId2]).run(function (game, userId1, userId2, err, users) {
                    if (err) {
                        return console.log("ERROR RETRIEVING USERS", err);
                    }

                    var teamName1 = _.find(users, function(user) { return user._id.equals(userId1) }).name;
                    var teamName2 = _.find(users, function(user) { return user._id.equals(userId2) }).name;
                    var teamId1 = game.teams[0]._id;
                    var teamId2 = game.teams[1]._id;
                    var teamScore1 = game.teamScore(teamId1);
                    var teamScore2 = game.teamScore(teamId2);
                    res.render('gameView', {
                        gameId: game._id,
                        gameState: game.state,
                        teamName1: teamName1,
                        teamName2: teamName2,
                        teamId1: teamId1,
                        teamId2: teamId2,
                        teamScore1: teamScore1,
                        teamScore2: teamScore2
                    });
                }.bind(null, game, userId1, userId2));
            });
    }

    app.get('/games/new', function(req, res){
        var users = models.User.find(function (err, users) {
            if (err) {
                console.log("ERROR RETRIEVING USERS", err);
            }
            res.render('gameNew', {
                gameType: req.query.gameType,
                users: users,
                gameTitle: req.query.gameType == "singles" ? "Singles Game" : "Doubles Game"
            })
        });
    });

    app.post('/games/new', function(req, res){
        var userId1 = req.param('userId1');
        var userId2 = req.param('userId2');
        // TODO verify that userId1 and userId2 are different

        models.Team.where('members').in([userId1,userId2]).run(function (userId1, userId2, err, teams) {
            if (err) {
                return console.log("ERROR RETRIEVING TEAMS", err);
            }
            var team1 = _.find(teams, function(team){ return team.members[0] == userId1; });
            var team2 = _.find(teams, function(team){ return team.members[0] == userId2; });

            if (!team1) {
                team1 = new models.Team({
                    teamType: "singles",
                    members: [userId1]
                });
                team1.save(function(err) {
                    if (err) {
                        return console.log("ERROR SAVING TEAM", err);
                    }
                });
            }
            if (!team2) {
                team2 = new models.Team({
                    teamType: "singles",
                    members: [userId2]
                });
                team2.save(function(err) {
                    if (err) {
                        return console.log("ERROR SAVING TEAM", err);
                    }
                });
            }

            var game = new models.Game({
                gameType: req.param('gameType'),
                teams: [team1._id, team2._id],
                goals: [],
                state: "in-progress"
            });
            game.save(function (err) {
                if (err) {
                    return console.log("ERROR SAVING GAME", err);
                }
                console.log("game created");
                viewGame(res, game._id);
            });
        }.bind(null, userId1, userId2));
    });

    app.post('/games/:id/goal/new', function(req, res){
        // 1. find game
        var gameId = req.params.id;
        var teamId = req.param('teamId');
        models.Game.findById(gameId)
            .populate('teams', ['members'])
            .populate('goals', ['team'])
            .run(function (teamId, err, game) {
                if (err) {
                    return console.log("ERROR RETRIEVING GAME", err);
                }
                if (game.state === "complete") {
                    console.log("CANNOT ADD GOAL! GAME ALREADY COMPLETE");
                    res.send("CANNOT ADD GOAL! GAME ALREADY COMPLETE", 400);
                    return true;
                }
                // 2. Determine if the team has just scored the winning goal
                var teamGoals = game.teamScore(teamId) + 1;
                if (teamGoals === 10) {
                    console.log("game completed!");
                    game.completeGame(teamId);
                }

                // 3. create goal
                var goal = new models.Goal({
                    team: teamId
                });

                // 4. save goal
                goal.save(function (game, err, goal) {
                    if (err) {
                        return console.log("ERROR SAVING GOAL", err);
                    }
                    // 5. add new goal to game
                    game.goals.push(goal._id);

                    // 6. save game
                    game.save(function (err, game) {
                        if (err) {
                            return console.log("ERROR SAVING GAME", err);
                        }
                        res.send("OK! Goal saved", 200);
                        return true;
                    });
                }.bind(null, game));
            }.bind(null, teamId));
    });


    app.get('/games/:id', function(req, res){
        viewGame(res, req.params.id);
    });

//    app.get('/games', function(req, res){
//        res.render('gameList')
//    });

};
