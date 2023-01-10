const express = require('express');
const produitsController = require('../controllers/Produits.controller');

const produitsRouter = express.Router();
produitsRouter.route('/').get(produitsController.getProduits);

module.exports = produitsRouter;