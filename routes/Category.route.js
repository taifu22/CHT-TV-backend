const controller = require("../controllers/Categorys.controller");
const express = require('express');
const multer = require('multer');

//multer me permet juste de sauvegarder une image recuperer depuis une requete dans un dossier du serveur back
const upload = multer({ dest: 'uploads/imagesUsersProfil' });

const CatRouter = express.Router();

//grace au token (pour voir si toujours l'admin est connecté) on peut ajouter/supprimer une category
CatRouter.route('/add-new-category').post(upload.single('picture'), controller.createNewCategory);
//récuperation des categories dans la dashboard admin
CatRouter.route('/get-categorys').get(controller.getCategories);
//suppresson d'une categorie (suppression du coup aussi de son image/icon)
CatRouter.route('/delete-category').patch(controller.deleteCategory);
 

module.exports = CatRouter; 