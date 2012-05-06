
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};


/*
 * GET singles page.
 */

exports.singles = function(req, res){
    res.render('singles')
};