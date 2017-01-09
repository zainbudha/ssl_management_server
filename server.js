'use strict';

var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var ssl = require("./sslManager.js")

ssl.setSslDir('./ssls/');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.all('/*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
	res.header("Access-Control-Allow-Headers", "origin, x-requested-with, content-type, accept");
	next();
});
  
app.get('/uisettings', function(req, res) {
  res.send(ssl.getUiSettings());
});

app.get('/ssls', function(req, res) {
  res.send(ssl.getAllSsls());
});

app.get('/ssl/:serialNumber', function(req, res) {
  res.send(ssl.getSsl(parseInt(req.params.serialNumber)));
});

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

app.get('/search', function(req, res) {
  if(isEmpty(req.query)) {
	  res.sendStatus(400);
  }
  else {
	  res.send(ssl.search(req.query));
  }
});

app.post('/ssl', function(req, res) {
  res.send(ssl.createSsl(req.body));
});

app.delete('/ssl/:serialNumber', function(req, res) {
  if(ssl.deleteSsl(parseInt(req.params.serialNumber)) !== -1) {
	  res.sendStatus(200);
  }
  else{
	  res.sendStatus(400);
  }
});

app.put('/ssl/:serialNumber', function(req, res) {
  res.send(ssl.updateSsl(parseInt(req.params.serialNumber), req.body));
});


// start the server
app.listen(1337);
console.log('Server started! At http://localhost:' + 1337);