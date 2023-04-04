const verifySignUp = require("../middleware/VerifySignUp");
const DataIsValid = require('../middleware/DataIsValid');
const CheckValidSignup = require('../config/CheckValidSignup')
const verifyToken = require('../middleware/verifyToken');
const controller = require("../controllers/Auth.controller");  
const express = require('express');

const authRouter = express.Router();
/*dans cette route pour l'inscription, on verifie si l'email existe deja en bdd, puis on lance le tableau
du expressvalidator, avec les regex, on verifie sdi les données recues sont conformes au regex, et on envoie en bdd*/
authRouter.route('/signup').post(verifySignUp, CheckValidSignup, DataIsValid, controller.signup);
//on verifie si mdp et user corresponds et on attribu un token
authRouter.route('/signin').post(controller.signin);
//grace au token on récupère les données de l'user
authRouter.route('/profile').post(verifyToken, controller.getUserProfile);
//toujours grace au token on peut ajouter/modifier/supprimer une adresse de livraison
authRouter.route('/profile/address').patch(controller.createNewAdress);
authRouter.route('/profile/address/delete').patch(controller.deleteAdress);
//on modifie le nom et prenom de l'utilisateur
authRouter.route('/profile/firstlastname').patch(controller.editLastFirstName);
//modification du mot de passe ou de l'email de l'utilisateur
authRouter.route('/profile/editpasswordoremail').patch(controller.editPasswordEmail);    

 
module.exports = authRouter;
   
 