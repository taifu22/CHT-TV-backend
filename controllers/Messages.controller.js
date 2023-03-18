const config = require("../config/Auth.config");
const db = require("../schema");
const User = db.user;
const Message = db.message
const nodemailer = require('nodemailer');
const TextEmail = require('./../config/TextEmailSend')
  
let jwt = require("jsonwebtoken"); 
const { user } = require("../schema");

//on definie le transporteur pour l'envoie des emails
let transporter = nodemailer.createTransport({  
  host: 'smtp.gmail.com',
  port: 587, // 587 -> TLS & 465 -> SSL
  auth: {  
    user: 'adil70hamid@gmail.com', // email de votre votre compte google
    pass: 'dbjvzkkmurhpotfh' // password de votre compte google
  }  
});

//middleware pour envoyer une email à l'admin du site, depuis la page de contact
exports.sendEmail = async (req, res) => {
    try {

      const user = await User.findOne({
        email: req.body.email
      })

      transporter.sendMail(TextEmail.TextEmailSendContact(user.email, user.firstname + ' ' + user.lastname), (error, info) => {  
        if (error) {  
          console.log(error);  
        } else {  
          console.log('Email: ' + info.response);   
        }  
      });
  
      if (!user) {
        throw new Error('User not found!')
      }
  
      //return res.status(200).send({ message: "Email send successfully!" });
  
    } catch (error) {
      console.error('Error in userService.js', error)
      throw new Error(error)
    }
};

//middleware pour envoyer un email à l'user pour lui dire que l'admin lui a répondu (dans la discussion avec l'id 'x')
exports.sendEmailResponseToUser = async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findOne({
      email: req.body.user1
    })

    transporter.sendMail(TextEmail.TextEmailSendNewresponseToUser(user.email, req.body.object), (error, info) => {  
      if (error) {  
        console.log(error);
      } else {  
        console.log('Email: ' + info.response);   
      }  
    });

    if (!user) {
      throw new Error('User not found!')
    }

    //return res.status(200).send({ message: "Email send successfully!" });

  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error)
  }
};

//middleware pour envoyer un email à l'admin pour lui dire que l'user lui a répondu (dans la discussion avec l'id 'x')
exports.sendEmailResponseToAdmin = async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findOne({
      email: req.body.user
    })

    transporter.sendMail(TextEmail.TextEmailSendNewresponseToAdmin(user.email, user.firstname + ' ' + user.lastname, req.body.object), (error, info) => {  
      if (error) {  
        console.log(error);  
      } else {  
        console.log('Email: ' + info.response);   
      }  
    });

    if (!user) {
      throw new Error('User not found!')
    }

    //return res.status(200).send({ message: "Email send successfully!" });  

  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error)
  }
};

//middleware pour stocker le message (en forme de discussion) envoyé par le user à l'admin
exports.addNewMessageDiscussion = async (req, res, next) => {
    let response = {};
  
    try {
        //on verifie bien sur le token de l'user
        const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
        const decodedJwtToken = jwt.decode(jwtToken);
  
        const user = await User.findOne({
            _id: decodedJwtToken.id
        })
  
        //je récupère tous les messages de cette collection pour donner le numéro d'id suivant au nouoveau product
        const Allmessages = await Message.find();
        const newid = Allmessages.length ? parseInt(Allmessages[Allmessages.length -1].id) + 1 : 1;

        //create new objetc with new user's message (discussion), that we store into messages collection
        const newMessage= {
          id: newid,
          user: user.toObject().email,
          object: req.body.object,
          date: req.body.date,
          newMessage: true,
          messages: [{message: req.body.textMessage, user:user.toObject().email, date: req.body.date, newMessage: true}]
        }

        //create object, that we store into messages array, in the ueser document (newMessage in true, for see new in the messaging dashBoard)
        const newUserMessage = {
          id: newid,
          date: req.body.date,
          object: req.body.object,
          newMessage: false,
          messages: [{message: req.body.textMessage, user:user.toObject().email, date: req.body.date, newMessage: false}]
        }

        //on ajoute dans la proprieté newMessages de l'admin comme quoi il a recu un nouveau message, et il pourra evoir la notification 
        //une fois connecté dans sa dashboard admin
        const admin = await User.findOne({
          email: 'tony@stark.com'
        })
        const adminnewMsg = await User.findOneAndUpdate(
          { email: 'tony@stark.com' }, { newMessage: true }, { new: true }
        )
   
        //on sauvegarde le message discussion dans le array messages de l'user
        const message1 = await User.findOneAndUpdate(
          { _id: decodedJwtToken.id }, { messages:[...user.messages, newUserMessage] }, { new: true }
        )

        //ici on sauvegarde dans notre collection messages de la bdd, la nouvelle discussion avec id unique
        const message = new Message(newMessage)
        message.save((err, user) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          response.message = 'Successfully add new user\'s message';
          response.status = 200
          response.body = message.toObject();
          res.status(200).send(response);
          //on passe au middleware Sendemail pour envoyer un email à l'admin et lui dire que dans sa messagerie il a recu un message contact d'un user
          return next();
        });
  
        if (!user) {
        throw new Error('User not found!');
        }
  
    } catch (error) {
        console.error('Error in userService.js', error)
        throw new Error(error)
    }
}

