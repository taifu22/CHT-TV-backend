const controller = require('../controllers/Messages.controller')
const express = require('express');

const MessRouter = express.Router();

//envoie email depuis la page de contact, de l'user vers la boite email de l'admin
//et démarrage d'une nouvelle discussion de la part de l'user depuis le contact form 'Contact'
MessRouter.route('/messaging/send-email-contact').post(controller.addNewMessageDiscussion, controller.sendEmail);
//envoie d'une reponse de l'admin vers le user, donc envoie de la réponse en bdd collection messages, et dans le document 
//de l'user en question dans sa proprieté array messages, et aussi envoie par mail à l'user pour lui dire qu'il a recu 
//une reponse dans sa dashboard messagerie
MessRouter.route('/messaging/send-reponse-to-user').patch(controller.addNewResponseToUser, controller.sendEmailResponseToUser);
//meme chose ici par contre maintenant c'est le user qui réponds à l'admin, donc on stocke dans la bonne discussion coté 
//colection messages (grace à la req.body.id), puis on sauvegarde aussi dans la proprieté messages, toujours dans la bonne discussion
//de l'user qui a envoyé la reponse (pour qu'il a voit dans sa messagerie)
MessRouter.route('/messaging/send-reponse-to-admin').patch(controller.addNewResponseToAdmin, controller.sendEmailResponseToAdmin);
//on supprime la notification une fois que l'admin rentre dans la discussion dont il a recu le nouveau message
MessRouter.route('/messaging/delete-new-mess-admin').patch(controller.setNewMessageAdminFalse)
//meme chose pour l'user
MessRouter.route('/messaging/delete-new-mess-user').patch(controller.setNewMessageUserFalse)


module.exports = MessRouter