const controller = require("../controllers/PromosCode.controller");
const express = require('express');

const PromosRouter = express.Router();

//grace au token (pour voir si toujours l'admin est connecté) on peut ajouter/supprimer un code promo
PromosRouter.route('/add-new-PromosCode').post(controller.createNewPromosCode);
//récuperation des categories dans la dashboard admin
PromosRouter.route('/get-PromosCode').get(controller.getPromosCode);
//suppresson d'un code promo
PromosRouter.route('/delete-PromosCode').patch(controller.deletePromosCode);
 

module.exports = PromosRouter; 