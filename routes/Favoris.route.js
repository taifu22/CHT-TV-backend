const controller = require("../controllers/Favoris.controller");
const express = require('express');

const FavRouter = express.Router();

//grace au token (pour voir si toujours le meme user est connecté) on peut ajouter/supprimer un produits au favoris
FavRouter.route('/profile/favoris').patch(controller.createNewFavorite);
FavRouter.route('/profile/favoris/delete').patch(controller.deleteFavorite); 

module.exports = FavRouter;