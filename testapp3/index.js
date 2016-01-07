var express = require('express');
var stormpath = require('express-stormpath');
var app = express();

app.use(stormpath.init(app, {
  website: true
}));

app.set('port', (process.env.PORT || 8080));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/landing');
});




app.get('/test1', function(request, response) {
  response.render('pages/bs_detail_view');
});

var data = [
        ['Bloody Mary', 3, 7, 11, 23, 11, 3, 7, 11, 23, 11, 43, 33],
        ['Martini', 5, 7, 11, 23, 11, 3, 7, 11, 23, 11, 3, 7],
        ['Scotch', 11, 7, 11, 23, 11, 7, 11, 23, 11, 3, 7, 11],
        ['Bloody Mary', 3, 7, 11, 23, 11, 3, 7, 11, 23, 11, 43, 33],
        ['Martini', 5, 7, 11, 23, 11, 3, 7, 11, 23, 11, 3, 7],
        ['Scotch', 11, 7, 11, 23, 11, 7, 11, 23, 11, 3, 7, 11],
        ['Bloody Mary', 3, 7, 11, 23, 11, 3, 7, 11, 23, 11, 43, 33],
        ['Martini', 5, 7, 11, 23, 11, 3, 7, 11, 23, 11, 3, 7],
        ['Scotch', 11, 7, 11, 23, 11, 7, 11, 23, 11, 3, 7, 11],
    ];

var header = ['基金名', 
              '上月回报', 
              '上年回报', 
              '最大回撤', 
              '年复回报', 
              '最低投资',  
              '资产规模', 
              '管理费用', 
              '业绩提成', 
              '行业侧重', 
              '投资策略',
              '决策类型',
              '基金组成']

var pageIndex = [1, 5, 9]

app.get('/test2', function(request, response) {
  response.render('pages/bs_list_view',{
    header: header, 
    data: data, 
    pageIndex: pageIndex});
});

app.get('/test3', function(request, response) {
  response.render('pages/bs_search_view');
});

app.get('/public/:name?', function(request, response) {
  response.render('pages/short_header',{title:request.params.name});
});

app.on('stormpath.ready', function() {
  app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
  });
});  
