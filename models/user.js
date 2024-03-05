var mongoose = require("mongoose")
var Schema = mongoose.Schema;
var bcrypt = require("bcryptjs")
var jwt = require("jsonwebtoken")

var userSchema = new Schema({
    // image: {
    //     type: Object,
    // },
    image: {
        type: String,
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    securityquestion: {
        type: String,
        required: true,
    },
    securityanswer: {
        type: String,
        required: true,
    },
    productid: {
        type: String,
        required: true,
    },
    // ipaddress: {
    //     type: String,
    //     required: true,
    // },
    // statusapi: {
    //     type: String,
    //     required: true,
    // },
    // systemapi: {
    //     type: String,
    //     required: true,
    // },
    // systemcontrolapi: {
    //     type: String,
    //     required: true,
    // },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    country: {
        type: String,
    },
    province: {
        type: String,
    },
    city: {
        type: String,
    },
    // pcnumber: {
    //     type: String,
    //     required: true,
    // },
    isSuspended: {
        type: Boolean,
    },
    subscription: {
        type: String,
    },
    subscriptionduration: {
        type: String,
    },
    signupdate: {
        type: String,
    },
    token: {
        type: String,
    }
})


userSchema.pre("save", async function(next) {
    var user = this;
    if (!user.isModified('password')) return next();  
    try {
      const salt = await bcrypt.genSalt(Number(process.env.SECRET_SALT));
      user.password = await bcrypt.hash(user.password, salt);
      next();
    } catch (error) {
      return next(error);
    }
})

userSchema.pre("resetPassword", async function(next) {
    var user = this;
    if (!user.isModified('password')) return next();  
    try {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      next();
    } catch (error) {
      return next(error);
    }
})

userSchema.methods.newPassword = function(newpassword, callback) {
    bcrypt.genSalt(20, function(error, salt) {
        if (error) {
            return callback(error)
        }
        bcrypt.hash(newpassword, salt, function(error, hash) {
            if (error) {
                return callback(error)
            }
            newpassword = hash;
            callback(null, newpassword)
        })
    })
}

userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
}

module.exports = mongoose.model("clients", userSchema)