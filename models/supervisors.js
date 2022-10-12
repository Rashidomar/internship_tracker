let mongoose = require('mongoose')

let supervisorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },

    user_id: {
        type: String,
        required: true,

    }

}, { timestamps: true })



let Supervisor = mongoose.model('Supervisor', supervisorSchema)

module.exports = Supervisor