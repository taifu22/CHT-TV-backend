const config = require("../config/Auth.config");
const db = require("../schema");
const User = db.user;
const Cart = db.cart;
const nodemailer = require('nodemailer');
const TextEmail = require('./../config/TextEmailSend')
  
let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

//on créé un nouvel utilisateur dans la bdd
exports.signup = async (req, res) => {
  const user = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,  
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),  
    role: 'user',
    address: [],
    orders: [],
    image: {},
    favoris: [],
    opinions: [],
    opinionsWithReport: [],
    messages: []
  });
  console.log(user);
  //on créé dans la collection Cart un nouveau document où on sauvegardera les produits que le user ajoutera à son panier
  //on va d'abord récupèrer le nouveau user créé pour pouvoir aprés rècupèrer son id et le sauvegarder dans notre nouveau document dans Cart
  const cart = new Cart({
    user: req.body.email,
    userId: user.id,
    products: []
  })
  //on sauvegarde notre panier dans la collection Cart 
  cart.save((err, cart) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    res.status(200).send({ message: "User's cart was registered successfully!" });
  });
  //on sauvegarde notre user dans la collection User
  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    //on envoie l'email au clinet user comme quoi il s'est bien enregistré dans notre site
    let transporter = nodemailer.createTransport({  
      host: 'smtp.gmail.com',
      port: 587, // 587 -> TLS & 465 -> SSL
      auth: {  
        user: 'adil70hamid@gmail.com', // email de votre votre compte google
        pass: 'dbjvzkkmurhpotfh' // password de votre compte google 
      }  
    });
    transporter.sendMail(TextEmail.TextEmailSend(req.body.email, req.body.firstname), (error, info) => {  
      if (error) {  
        console.log(error);  
      } else {  
        console.log('Email: ' + info.response);  
      }  
    });

    res.status(200).send({ message: "User was registered successfully!" });
  });
};

//connexion de l'utilisateur en donnant un jwt
exports.signin = (req, res) => { 
  User.findOne({
    email: req.body.email
  })
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
 
      if (!user) { 
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      res.status(200).send({
        id: user._id,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: user.email,
        accessToken: token
      });
    });
};

//récuperaton des données de l'utilisateur grace au token recu au moment du login
//connexion en temps que admin si role === "admin"
exports.getUserProfile = async (req, res, next) => {
  let response = {};
  try {
    const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
    const decodedJwtToken = jwt.decode(jwtToken)
    const user = await User.findOne({ _id: decodedJwtToken.id })
    if (!user) {
      throw new Error('User not found!')
    }
    if (user.role === 'admin'){
      response.message = 'Successfully got admin profile data';
    } else {
      response.message = 'Successfully got user profile data';
    }
    response.status = 200
    response.body = user.toObject();
    return res.status(200).send(response)
  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error)
  }
}

//ajouter une nouvelle adresse de livraison
exports.createNewAdress = async (req, res) => {
  let response = {};
  //console.log(req.headers);
  try {
    const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
    const decodedJwtToken = jwt.decode(jwtToken)
    const user = await User.findOne({
      _id: decodedJwtToken.id
    })
    //console.log(user);
    const addressCreate = {
      firstname: req.body.firstname, 
      lastname: req.body.lastname,
      street: req.body.street,
      city: req.body.city,
      country: req.body.country
    }
    const user1 = await User.findOneAndUpdate(
      { _id: decodedJwtToken.id }, { address:[...user.address, addressCreate] }, { new: true }
    )
    if (!user1) {
      throw new Error('User not found!')
    }
    //console.log(user1);
    response.message = 'Successfully add address data';
    response.status = 200
    response.body = user1.address.toObject();
    return res.status(200).send(response);
  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error)
  }
}

//supprimer une adresse de livraison
exports.deleteAdress = async (req, res) => {
  let response = {};
  //console.log(req.body);
  //console.log(req.headers);
  try {
    const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
    const decodedJwtToken = jwt.decode(jwtToken)
    const user = await User.findOne({
      _id: decodedJwtToken.id
    })
    const user1 = await User.findOneAndUpdate(
      { _id: decodedJwtToken.id }, { address:user.address.filter((pic, index) => index !== req.body.id) }, { new: true }
    )
    response.message = 'Successfully delete address data';
    response.status = 200
    response.body = user1.address.toObject();
    return res.status(200).send(response); 
  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error);
  }
}

//modifier le nom et prenom de l'utilisateur
exports.editLastFirstName = async (req, res) => {
  let response = {};
  //console.log(req.headers);
  try {
    const jwtToken = req.headers.authorization.split('Bearer')[1].trim() 
    const decodedJwtToken = jwt.decode(jwtToken)
    const user = await User.findOne({
      _id: decodedJwtToken.id
    })

    const datanew = {
      firstname: req.body.firstname, 
      lastname: req.body.lastname
    }
    const user1 = await User.findOneAndUpdate(
      { _id: decodedJwtToken.id }, { firstname:datanew.firstname, lastname:datanew.lastname }, { new: true }
    )
    if (!user1) {
      throw new Error('User not found!')
    }

    response.message = 'Successfully first and lastName edit';
    response.status = 200
    response.body = user1.toObject();
    return res.status(200).send(response);
  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error)
  }
}

//modifier le mot de passe ou l'email de l'user
exports.editPasswordEmail = async (req, res) => {
  let response = {};
  //console.log(req.body);
  try {
    const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
    const decodedJwtToken = jwt.decode(jwtToken) 
    const user = await User.findOne({
      _id: decodedJwtToken.id
    })
     
    let datanew; 
    let hashkey = Object.prototype.hasOwnProperty.call(req.body, 'email')
    let user1;
    if (hashkey == true) {
       datanew = {
        email: req.body.email
       }
       user1 = await User.findOneAndUpdate(
        { _id: decodedJwtToken.id }, { email:datanew.email }, { new: true }
      )
      response.message = 'Successfully email edit';
    } else {
      datanew = {
        password: bcrypt.hashSync(req.body.password, 8)
      }
      user1 = await User.findOneAndUpdate(
        { _id: decodedJwtToken.id }, { password:datanew.password }, { new: true }
      )
      response.message = 'Successfully password edit';
    }

    if (!user1) {
      throw new Error('User not found!')
    }

    response.status = 200 
    response.body = user1.toObject();
    return res.status(200).send(response);
  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error)
  }
}

// //middleware pour envoyer une email à l'admin du site, depuis la page de contact
// exports.sendEmail = async (req, res) => {
//   try {
//     const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
//     const decodedJwtToken = jwt.decode(jwtToken) 
//     const user = await User.findOne({
//       _id: decodedJwtToken.id
//     })

//     console.log(req.body);

//     let transporter = nodemailer.createTransport({  
//       host: 'smtp.gmail.com',
//       port: 587, // 587 -> TLS & 465 -> SSL
//       auth: {  
//         user: 'adil70hamid@gmail.com', // email de votre votre compte google
//         pass: 'dbjvzkkmurhpotfh' // password de votre compte google
//       }  
//     });

//     transporter.sendMail(TextEmail.TextEmailSendContact(user.email, user.firstname + ' ' + user.lastname), (error, info) => {  
//       if (error) {  
//         console.log(error);  
//       } else {  
//         console.log('Email: ' + info.response);  
//       }  
//     });

//     if (!user) {
//       throw new Error('User not found!')
//     }

//     return res.status(200).send({ message: "Email send successfully!" });

//   } catch (error) {
//     console.error('Error in userService.js', error)
//     throw new Error(error)
//   }
// };



