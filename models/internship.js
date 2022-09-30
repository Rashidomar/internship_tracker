let mongoose = require('mongoose')

let internSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true,

    },
    role: {
        type: String,
        required: true,

    },
    task: {
        type: String,
        required: true,

    },
    experience: {
        type: String,
        required: true,

    },
    duration: {
        type: String,
        required: true,

    },

    user_id: {
        type: String,
        required: true,

    }

}, { timestamps: true })



let Intern = mongoose.model('Intern', internSchema)

module.exports = Intern