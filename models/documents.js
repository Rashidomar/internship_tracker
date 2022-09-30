let mongoose = require('mongoose')

let documentSchema = new mongoose.Schema({
    d_name: {
        type: String,
        required: true,

    },

    f_name: {
        type: String,
        required: true,

    },

    experience: {
        type: String,
        required: true,

    },

    user_id: {
        type: String,
        required: true,

    }

}, { timestamps: true })



let Document = mongoose.model('Document', documentSchema)

module.exports = Document