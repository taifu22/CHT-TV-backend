const express = require('express');
const imageController = require('../controllers/Imageprofil.controller');
const multer = require('multer');

//multer me permet juste de sauvegarder une image recuperer depuis une requete dans un dossier du serveur back
const upload = multer({ dest: 'uploads/imagesUsersProfil' });
const ImageRouter = express.Router();

/*ici donc dans la methode sigle de upload je dit de recuperer le ficheir depuis la key picture de l'objet recu
Donc cette valeur de la key picture là ca sera notre req.file*/
ImageRouter.route('/profile/editImageProfil').post(upload.single('picture'), imageController.updateImgProfil);

module.exports = ImageRouter;  