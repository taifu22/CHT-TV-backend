const express = require('express');
const stripeController = require('../controllers/Stripe.controller')

const StripeRouter = express.Router();

StripeRouter.route('/create-checkout-session').post(stripeController.getStripe);

module.exports = StripeRouter;