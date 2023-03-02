const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema({
    product: {
        type: Array
    },
    total: {
        type: Array 
    },
    delivery: {
        type: Object
    },
    orderNumber: {
        type: Array
    },
    userEmail: {
        type: String
    }
})

const Orders = mongoose.model('orders', ordersSchema);

module.exports = Orders