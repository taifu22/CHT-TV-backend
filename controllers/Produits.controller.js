const Produits = require('../schema/Products.schema');
const db = require("../schema");
const User = db.user;
 
let jwt = require("jsonwebtoken");

//function pour récuperer tous les produits, on la mets dans la route get /routes/Produits
exports.getProduits = async (req, res) => {
    try {
        const produits = await Produits.find();
        res.status(200).json({
            status: 'success',
            data: produits
        })
    } catch (error) {
        console.log(error);
    }
}

//function pour stocker les avis des utilisateurs
exports.setOpinionProduit = async (req, res) => {
    let response = {};
    try {
        const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
        const decodedJwtToken = jwt.decode(jwtToken)
        //console.log(decodedJwtToken);
        const user = await User.findOne({
            _id: decodedJwtToken.id
        }) 
        console.log(user);
        const product = await Produits.findOne({
            name: req.body.nameProduct 
        })

        const newOpinion = {
            id: req.body.id,
            user: user.email,
            nameProduct: req.body.nameProduct,
            userName: req.body.userName,
            opinion: req.body.opinion, 
            star: req.body.star,
            date: req.body.date,
            report: []
        }

        const productWithOpinion = await Produits.findOneAndUpdate(
            { name: req.body.nameProduct }, { opinions:[...product.opinions, newOpinion] }, { new: true }
        )
        const userWithOpinion = await User.findOneAndUpdate(
            { _id: decodedJwtToken.id }, { opinions:[...user.opinions, newOpinion] }, { new: true }
        )
        if (!userWithOpinion) {
            throw new Error('User not found!')
        }
        if (!productWithOpinion) {
            throw new Error('Product not found')
        }

        response.message = 'Successfully add opinion data';
        response.status = 200
        response.body = product.opinions.toObject();
        return res.status(200).send(response); 
    } catch (error) {
        console.error('Error in Produits.controller.js', error)
        throw new Error(error)
    }
}

//middleware pour ajouter la date d'achat d'un produit
//en gros chaque produit a un tableau purchases, où l'on stocke les dates d'achat pour avoir le nombre d'achat de ce produit-là
exports.setPurchaseProduct = async (req, res) => {
    let response = {};
    try {
        //en gros je recoit le tableau de stripe avec dans le premier index la liste des produits acheté.
        //donc on fait un map du premier index pour récuperer tous les produits acheté si effectivement il y en a 
        //plusieurs dans une seul commande
        await req.body[0].map(async (item) => {
            const product = await Produits.findOne({
                name: item.price_data.product_data.name
            })
            
            const newPurchase = {
                //dans le deuxieme index on a la date d'achat qu'on stockera dans le tableau purchase de chaque produit de la commande
                purchaseDate: req.body[req.body.length -1].key,
                quantity: item.quantity
            }
            const productWithPurchase = await Produits.findOneAndUpdate(
                { name: item.price_data.product_data.name }, { purchases:[...product.purchases, newPurchase] }, { new: true }
            )

            if (!productWithPurchase) {
               throw new Error(item.price_data.product_data.name + ' Product not found');
            }
        })
        response.message = 'Successfully add purchase data';
        response.status = 200
        response.body = product.purchases.toObject();
        return res.status(200).send(response);
    } catch (error) {
        console.log(error);
    }
}

//si la commande est annulé avant de payer (voir stripe), on supprimera bien sur la date d'achat depuis la fiche du produit
//on a la meme chose dans le fichier order.controller.js

exports.cancelNewpurchase = async (req, res) => {
    let response = {};
    try {
        await req.body[0].map(async (item) => {
            const product = await Produits.findOne({
                name: item.price_data.product_data.name
            })
            product.purchases.pop();
            const productWithPurchase = await Produits.findOneAndUpdate(
                { name: item.price_data.product_data.name }, { purchases: product.purchases }, { new: true }
            )
            if (!productWithPurchase) {
               throw new Error(item.price_data.product_data.name + ' Product not found');
            }
        })
        response.message = 'Successfully add purchase data';
        response.status = 200
        response.body = product.purchases.toObject();
        return res.status(200).send(response);
    } catch (error) {
        console.log(error);
    }
  }

  /*on créé un controller pour rendre à null le pricereduction et percentagereduction si l'on choisit dans la dash admin de modifier 
  entierement le prix du produit sans passer par reduction*/
  exports.deletePricePercentageReduction = async (req, res) => {
    let response = {};
    console.log(req.body);
    try {
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
      const decodedJwtToken = jwt.decode(jwtToken)
      const admin = await User.findOne({
        _id: decodedJwtToken.id
      })

      const product = await Produits.findOne({
        id: req.body.id
      })
      
      if (admin.role === "admin") {
        const newProduit = await Produits.findOneAndUpdate(
          { id: req.body.id }, { priceReduction: null }, { new: true }
        )
        const newProduit1 = await Produits.findOneAndUpdate(
            { id: req.body.id }, { percentageReduction: null }, { new: true }
          )
      }
  
      if (!admin) {
        throw new Error('User not found!');
      }
      
      response.message = 'Successfully null price and percentage reduction';
      response.status = 200
      return res.status(200).send(response);
    } catch (error) {
      console.error('Error in userService.js', error)
      throw new Error(error)
    }
  }