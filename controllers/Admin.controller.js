const config = require("../config/Auth.config");
const db = require("../schema");
const User = db.user;
const Product = db.product;
const Order = db.orders;
const Opinion = db.opinion;
let fs = require('fs');
  
let jwt = require("jsonwebtoken"); 

//supprimer un produit, en ayant le token et seulement si le role est admin
exports.deleteProduct = async (req, res) => {
    let response = {};
    console.log(req.body);
    console.log(req.headers);
    try {
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
      const decodedJwtToken = jwt.decode(jwtToken)
      const user = await User.findOne({
        _id: decodedJwtToken.id
      })
      if (user.role === 'admin') {
        const product = await Product.findOneAndDelete(
            { id: req.body.id }, { new: true }
        )
        //delete images product 
        if (product['pictures'] !== undefined) {
          product.pictures.map(item => {
            if (item['data'] !== undefined) {
              const filename = item.data  
              const directoryPath = "C:/react projets/project-cht-TV/backend/uploads/imagesUsersProfil/";
              fs.unlink(directoryPath + filename, (error) => {
                  if (error) {
                      console.log('Found error see here: ' + error);
                  }
              })
            }
          })
        }
        response.message = 'Successfully delete product data';
        response.status = 200 
      }
      //response.body = user1.address.toObject();
      return res.status(200).send(response); 
    } catch (error) {
      console.error('Error in userService.js', error)
      throw new Error(error);
    }
}

//controller pour ajouter un nouveau produit dans la bdd avec image description etc....
exports.addNewProduct = async (req, res) => {
  let response = {};

  try {
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
      const decodedJwtToken = jwt.decode(jwtToken);

      const user = await User.findOne({ 
          _id: decodedJwtToken.id
      })
      if (user.role === 'admin') {
        //je récupère tous les produits de cette collection pour donner le numéro d'id suivant au nouoveau product
        const Allproduct = await Product.find();
        const newid = Allproduct.length ? Allproduct[Allproduct.length -1].id + 1 : 1;

          //on créé notre tableau d'images qui sera afiché dans la lightbox page produit details
          let arrayProduct = [];
          req.files.map(item => {
            arrayProduct.push(item)
          })

         //create new objetc with new file image
          const newProduct= {
            id: newid,
            category: req.body.category,
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            opinions: [],
            purchases: [],
            //la premiere image on l'utilisera pour afficher l'image devant le nom du produit dans le panier, la liste des produit dash admin etc...
            picture: {
                data: arrayProduct[0].filename, 
                contentType: arrayProduct[0].mimetype
            },
            //ici on stockera du coup les 4 images qu'on verra dans la lightbox coté page produit details
            pictures : arrayProduct,
            priceReduction: null,
            percentageReduction: null
          }
            

          //ici on sauvegarde dans notre collection le nouveau produit avec id unique
          const product = new Product(newProduct)
          product.save((err, user) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            console.log(product);
            response.message = 'Successfully add new product';
            response.status = 200
            response.body = product.toObject();
            return res.status(200).send(response);
          });
      }
     
      if (!user) {
      throw new Error('User not found!');
      }

  } catch (error) {
      console.error('Error in userService.js', error)
      throw new Error(error)
  }
}

