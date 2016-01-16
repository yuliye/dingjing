var client = require('twilio')('ACca3d316eecc3ee8aa422c1670f0b9cd4','c53e6369e7979242648b0903f5973df2');
var express = require('express');
module.exports = function(passport,pool,dbconfig) {
var router = express.Router();

/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/

router.get('/', function(req, res) {
  res.render('pages/landing');
});

router.get('/login', function(req, res) {
  res.render('pages/tw_login', { message: req.flash('loginMessage') });
});

router.post('/login', passport.authenticate('local-login', {
            successRedirect : '/users', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

router.get('/reg', function(req, res) {
  res.render('pages/tw_reg',{
    code: ''
  });
});

router.get('/tw',function(req, res) {
  code = '111111'
  //check database, if user exist, set its code; 
  //otherwise insert a new user with code but no status  
  client.sendMessage({
    to: '+1'+req.query.username,
    from: '+14506007320',
    body: code
  }, function(err,data){
    if(err) {
      console.log(err);
      req.flash('loginMessage', 'Bad Phone Number!');
    }
    else {
      console.log(data);

      pool.getConnection(function(err, connection) {
        connection.query('USE ' + dbconfig.database);  
        connection.query("SELECT * FROM User_Table WHERE Cell_Phone = ?",[req.query.username], function(err, rows){
            if (err)
                return done(err);
            if (!rows.length) {
                connection.query("INSERT INTO User_Table ( Cell_Phone, Code ) values (?,?)", [req.query.username,code]);
            }
            else {
                connection.query("UPDATE User_Table SET Code = ? WHERE Cell_Phone = ?", [code,req.query.username]);
            }
        });
        
        // connected! (unless `err` is set)
        connection.release();
      });

      res.render('pages/tw_reg',{
        code: req.query.username
      });
    }
  });
});


router.get('/public/:name?', function(req, res) {
  res.render('pages/short_header',{title:req.params.name});
});

return router;
};
