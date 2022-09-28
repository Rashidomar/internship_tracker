let mongoose = require('mongoose')

let projectSchema = new mongoose.Schema({
    p_name: {
        type: String,
        required: true,

    },
    duration: {
        type: String,
        required: true,

    },
    url: {
        type: String,
        required: true,

    },
    description: {
        type: String,
        required: true,

    }

}, { timestamps: true })



let Project = mongoose.model('Project', projectSchema)

module.exports = Project