//modifier un produit
exports.updateProduct = async (req, res) => {
  let response = {};
  console.log(req.body);
  try {
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
      const decodedJwtToken = jwt.decode(jwtToken);

      const user = await User.findOne({
          _id: decodedJwtToken.id
      })

      if (user.role === 'admin') {
        const product = await Product.findOne(
          { id: req.body.id }
        )
        //création du tableau avec les images
        let arrayProduct = [];
        if (req.files !== undefined && req.files.length) {
          req.files.map(item => {
            arrayProduct.push(item)
          })
        }
        
        //console.log(arrayProduct);
        //delete images product from /uploads/imagesUserProfil for store new images
        if (product['pictures'] !== undefined) {
          product.pictures.map(item => {
            if (item['filename'] !== undefined) {
              const filename = item.filename  
              const directoryPath = "C:/react projets/project-cht-TV/backend/uploads/imagesUsersProfil/";
              fs.unlink(directoryPath + filename, (error) => {
                  if (error) {
                      console.log('Found error see here: ' + error);
                  }
              })
            }
          })
        }
        //create new objetc with new file image
        const UpdateProduct= {
          id: req.body.id,
          category: req.body.category,
          name: req.body.name,
          price: req.body.price,
          description: req.body.description,
          opinions: product.opinions,
          purchases: product.purchases,
          //la premiere image on l'utilisera pour afficher l'image devant le nom du produit dans le panier, la liste des produit dash admin etc...
          //si la req.files est vide on rècupère les images deja existantes
          picture: product.picture,
          //ici on stockera du coup les 4 images qu'on verra dans la lightbox coté page produit details 
          //(si pas de modification d'images on rècupére les images qu'on avait déja)
          pictures: product.pictures,
          priceReduction: req.body.priceReduction ? req.body.priceReduction : null,
          percentageReduction: req.body.percentageReduction ? req.body.percentageReduction : null
        }

        //si on a un ou plusieurs fichier image on modifie le picture (image par defaut principale), et la liste des images du produit (pictures)
        if (arrayProduct.length) {
          UpdateProduct.picture = {
            data: arrayProduct[0].filename, 
            contentType: arrayProduct[0].mimetype
          }
          UpdateProduct.pictures = arrayProduct
        }

        //ici on sauvegarde dans notre collection le nouveau produit avec id unique
        const productUpdate = await product.updateOne(UpdateProduct)
        const product1 = await Product.findOne(
          { id: req.body.id }
        )
  
          if (!productUpdate) {
          throw new Error('product not found!');
          }
  
          response.message = 'Successfully update image data';
          response.status = 200
          response.body = product1.toObject();
          return res.status(200).send(response) 
      }

  } catch (error) {
      console.error('Error in userService.js', error)
      throw new Error(error)
  }
}

//controller pour envoyer vers la bdd une commande passé par un utilisateur
exports.addNewOrder = async (req, res) => {
  let response = {};

  try {
      //on verifie bien sur le token de l'user
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
      const decodedJwtToken = jwt.decode(jwtToken);

      const user = await User.findOne({
          _id: decodedJwtToken.id
      })

      //create new objetc with new user's order
      const newOrder= {
        product: req.body.product,
        total: req.body.total,
        delivery: req.body.delivery,
        orderNumber: req.body.orderNumber, 
        userEmail: req.body.email,
        promo: req.body.promo
      }
      //ici on sauvegarde dans notre collection le nouveau produit avec id unique
      const order = new Order(newOrder)
      order.save((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        console.log(order);
        response.message = 'Successfully add new user\'s order';
        response.status = 200
        response.body = order.toObject();
        return res.status(200).send(response);
      });

      if (!user) {
      throw new Error('User not found!');
      }

  } catch (error) {
      console.error('Error in userService.js', error)
      throw new Error(error)
  }
}

//controller pour afficher (récuperer depuis la bdd) la liste de toutes les commandes passée sur le site (donc par tous les utilisqteurs)
exports.getOrdersAdmin = async (req, res) => {
  try {
      //on verifie bien sur le token de l'user
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
      const decodedJwtToken = jwt.decode(jwtToken);

      const user = await User.findOne({
          _id: decodedJwtToken.id
      })
      if (user.role === "admin") {
        const orders = await Order.find();
        res.status(200).json({
            status: 'success',
            data: orders
        })
      }
      if (!user) {
        throw new Error('User not found!');
      }
  } catch (error) {
      console.log(error);
  }
}

//controller pour envoyer vers la bdd coté dashboard Admin un avis envoyé par un utilisateur
exports.addNewOpinion = async (req, res) => {
  let response = {};

  try {
      //on verifie bien sur le token de l'user
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
      const decodedJwtToken = jwt.decode(jwtToken);

      const user = await User.findOne({
          _id: decodedJwtToken.id
      })

      //create new objetc with new user's opinions
      const newOpinion= {
        id: req.body.id,
        user: user.email,
        nameProduct: req.body.nameProduct,
        userName: req.body.userName,
        opinion: req.body.opinion,
        star: req.body.star,
        date: req.body.date,
      }
      //ici on sauvegarde dans notre collection le nouveau avis
      const opinion = new Opinion(newOpinion)
      
      opinion.save((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        response.message = 'Successfully add new user\'s order';
        response.status = 200
        response.body = opinion.toObject();
        return res.status(200).send(response);
      });

      if (!user) {
      throw new Error('User not found!');
      }

  } catch (error) {
      console.error('Error in userService.js', error)
      throw new Error(error)
  }
}

//controller pour afficher (récuperer depuis la bdd) la liste de tous les avis envoyés depuis le site (donc par tous les utilisqteurs)
exports.getOpinionsAdmin = async (req, res) => {
  try {
      //on verifie bien sur le token de l'user
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
      const decodedJwtToken = jwt.decode(jwtToken);

      const user = await User.findOne({
          _id: decodedJwtToken.id
      })
      if (user.role === "admin") {
        const opinions = await Opinion.find();
        res.status(200).json({
            status: 'success',
            data: opinions
        })
      }
      if (!user) {
        throw new Error('User not found!');
      }
  } catch (error) {
      console.log(error);
  } 
}

