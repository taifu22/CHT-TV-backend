const express = require('express');
const produitsController = require('../controllers/Produits.controller');

const produitsRouter = express.Router();
//route pour recuperer la liste des produits
produitsRouter.route('/').get(produitsController.getProduits);
//route pour ajouter une opinion sur un produit
produitsRouter.route('/create-new-opinion').patch(produitsController.setOpinionProduit);
//route pour ajouter un achat (juste la date, pour avoir aprés le nombre des achats de ce product)
produitsRouter.route('/create-new-purchase').patch(produitsController.setPurchaseProduct);
//route pour supprimer une date d'achat si annulation vente pendant checkout de stripe
produitsRouter.route('/cancel-new-purchase').patch(produitsController.cancelNewpurchase);
//route pour rendre à null le price et la percentage si l'on choisit depuis la dash admin de modifier via l'input le prix d'un produit
produitsRouter.route('/null-price-percentage-reduction').patch(produitsController.deletePricePercentageReduction);

module.exports = produitsRouter;