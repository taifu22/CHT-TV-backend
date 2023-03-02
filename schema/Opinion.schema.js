const mongoose = require('mongoose');

const opinionSchema = new mongoose.Schema({
    id: {
        type: String
    },
    user: {
        type: String
    },
    nameProduct: {
        type: String
    },
    userName: {
        type: String
    },
    opinion: {
        type: String
    },
    star: {
        type: Number
    },
    date: {
        type: String
    },
    report: {
        type: Array
    }
})

const Opinions = mongoose.model('opinions', opinionSchema);

module.exports = Opinions