let mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,

    },
    lastname: {
        type: String,
        required: true,

    },
    school: {
        type: String,
        required: true,

    },
    course: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true,

    },

    password: {
        type: String,
        required: true,
    }

}, { timestamps: true })



let User = mongoose.model('User', userSchema)

module.exports = User