const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const stripe = require('stripe')(process.env.SECRET_KEY_STRIPE_TEST);
//const express = require('express');

exports.getStripe = async (req, res) => {
    const YOUR_DOMAIN = 'http://localhost:3000';
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: req.body,
            mode: 'payment',
            //dans notre app react on a le lien /success pour dire que la commande est ok, et le /cancel pour dire qu'on annule
            success_url: `${YOUR_DOMAIN}/success`,
            cancel_url: `${YOUR_DOMAIN}/cancel`,
        });

        res.json({id: session.id})
    } catch (error) {
        return res.status(500).send('failed to process payment' + error); 
    }
} 