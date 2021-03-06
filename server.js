 /******************************************************
 * PLEASE DO NOT EDIT THIS FILE
 * the verification process may break
 * ***************************************************/

'use strict';

var fs = require('fs');
var express = require('express');
var app = express();
var mongoose=require('mongoose');
var RecentSearch=require('./models/recent-search.js');
var request = require('request');
var moment=require('moment');

var dbURL='mongodb://'+process.env.USER+':'+process.env.PASSWORD+'@'+process.env.HOST+':'+process.env.DBPORT+'/'+process.env.DB;
mongoose.connect(dbURL);
app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })
app.get('/api/imagesearch/:urlToFind',function (req,res,next)
        {
  var searchTerm=req.params.urlToFind;
  var offset=req.query.offset;
  var result=[];
   var searchURL='https://www.googleapis.com/customsearch/v1?q='+searchTerm+'&key='+process.env.KEY+'&cx='+process.env.ENGID+'&num='+offset+'&searchType=image';
   var data=new RecentSearch({
   term:searchTerm,
   when:Date.now()

 });
  data.save(function(err, RecentSearch){
         if(err)
            res.send('error in saving');
         
      });
request(searchURL, function (error, response, body) {
      if (body && !error && response.statusCode == 200) {
    body = JSON.parse(body);
    for (var i = 0; i < offset; i++) { 
    var selection = body.items[i];
    var newObj = {
        "title": selection.title,
        "alttext": selection.snippet,
        "imgUrl": selection.link,
        "pageUrl": selection.image.contextLink
        };
    result.push(newObj);
    }
    res.send(result);
  }
});
});
 app.get('/api/latest/imagesearch',function(req,res,next)
{            var result=[];

  RecentSearch.find({},function(err,data)
          {
    if(err)
      throw err;
    for (var i = 0; i < data.length; i++) { 
    var selection = data[i];
    var newObj = {
        'term':selection.term,
      'when':moment.unix(selection.when).format()
        };
res.send(newObj);
    }
});
 

});
// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});


// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

