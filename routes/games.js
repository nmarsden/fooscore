var models = require('../models/models'),
    _ = require("../underscore-min");

module.exports = function(app){

    function teamNameFor(userId1, userId2, users) {
        return userNameFor(userId1, users) + (userId2 ? (" & " + userNameFor(userId2, users)) : "");
    }

    function userNameFor(userId, users) {
        return _.find(users, function(user) { return user._id.equals(userId) }).name;
    }

    function viewGame(res, gameId) {
        models.Game.findById(gameId)
            .populate('teams')
            .populate('goals', ['team'])
            .run(function (err, game) {
                if (err) {
                    return console.log("ERROR RETRIEVING GAME", err);
                }
                var team1UserId1 = game.teams[0].members[0];
                var team1UserId2 = game.isDoubles() ? game.teams[0].members[1] : null;
                var team2UserId1 = game.teams[1].members[0];
                var team2UserId2 = game.isDoubles() ? game.teams[1].members[1] : null;

                models.User.where('_id').in([team1UserId1, team1UserId2, team2UserId1, team2UserId2]).run(function (game, team1UserId1, team1UserId2, team2UserId1, team2UserId2, err, users) {
                    if (err) {
                        return console.log("ERROR RETRIEVING USERS", err);
                    }

                    var teamName1 = teamNameFor(team1UserId1, team1UserId2, users);
                    var teamName2 = teamNameFor(team2UserId1, team2UserId2, users);
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
                }.bind(null, game, team1UserId1, team1UserId2, team2UserId1, team2UserId2));
            });
    }

    function retrieveOrCreateTeamFor(userId1, userId2, existingTeams) {
        if (!userId2) {
            return retrieveOrCreateSinglesTeamFor(userId1, existingTeams);
        } else {
            return retrieveOrCreateDoublesTeamFor(userId1, userId2, existingTeams);
        }
    }

    function retrieveOrCreateSinglesTeamFor(userId, existingTeams) {
        var team = _.find(existingTeams, function(team){ return team.members[0] == userId; });
        if (!team) {
            team = new models.Team({
                teamType: "singles",
                members: [userId]
            });
            team.save(function(err) {
                if (err) {
                    return console.log("ERROR SAVING SINGLES TEAM", err);
                }
            });
        }
        return team;
    }

    function retrieveOrCreateDoublesTeamFor(userId1, userId2, existingTeams) {
        var team = _.find(existingTeams, function(team){
            return (team.members[0] == userId1 && team.members[1] == userId2) || (team.members[0] == userId2 && team.members[1] == userId1);
        });
        if (!team) {
            team = new models.Team({
                teamType: "doubles",
                members: [userId1, userId2]
            });
            team.save(function(err) {
                if (err) {
                    return console.log("ERROR SAVING DOUBLES TEAM", err);
                }
            });
        }
        return team;
    }

    function createFindExistingTeamsQueryFor(gameType, team1userId1, team1userId2, team2userId1, team2userId2) {
        if (gameType === 'singles') {
            return models.Team.where('members').in([team1userId1,team2userId1]);
        } else {
            return models.Team.find({}).or([{ members: { $all: [ team1userId1, team1userId2 ] } }, { members: { $all: [ team2userId1, team2userId2 ] } }])
        }
    }

    app.get('/games/new', function(req, res){
        models.User.find(function (err, users) {
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
        var gameType = req.param('gameType');
        var team1userId1 = req.param('team1userId1');
        var team1userId2 = req.param('team1userId2');
        var team2userId1 = req.param('team2userId1');
        var team2userId2 = req.param('team2userId2');
        // TODO verify that userIds are all different
        // TODO verify that for gameType 'doubles' we have 4 userIds

        createFindExistingTeamsQueryFor(gameType, team1userId1, team1userId2, team2userId1, team2userId2)
          .run(function (team1userId1, team1userId2, team2userId1, team2userId2, err, existingTeams) {
            if (err) {
                return console.log("ERROR RETRIEVING TEAMS", err);
            }
            var team1 = retrieveOrCreateTeamFor(team1userId1, team1userId2, existingTeams);
            var team2 = retrieveOrCreateTeamFor(team2userId1, team2userId2, existingTeams);

            var game = new models.Game({
                gameType: gameType,
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
        }.bind(null, team1userId1, team1userId2, team2userId1, team2userId2));
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
