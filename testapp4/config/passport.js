// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
//var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
//var dbconfig = require('./database');
//var connection = mysql.createConnection(dbconfig.connection);

//connection.query('USE ' + dbconfig.database);

//var pool = mysql.createPool(dbconfig.connection);


// expose this function to our app using module.exports
module.exports = function(passport, pool, dbconfig) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.User_ID);
    });

    // used to deserialize the user
    passport.deserializeUser(function(User_ID, done) {
      pool.getConnection(function(err, connection) {
        connection.query('USE ' + dbconfig.database);
        connection.query("SELECT * FROM User_Table WHERE User_ID = ? ",[User_ID], function(err, rows){
            done(err, rows[0]);
        });
        // connected! (unless `err` is set)
        connection.release();
      });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'code',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, code, done) {
          if(req.body.password!==req.body.repassword)
            return done(null, false, req.flash('signupMessage', '密码不匹配!'));  
          pool.getConnection(function(err, connection) {
            if (err)
                return done(err)
            connection.query('USE ' + dbconfig.database);  
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            connection.query("SELECT * FROM User_Table WHERE Cell_Phone = ? AND Code = ?",[username,code], function(err, rows) {
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('signupMessage', '验证码不匹配!'));
                } else {
                    connection.query("UPDATE User_Table SET Password = ?, Status = 1 WHERE Cell_Phone = ?",
                    [bcrypt.hashSync(req.body.password, null, null),username], function(err,result) {
                        if(err)
                            return done(err);
                    });
                    connection.query("SELECT * FROM User_Table WHERE Cell_Phone = ?",[username], function(err, rows) {
                        if(err)
                            return done(err);
                        return done(null, rows[0]);
                    });
                }
            });
            // connected! (unless `err` is set)
            connection.release();
          });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
          pool.getConnection(function(err, connection) {
            connection.query('USE ' + dbconfig.database);  
            connection.query("SELECT * FROM User_Table WHERE Cell_Phone = ? AND Status = 1",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', '登录错误！用户不存在。')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].Password)){
                //if(password !== rows[0].Password){
                    return done(null, false, req.flash('loginMessage', '登录错误！密码不正确。')); // create the loginMessage and save it to session as flashdata
                }

                // all is well, return successful user
                return done(null, rows[0]);
            });
            // connected! (unless `err` is set)
            connection.release();
          });  
        })
    );
};
