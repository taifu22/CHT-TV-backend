const controller = require("../controllers/Cart.controller");
const express = require('express');

const CartRouter = express.Router();

//grace au token (pour voir si toujours l'admin est connecté) on peut ajouter/supprimer un code promo
CartRouter.route('/add-new-cart').post(controller.addProductsCart);
//récuperation des categories dans la dashboard admin
CartRouter.route('/get-cart').post(controller.getProductsCart);
//suppresson d'un code promo
CartRouter.route('/delete-cart').patch(controller.deleteProductsCart);   
//on vide le panier, si l'user valide l'achat
CartRouter.route('/delete-all-data-cart').patch(controller.deleteAllProductsCart); 
//on modifie la quantité d'un produit
CartRouter.route('/update-quantity-product').patch(controller.updateQuantityProductCart);      
 

module.exports = CartRouter;   