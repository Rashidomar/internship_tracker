const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');

module.exports = function(passport) {
    // Local Strategy
    passport.use(new LocalStrategy({
                usernameField: 'email',
                passwordField: 'password'
            },
            async function(email, password, done) {
                try {
                    const user = await User.findOne({ email: email })
                    if (!user) {
                        return done(null, false, { messsage: "Email does not exist:)" })
                    }
                    // Match Password
                    bcrypt.compare(password, user.password, function(err, isMatch) {
                        if (err) throw err;
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Wrong password' });
                        }
                    });
                } catch (error) {
                    console.log(error)
                }

            })

    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

}