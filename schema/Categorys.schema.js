const mongoose = require('mongoose');

const categorysSchema = new mongoose.Schema({
    name: {
        type: String
    },
    image: {
        type: String
    }
})

const Categorys = mongoose.model('categorys', categorysSchema);

module.exports = Categorys