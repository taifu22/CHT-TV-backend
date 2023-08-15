const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: String
    },
    userId: {
        type: String
    },
    products: {
        type: Array
    }
})

const Cart = mongoose.model('cart', cartSchema);

module.exports = Cart 