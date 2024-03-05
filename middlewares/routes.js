const express = require("express")
const actions = require("../methods/actions")
const router = express.Router()


router.get("/", (req, res) => {
    const ipAddress = req.socket.remoteAddress;
    res.send(`Welcome to ACECORE! ${ipAddress}`)
})


// USER APIS
//posting
router.post("/api/acecore/v1/signup", actions.userSignup)
router.post("/api/acecore/v1/signin", actions.userSignin)
router.post("/api/acecore/v1/verify-token", actions.verifyToken)
router.post("/api/acecore/v1/reset-password", actions.userResetPassword)


//retrieving
router.post("/api/acecore/v1/fetch-model", actions.fetchPowercellModel)

module.exports = router