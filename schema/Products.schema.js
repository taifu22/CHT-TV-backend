const mongoose = require('mongoose');

const produitsSchema = new mongoose.Schema({
    id :{
        type: Number,
        unique: true,
        required: true
    },
    category: {
        type: String
    },
    name: {
        type: String
    },
    price: {
        type: Number
    },
    description: {
        type: String
    },
    opinions : {
        type: Array
    },
    purchases: {
        type : Array
    }
})

const Produits = mongoose.model('products', produitsSchema);

module.exports = Produits