/*middleware/controller pour sauvegarder la reponse de l'admin à l'user en bdd, et du coup aussi envoyer un mail à l'user
pour lui dire qu'il a recu une reponse dans la dashboard messagerie de la part de l'admin*/
exports.addNewResponseToUser = async (req, res, next) => {
  let response = {};

  try {
      //on verifie bien sur le token de l'user
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
      const decodedJwtToken = jwt.decode(jwtToken);

      const admin = await User.findOne({
          _id: decodedJwtToken.id
      })

      //je créé la réponse qu'on mettra dans la proprieté messages du document qui corresponds à l'id (dans la collection messages, et le document user proprieté messages).
      const newMessageUser = {
        message: req.body.message,
        user: req.body.user,
        date: req.body.date,
        newMessage: true
      }
      const newMessageAdmin = {
        message: req.body.message,
        user: req.body.user,
        date: req.body.date,
        newMessage: false
      }

      //si c'est l'admin qui envoie une réponse à un user, alors on stockera le message, dans la collection message (dans la bonne discussion avec la req.body.id)
      //et aussi on stocke dans la proprieté messages, du documents user (toujours dans la bonne discussion grace à la req.body.id)
      if (admin.role === 'admin') {

        //je cherche le bon message depuis la collection messages
        const message = await Message.findOne({
          id: req.body.id
        })
        //je rajoute la response de l'admin dans la discussion (document message)
        //la proprieté newMessage ca va etre false car c'est l'admin qui envoie à l'user donc ce n'est pas un nouveau message pour lui
        const message1 = await Message.findOneAndUpdate(
          { id: req.body.id }, { messages:[...message.messages, newMessageAdmin] }, { new: true } 
        )

        //maintenant je récupère le user qui doit recevoir la response pour l'ajouter dans la proprieté messages du document user
        const user = await User.findOne({
          email: req.body.user1
        })
        //je modifie la proprieté messages dans la proprieté messages du document user (pour ajouter le message envoyé de l'admin vers l'user)
        //newmessage ca va etre du coup à true car c'est l'admin qui envoie une reponse à l'user
        user.messages.map(item =>  {
          if (item.id == req.body.id) {
            //on mets le newMessage à true sur la discussion au niveau de la liste des discussions
            item.newMessage = true
            return item.messages.push(newMessageUser)
          }
        })
        //je update la proprieté messages de l'user qui recoit la reponse de l'admin (avec le map dessus on a ajouté le nouveau message)
        // on y rajoute le newMessage  true, pour visualiser la notification du dernier message dans la discussion
        const message2 = await User.findOneAndUpdate(
          { email: req.body.user1 }, { messages: user.messages }, { new: true }
        )
        //je modifie aussi l'état newmessage de l'user pour visualiser la notification
        const message3 = await User.findOneAndUpdate(
          { email: req.body.user1 }, { newMessage: true }, { new: true }
        )

        response.message = 'Successfully add new admin\'s message response';
        response.status = 200
        response.body = message2.toObject();
        res.status(200).send(response);
        return next();
      } 
      
      if (!admin) {
      throw new Error('Admin not found!');
      }

  } catch (error) {
      console.error('Error in userService.js', error)
      throw new Error(error)
  }
}

