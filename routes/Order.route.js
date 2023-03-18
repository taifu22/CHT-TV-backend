const express = require('express');
const orderController = require('../controllers/order.controller')

const OrderRouter = express.Router();

OrderRouter.route('/create-new-order').patch(orderController.createNewOrder); 
OrderRouter.route('/cancel-new-order').patch(orderController.cancelNewOrder);

module.exports = OrderRouter;