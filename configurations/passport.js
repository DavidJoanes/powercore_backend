var JwtStrategy = require("passport-jwt").Strategy
var ExtractJwt =  require("passport-jwt").ExtractJwt

var userModel = require("../models/user")

module.exports = function(passport) {
    var options = {}

    options.secretOrKey = process.env.SECRET
    options.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt")

    passport.use(new JwtStrategy(options, function(jwt_payload, done) {
        userModel.find({
            id: jwt_payload.id
        },
        function(error, user) {
            if (error) {
                return done(error, false)
            }
            if (user) {
                return done(null, user)
            }else {
                return done(null, false)
            }
        }
        )
    }))
}
