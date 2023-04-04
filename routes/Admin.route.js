const controller = require("../controllers/Admin.controller");
const MessagesController = require('../controllers/Messages.controller')
const express = require('express');
const multer = require('multer'); 

//multer me permet juste de sauvegarder une image recuperer depuis une requete dans un dossier du serveur back
const upload = multer({ dest: 'uploads/imagesUsersProfil' });
const AdminRouter = express.Router();

AdminRouter.route('/dashBoard/products/delete').patch(controller.deleteProduct);
//on utilise la methode any de multer pour receptionner un array files avec 1 ou plusieurs images produit (4 maximum)
AdminRouter.route('/dashBoard/products/add').post(upload.any(), controller.addNewProduct);
AdminRouter.route('/dashBoard/products/update').post(upload.any(), controller.updateProduct);
AdminRouter.route('/dashBoard/orders/add').post(controller.addNewOrder); 
AdminRouter.route('/dashBoard/orders/get').post(controller.getOrdersAdmin); 
AdminRouter.route('/dashBoard/opinions/add').post(controller.addNewOpinion);
AdminRouter.route('/dashBoard/opinions/get').post(controller.getOpinionsAdmin);
AdminRouter.route('/dashBoard/opinions/add-report-opinion').patch(controller.createNewReportOpinion);
AdminRouter.route('/dashBoard/opinions/delete-report-opinion').patch(controller.deleteReportOpinion);
AdminRouter.route('/dashBoard/opinions/delete').patch(controller.deleteOpinion);
//je écupère les messages pour les fficher coté dash admin, en route post car j'anvoi le token par sécurité
AdminRouter.route('/dashBoard/messages/get').post(MessagesController.getMessagesAdmin);

module.exports = AdminRouter;  