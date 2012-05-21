var express = require('express');
var mongoose = require('mongoose');
var config = require('./config.js');

mongoose.connect(config.mongodb.url);

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

// Routes
require('./routes')(app);

// Configure
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.listen(17463, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
