module.exports = function(app){
    app.get('/singles/new', function(req, res){
        res.render('singlesNew')
    });
};