/*middleware/controller pour sauvegarder la reponse de l'user à l'admin en bdd, et du coup aussi envoyer un mail à l'admin
pour lui dire qu'il a recu une reponse dans la dashboard messagerie de la part de l'user en question*/
exports.addNewResponseToAdmin = async (req, res, next) => {
  let response = {};

  try {
      //on verifie bien sur le token de l'user
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
      const decodedJwtToken = jwt.decode(jwtToken);

      const user = await User.findOne({
          _id: decodedJwtToken.id
      })

      //je créé la réponse qu'on mettra dans la proprieté messages du document qui corresponds à la req.body.id
      //coté user donc le newMessage sera false, car c'est lui qui envoie, et coté admin sera new, donc a la connexion a sa session 
      //il aura la notification de nouveau message recu
      const newMessageUser = {
        message: req.body.message,
        user: req.body.user,
        date: req.body.date,
        newMessage: false
      }
      const newMessageAdmin = {
        message: req.body.message,
        user: req.body.user,
        date: req.body.date,
        newMessage: true
      }

      //je cherche le bon message depuis la collection messages
      const message = await Message.findOne({
        id: req.body.id
      })
      //je rajoute la response de l'user dans la discussion (document dans la collection message)
      const message1 = await Message.findOneAndUpdate(
        { id: req.body.id }, { messages:[...message.messages, newMessageAdmin] }, { new: true } 
      )   
      const newMessTrue = await Message.findOneAndUpdate(
        { id: req.body.id }, { newMessage: true }, { new: true } 
      )
      //je mets le newMessage a true dans la fiche de l'user admin
      const admin = await User.findOne({
        email: 'tony@stark.com'
      })
      const adminnewMsg = await User.findOneAndUpdate(
        { email: 'tony@stark.com' }, { newMessage: true }, { new: true }
      )

      //maintenant je récupère le user qui a envoyé la response pour l'ajouter dans la proprieté messages du document user
      const user1 = await User.findOne({
        email: req.body.user
      })      
      //je modifie la proprieté messages dans la proprieté messages du document user (pour ajouter le message qu'il a envoyé à l'admin)
      user1.messages.map(item =>  {
        if (item.id == req.body.id) {
          return item.messages.push(newMessageUser)
        }
      })
      //je update la proprieté messages de l'user qui envoie la reponse a l'admin (avec le map on a ajouté le nouveau message)
      const message2 = await User.findOneAndUpdate(
        { email: req.body.user }, { messages: user1.messages }, { new: true }
      )

      if (!user) {
        throw new Error('Admin not found!');
      }

      response.message = 'Successfully add new user\'s message response';
      response.status = 200
      response.body = message2.toObject();
      res.status(200).send(response);
      return next();

  } catch (error) {
      console.error('Error in userService.js', error)
      throw new Error(error)
  }
}

/*middleware/controller pour la récuperation de toute la liste des messages des utilisateurs dans la dashboard admin */
exports.getMessagesAdmin = async (req, res) => {
  try {
      //on verifie bien sur le token de l'user
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
      const decodedJwtToken = jwt.decode(jwtToken);

      const admin = await User.findOne({
          _id: decodedJwtToken.id
      })
      if (admin.role === "admin") {
        const messages = await Message.find();
        res.status(200).json({
            status: 'success',
            data: messages
        })
      }
      if (!admin) {
        throw new Error('User not found!');
      }
  } catch (error) {
      console.log(error);
  } 
}

//une fois rentré dans la discussion du message recu, on supprime la notification de nouveau message recu
//on est dans la dashboard admin donc on passe à false le newMessage de la discussion dans la collection Message, et 
//le newMessage dans le document user de l'admin
exports.setNewMessageAdminFalse = async (req, res) => {
  try {
      //on verifie bien sur le token de l'user
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
      const decodedJwtToken = jwt.decode(jwtToken);

      const admin = await User.findOne({
          _id: decodedJwtToken.id
      })
      if (admin.role === "admin") {
        //newMessage à false, dans la fiche donc document de l'utilisateur dans la bdd (pour ne plus affichere la notification 
        //new message dans la nav en haut)
        const userMessageFalse = await User.findOneAndUpdate(
          { _id: decodedJwtToken.id }, { newMessage: false }, { new: true }
        )
        //je fait un map pour récuperer tous les items dans le array messages et passer les newmessage à false
        const message = await Message.findOne({
          id: req.body.id
        })
        message.messages.map(item => {
          return item.newMessage = false
        })
        //newMessage à false coté document dans la colection Messages 
        const message1 = await Message.findOneAndUpdate(
          { id: req.body.id }, { newMessage: false }, { new: true }
        )
        //voilà je update le document message dans la collections messages avec tous les newMessage à false
        const message2 = await Message.findOneAndUpdate(
          { id: req.body.id }, { messages: message.messages }, { new: true }
        )
      }
      if (!admin) {
        throw new Error('User not found!');
      }
  } catch (error) {
      console.log(error);
  } 
}

//ici on passe à false le newMessage de l'user, donc juste coté document user dans le array messages, et dans chaque message
//dans la discussion (si plusieurs nouveau messages dans la discussion)
exports.setNewMessageUserFalse = async (req, res) => {
  try {
      //on verifie bien sur le token de l'user
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
      const decodedJwtToken = jwt.decode(jwtToken);

      const user = await User.findOne({
          _id: decodedJwtToken.id
      })
      if (user.role === "user") {
        //newMessage à false, dans la fiche donc document de l'utilisateur dans la bdd (pour ne plus affichere la notification 
        //new message dans la nav en haut)
        const userMessageFalse = await User.findOneAndUpdate(
          { _id: decodedJwtToken.id }, { newMessage: false }, { new: true }
        )
        
        user.messages.map(item => {
          if (item.id === req.body.id) {
            return item.newMessage = false
          }
          item.messages.map(item1 => {
              return item1.newMessage = false
          })
        })
        //newMessage à false à l'intérieur de messages toujours dans le document de l'user 
        const user1 = await User.findOneAndUpdate(
          { _id: decodedJwtToken.id }, { messages: user.messages }, { new: true }
        )

      }
      if (!user) {
        throw new Error('User not found!');
      }
  } catch (error) {
      console.log(error);
  } 
}