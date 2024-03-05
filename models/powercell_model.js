var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var powercellModelSchema = new Schema({
    productid: {
        type: String,
        required: true,
    },
    ipaddress: {
        type: String,
        required: true,
    },
    statusapi: {
        type: String,
        required: true,
    },
    systemapi: {
        type: String,
        required: true,
    },
    systemcontrolapi: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model("powercell_models", powercellModelSchema)