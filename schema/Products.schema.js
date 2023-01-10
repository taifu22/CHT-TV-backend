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
    }
})

const Produits = mongoose.model('products', produitsSchema);

module.exports = Produits