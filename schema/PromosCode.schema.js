const mongoose = require('mongoose');

const promosCodeSchema = new mongoose.Schema({
    code: {
        type: String
    },
    price: {
        type: String
    },
    description: {
        type: String 
    }
})

const PromosCode = mongoose.model('promosCode', promosCodeSchema);

module.exports = PromosCode