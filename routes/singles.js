module.exports = function(app){
    app.get('/singles/new', function(req, res){
        res.render('singlesNew')
    });

    app.post('/singles/new', function(req, res){
        res.render('singlesGame', {
            playerName1: req.param('playerName1'),
            playerName2: req.param('playerName2'),
            playerScore1: req.param('playerScore1'),
            playerScore2: req.param('playerScore2')
        });
    });

};
