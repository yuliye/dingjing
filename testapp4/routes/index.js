var client = require('twilio')('ACca3d316eecc3ee8aa422c1670f0b9cd4','c53e6369e7979242648b0903f5973df2');
var speakeasy = require('speakeasy');
var express = require('express');
module.exports = function(passport,pool,dbconfig,flash) {
var router = express.Router();

/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/

router.get('/old', function(req, res) {
  res.render('pages/landing');
});

router.get('/', function(req, res) {
  res.render('pages/shome');
});

router.get('/login', function(req, res) {
  res.render('pages/tw_login', { 
    message: req.flash('loginMessage'),
    index: 0 });
});

router.post('/login', passport.authenticate('local-login', {
            successRedirect : '/users/home', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

router.get('/reg1', function(req, res) {
  if(req.query.username)
    cellphone=req.query.username;
  else
    cellphone=''
  res.render('pages/reg1',{
    cellphone: cellphone,
    message: req.flash('signupMessage'),
    index: 0
  });
});

router.get('/reg2',function(req, res) {
  if(req.query.state==='1'){
    res.render('pages/reg2',{
      cellphone: req.query.username,
      code: req.query.code,
      message: req.flash('signupMessage'),
      index: 0
    });
  }
  else if (req.query.state==='0'){
    req.flash('signupMessage', '上个验证码五分钟内刚发送，请过五分钟后再试。');
    res.render('pages/reg2',{
      cellphone: req.query.username,
      code: "",
      message: req.flash('signupMessage'),
      index: 0
    });
  }
  else{
      pool.getConnection(function(err, connection) { 
        if(err){
          req.flash('signupMessage', '后端数据库问题1！请通知客服检查数据库。');
          res.redirect('/reg1?username='+req.query.username);
        }
        else {
          connection.query('USE ' + dbconfig.database);
          connection.query("SELECT * FROM User_Table WHERE Cell_Phone = ? and Last BETWEEN DATE_SUB(NOW() , INTERVAL 5 MINUTE) AND NOW()",[req.query.username], function(err, rows){
            if(err){
              req.flash('signupMessage', '后端数据库问题2！请通知客服检查数据库。');
              res.redirect('/reg1?username='+req.query.username);
            }
            else if (rows.length){
              //req.flash('signupMessage', '上个验证码五分钟内刚发送，请过五分钟后再试。');
              //res.redirect('/reg2?username='+req.query.username);
              res.redirect('/reg2?username='+req.query.username+'&state=0');
            }
            else {
//========================
  //if basic error
  if(req.query.username.length!==10&&req.query.username.length!==11){
    req.flash('signupMessage', '手机号码长度错误！中国手机11位，北美手机10位。');
    res.redirect('/reg1?username='+req.query.username); 
  } 
  //otherwise sending code
  else{
    var code = speakeasy.totp({key: 'UtUw1688'});
    console.log(code);
    var num = '+1'+req.query.username;
    if(req.query.username.length===11){
      num = '+86'+req.query.username;
    }
  //code = '111111'
  //check database, if user exist, set its code; 
  //otherwise insert a new user with code but no status  
  client.sendMessage({
    to: num,
    from: '+14506007320',
    body: code
  }, function(err,data){
    //if code sending error
    if(err) {
      //console.log(err);
      req.flash('signupMessage', '手机验证码发送失败！请输入正确手机号码。');
      res.redirect('/reg1?username='+req.query.username);
    }
    //otherise code send ok
    else {
      //console.log(data);
      //pool.getConnection(function(err, connection) {
      //  if(err){
      //    req.flash('signupMessage', '后端数据库问题1！请通知客服检查数据库。');
      //    res.redirect('/reg1?username='+req.query.username);
      //  }
      //  else{
      //  connection.query('USE ' + dbconfig.database);

        connection.query("SELECT * FROM User_Table WHERE Cell_Phone = ?",[req.query.username], function(err, rows){
            if(err){
              req.flash('signupMessage', '后端数据库问题3！请通知客服检查数据库。');
              res.redirect('/reg1?username='+req.query.username);
            }
            else if (!rows.length) {
                connection.query("INSERT INTO User_Table ( Cell_Phone, Code, Platform, Last) values (?,?,'web',now())", [req.query.username,code],function(err, result){
                  if(err){
                    req.flash('signupMessage', '后端数据库问题4！请通知客服检查数据库。');
                    res.redirect('/reg1?username='+req.query.username);
                  }
                  else{
                    res.render('pages/reg2',{
                      cellphone: req.query.username,
                      code: "",
                      message: req.flash('signupMessage'),
                      index: 0
                    });
                  }
                });
            }
            else {
                connection.query("UPDATE User_Table SET Code = ?, Last=now() WHERE Cell_Phone = ?", [code,req.query.username],function(err, result) {
                  if(err){
                    req.flash('signupMessage', '后端数据库问题5！请通知客服检查数据库。');
                    res.redirect('/reg1?username='+req.query.username);
                  }
                  else{
                    res.render('pages/reg2',{
                      cellphone: req.query.username,
                      code: "",
                      message: req.flash('signupMessage'),
                      index: 0
                    });
                  }
                });
            }
        });
        //}
        //connection.release();
      //});      
    } 
  });
}

//=========================
            }
          });
        }
        connection.release();
      });        
  }
});

//router.post('/tw', passport.authenticate('local-signup', {
//            successRedirect : '/users', // redirect to the secure profile section
//            failureRedirect : '/reg2', // redirect back to the signup page if there is an error
//            failureFlash : true // allow flash messages
//}));

router.post('/reg2', function(req, res, next) {
  passport.authenticate('local-signup', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/reg2?username='+req.body.username+'&state=1&code='+req.body.code); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/users/home');
    });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });

router.get('/public/:name?', function(req, res) {
  res.render('pages/short_header',{title:req.params.name});
});

return router;
};
