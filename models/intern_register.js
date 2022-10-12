let mongoose = require('mongoose')

let internRegSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },
    company: {
        type: String,
        required: true,

    },
    contact: {
        type: String,
        required: true,

    },
    supervisor: {
        type: String,
        required: true,

    },
    status: {
        type: String,
        default: "none"

    },
    f_approval: {
        type: String,
        default: "none"

    },

    user_id: {
        type: String,
        required: true,

    }

}, { timestamps: true })



let InternReg = mongoose.model('InternReg', internRegSchema)

module.exports = InternReg