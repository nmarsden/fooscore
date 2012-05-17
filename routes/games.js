var models = require('../models/models');

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
        models.Game.findById(game._id).populate('players', ['name']).run(function (err, game) {
            var playerName1 = game.players[0].name;
            var playerName2 = game.players[1].name;
            res.render('gameView', {
                gameId: game._id,
                playerName1: playerName1,
                playerName2: playerName2,
                playerScore1: req.param('playerScore1'),
                playerScore2: req.param('playerScore2')
            });
        });
    });

    app.post('/games/:id/goal/new', function(req, res){
        // TODO check if a player score has reached 10, and if so change game state to finished
        models.Game.findById(req.params.id).populate('players', ['name']).run(function (err, game) {
            var playerName1 = game.players[0].name;
            var playerName2 = game.players[1].name;
            res.render('gameView', {
                gameId: game._id,
                playerName1: playerName1,
                playerName2: playerName2,
                playerScore1: req.param('playerScore1'),
                playerScore2: req.param('playerScore2')
            });
        });
    });

//    app.get('/games', function(req, res){
//        res.render('gameList')
//    });


};
