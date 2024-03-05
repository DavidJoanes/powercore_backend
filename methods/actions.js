const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken")
var request = require('request');
var lodash = require("lodash")
var bcrypt = require("bcryptjs")
var userModel = require("../models/user")
var powercellModel = require("../models/powercell_model")
const cloudinary = require("../configurations/cloudinary")
const toTitleCase = require("../configurations/title_case")

module.exports = functions = {
    // Users (posting)
    userSignup: async(req, res) => {
        const data = req.body;
        // const ipAddress = req.socket.remoteAddress;
        // function getRandomInt(max) {
        //     return Math.floor(Math.random() * max);
        // }
        // var tempId = getRandomInt(999999)
        try {
            // const idExist = await userModel.find({id: tempId})
            // if (idExist.length > 0) {
            //     console.log("Duplicate id!")
            //     return res.status(403).json({
            //         success: false,
            //         message: "Operation failed! Please try again.",
            //     })
            // } else {
                const powercellModelExist = await powercellModel.find({productid: data.productid})
                const userExist = await userModel.find({email: data.email})
                if (powercellModelExist.length > 0) {
                    if (userExist.length > 0) {
                        // var newLog = logModel({
                        //     logType: "user",
                        //     success: false,
                        //     email: data.email,
                        //     ipAddress: ipAddress,
                        //     description: `Registration failure. (account exist)`,
                        //     timeStamp: new Date(),
                        // })
                        // newLog.save()
                        return res.status(403).json({
                            success: false,
                            message: "Account already exist! Please login!"
                        })
                    }else {
                        var newuser = userModel({
                            // image: {
                            //     url: "",
                            //     id: "",
                            // },
                            image: "",
                            firstname: data.firstname,
                            lastname: data.lastname,
                            email: data.email,
                            securityquestion: data.securityquestion,
                            securityanswer: data.securityanswer,
                            productid: data.productid,
                            // ipaddress: data.ipaddress,
                            // statusapi: data.statusapi,
                            // systemapi: data.systemapi,
                            // systemcontrolapi: data.systemcontrolapi,
                            password: data.password,
                            phone: "",
                            country: "",
                            province: "",
                            city: "",
                            // pcnumber: data.pcnumber,
                            isSuspended: false,
                            subscription: "expired",
                            subscriptionduration: "0",
                            signupdate: new Date().toISOString().split("T")[0],
                            token: "",
                        })
                        // var newLog = logModel({
                        //     logType: "user",
                        //     success: true,
                        //     email: data.email,
                        //     ipAddress: ipAddress,
                        //     description: `Registration success.`,
                        //     timeStamp: new Date(),
                        // })
                        try {
                            await newuser.save()
                            // newLog.save()
                            console.log("Registration successful..")
                            return res.status(200).json({
                                success: true,
                                message: "Registration successful..",
                                data: newuser
                            })
                        } catch (error) {
                            console.log(`Registration failed!: ${error}`)
                            return res.status(404).json({
                                success: false,
                                message: "Registration failed!",
                                data: []
                            })
                        }
                    }
                }else {
                    console.log(`Registration failed! (product id not found): ${error}`)
                    return res.status(404).json({
                        success: false,
                        message: "Invalid product id!",
                        data: []
                    })
                }
            // }
        }catch(error) {
            console.log("Error occured during user registration!: "+error)
            return res.status(408).json({
                success: false,
                message: "An unexpected error occurred! Please try again later..",
            })
        }
    },
    userSignin: async(req, res) => {
        const data = req.body;
        try {
            const user = await userModel.findOne({email: data.email});
            if (!user) {
                console.log("Authentication failed! - Account not found")
                return res.status(403).json({
                  success: false,
                  message: "Authentication failed! - Invalid credentials",
                  data: [],
                });
            }
            const passwordMatch = await user.comparePassword(data.password);
            if (!passwordMatch) {
                console.log("Authentication failed! - Invalid password")
                return res.status(403).json({
                  success: "false",
                  message: "Authentication failed! - Invalid credentials",
                  data: [],
                });
            }
            if (user["isSuspended"]) {
                console.log("Authentication failed! - Account suspended")
                return res.status(403).json({
                  success: "suspended",
                  message: "Account suspended!",
                  data: [],
                });
            }
        
            const newToken = jwt.sign({user_id: data.email}, process.env.SECRET, {
              expiresIn: '1 hour'
            });
            await userModel.findOneAndUpdate(
                {email: data.email},
                {token: newToken},
                {new: true, runValidators: true}
            )
            return res.status(200).send({
                success: "true",
                message: "Welcome back " + toTitleCase(user["lastname"])  + "..",
                data: user,
                token: newToken,
            })
        }catch(error) {
            console.log("Error occured during login!: "+error)
            return res.status(408).json({
                success: false,
                message: "An unexpected error occurred! Please try again later..",
            })
        }
    },
    verifyToken: async(req, res, next) => {
        const token = req.headers["access-token"];
        if (!token) {
            console.log("No token found!")
            return res.status(403).send({
              success: false,
              message: "No token found!",
              data: [],
            });
        }else {
          try {
            const decoded = jwt.verify(token, process.env.SECRET);
            const user = await userModel.findOne({email: decoded["user_id"]})
            if (user) {
                console.log("Token is valid..")
                return res.status(200).send({
                    success: true,
                    message: "Token is valid..",
                    data: user,
                    token: user["token"],
                })
            }
          } catch (err) {
            console.log("Token has expired!")
            return res.status(403).send({
              success: false,
              message: "Token has expired!",
              data: [],
            })
          }
        }
    },
    userResetPassword: async(req, res) => {
        const data = req.body
        try {
            const userExist = await userModel.findOne({email: data.email})
            if (!userExist) {
                return res.status(403).json({
                    success: false,
                    message: "Account doesn't exist!"
                })
            }else {
                const salt = await bcrypt.genSalt(Number(process.env.SECRET_SALT));
                var hashP = await bcrypt.hash(data.newPassword, salt);
                await userModel.findOneAndUpdate(
                    {email: data.email},
                    {
                        password: hashP,
                    },
                    {new: true, runValidators: true}
                )
                return res.status(200).send({
                    success: true,
                    message: `Good job ${userExist["lastName"]}!.. You can now login.`,
                    data: [],
                })
            }
        } catch(error) {
            console.log("Error occured during password reset!: "+error)
            return res.status(408).json({
                success: false,
                message: "An unexpected error occurred! Please try again later..",
            })
        }
    },


    // User (fetching)
    fetchPowercellModel: async(req, res) => {
        const data = req.body;
        try {
            const product = await powercellModel.findOne({productid: data.productid});
            if (product) {
                return res.status(200).send({
                    success: true,
                    message: "Product id validation succeeded..",
                    data: product,
                })
            }else {
                console.log("Product id validation failed!")
                return res.status(403).json({
                  success: false,
                  message: "Product id validation failed!",
                  data: [],
                });
            }
        }catch(error) {
            console.log("Error occured during retrieving product model!: "+error)
            return res.status(408).json({
                success: false,
                message: "An unexpected error occurred! Please try again later..",
            })
        }
    },

}

module.exports = functions