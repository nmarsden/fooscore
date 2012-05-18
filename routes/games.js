var models = require('../models/models'),
    _ = require("../underscore-min");

module.exports = function(app){
    app.get('/games/new', function(req, res){
        res.render('gameNew', {
            gameType: req.query.gameType,
            gameTitle: req.query.gameType == "singles" ? "Singles Game" : "Doubles Game"
        })
    });

    app.post('/games/new', function(req, res){
        var game = new models.Game({
            gameType: req.param('gameType'),
            players: [req.param('playerId1'), req.param('playerId2')],
            goals: [],
            state: "in-progress"
        });
        game.save(function (err) {
            if (!err) {
                return console.log("game created");
            } else {
                return console.log(err);
            }
        });
        models.Game.findById(game._id)
            .populate('players', ['name'])
            .populate('goals', ['user'])
            .run(function (err, game) {
                var playerName1 = game.players[0].name;
                var playerName2 = game.players[1].name;
                var playerId1 = game.players[0]._id;
                var playerId2 = game.players[1]._id;
                res.render('gameView', {
                    gameId: game._id,
                    playerName1: playerName1,
                    playerName2: playerName2,
                    playerId1: playerId1,
                    playerId2: playerId2,
                    playerScore1: "0",
                    playerScore2: "0"
                });
        });
    });

    app.post('/games/:id/goal/new', function(req, res){
        // 1. find game
        var gameId = req.params.id;
        var playerId = req.param('playerId');
        models.Game.findById(gameId)
            .populate('players', ['name'])
//            .populate('goals')
            .run(function (playerId, err, game) {
                if (err) {
                    return console.log("ERROR RETRIEVING GAME", err);
                }
                if (game.state === "complete") {
                    return console.log("cannot add goal! game already complete", err);
                }
                // 2. Determine if the player has just scored the winning goal
                var playerGoals = game.playerScore(playerId) + 1;
                console.log("playerGoals:", playerGoals);

                if (playerGoals === 10) {
                    console.log("GAME COMPLETE!");
                    game.populateForWinner(playerId);
                }

                // 3. create goal
                var goal = new models.Goal({
                    user: playerId
                });

                // 4. save goal
                goal.save(function (game, err, goal) {
                    if (err) {
                        return console.log("ERROR SAVING GOAL", err);
                    }
                    // 5. add new goal to game
                    game.goals.push(goal);

                    // 6. save game
                    game.save(function (err, game) {
                        if (err) {
                            return console.log("ERROR SAVING GAME", err);
                        }
                        var playerName1 = game.players[0].name;
                        var playerName2 = game.players[1].name;
                        var playerId1 = game.players[0]._id;
                        var playerId2 = game.players[1]._id;
                        var playerScore1 = game.playerScore(playerId1);
                        var playerScore2 = game.playerScore(playerId2);
                        console.log("playerScore1:", playerScore1);
                        console.log("playerScore2:", playerScore2);
                        res.render('gameView', {
                            gameId: game._id,
                            playerName1: playerName1,
                            playerName2: playerName2,
                            playerId1: playerId1,
                            playerId2: playerId2,
                            playerScore1: playerScore1,
                            playerScore2: playerScore2
                        });
                    });
                }.bind(null, game));
            }.bind(null, playerId));
    });

    app.get('/games/:id', function(req, res){
        models.Game.findById(req.params.id)
            .populate('players', ['name'])
            .populate('goals')
            .run(function (err, game) {
                var playerName1 = game.players[0].name;
                var playerName2 = game.players[1].name;
                res.render('gameView', {
                    gameId: game._id,
                    playerName1: playerName1,
                    playerName2: playerName2,
                    playerScore1: "0",
                    playerScore2: "0"
                });
            });
    });

//    app.get('/games', function(req, res){
//        res.render('gameList')
//    });


};