//ajouter une nouvelle signalisation au tableau des report, concernant un avis utilisateur à signaler
//c'est l'utilisateur qui envoie cet signalation q'on affichera dans la dashboard admin
//pui l'user ne pourra plus resignaler (button désactivé)
exports.createNewReportOpinion = async (req, res) => {
  let response = {};
  try {
    const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
    const decodedJwtToken = jwt.decode(jwtToken)
    const user = await User.findOne({
      _id: decodedJwtToken.id
    })
    const opinion = await Opinion.findOne({
      id: req.body.id
    })

    console.log(req.body);
    
    const opinionCreate = {
      userSendReport: user.email,
      date: req.body.date,
      idOpinion: req.body.id,
      reportSeen: false
    }
    const newOpinion = await Opinion.findOneAndUpdate(
      { id: req.body.id }, { report:[...opinion.report, opinionCreate] }, { new: true }
    )
    const newUserOpinionWithReport = await User.findOneAndUpdate(
      {_id: decodedJwtToken.id}, { opinionsWithReport:[...user.opinionsWithReport, opinionCreate] }, { new: true }
    )
    if (!user) {
      throw new Error('User not found!');
    }
    
    response.message = 'Successfully add report opinion data';
    response.status = 200
    response.body = opinionCreate;
    return res.status(200).send(response);
  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error)
  }
}

//l'admin a la possibilité de valider quand meme un avis qui a été signalé par un user
//donc ici on supprime la signalation de l'opinion dans la collection opinion, et du tableau report de la fiche de l'user (lire commentaire en bas)
exports.deleteReportOpinion = async (req, res) => {
  let response = {};
  try {
    const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
    const decodedJwtToken = jwt.decode(jwtToken)
    const admin = await User.findOne({
      _id: decodedJwtToken.id
    })
    const user = await User.findOne({ 
      email: req.body.email
    })
    const opinion = await Opinion.findOne({
      id: req.body.id
    })

    console.log(req.body);
    
    if (admin.role === "admin") {
      const newOpinion = await Opinion.findOneAndUpdate(
        { id: req.body.id }, { report: [] }, { new: true }
      )
      //ici j'avais pensé a supprimer aussi la signalation coté user qui a signalé, mais aprés je me suis rendu compte
      //qu'il pouvais à nouveau signalé, donc si c'est une opinion que l'admin a validé quand meme, on ne donnera
      //pas la main au meme user pour signaler à nouveau
      // const newUserOpinionWithReport = await User.findOneAndUpdate(
      //   {email: req.body.email}, { opinionsWithReport:user.opinionsWithReport.filter((pic) => pic.id !== req.body.id) }, { new: true }
      // )
    }

    if (!user) {
      throw new Error('User not found!');
    }
    
    response.message = 'Successfully delete report opinion data';
    response.status = 200
    return res.status(200).send(response);
  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error)
  }
}

//supprimer une opinion, en ayant le token et seulement si le role est admin
//on supprime l'opinion depuis la collection principale, puis l'opinion depuis le tableau de l'user qui la laissé
//et en fin l'opinion depuis le produit qui a recu l'opinion
exports.deleteOpinion = async (req, res) => {
  let response = {};
  console.log(req.body);
  try {

    const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
    const decodedJwtToken = jwt.decode(jwtToken)
    const admin = await User.findOne({
      _id: decodedJwtToken.id
    })
    const product = await Product.findOne({
        name: req.body.nameProduct
    })
    const user = await User.findOne({
        email: req.body.email
    })

    if (admin.role === 'admin') {
      const opinion = await Opinion.findOneAndDelete(
          { id: req.body.id }, { new: true }
      )
      const opinionOnProduct = await Product.findOneAndUpdate(
          { name: req.body.nameProduct }, { opinions: product.opinions.filter(pic => pic.id !== req.body.id) }, { new: true }
      )
      const opinionOnUser = await User.findOneAndUpdate(
          { email: req.body.email }, { opinions: user.opinions.filter(pic => pic.id !== req.body.id) }, { new: true }
      )
      response.message = 'Successfully delete opinion data';
      response.status = 200 
    }

    //response.body = user1.address.toObject();
    return res.status(200).send(response); 
  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error);
  }
}