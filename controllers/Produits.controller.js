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
            id: decodedJwtToken.id
        }) 

        const product = await Produits.findOne({
            name: req.body.nameProduct
        })
        console.log(product);
        const newOpinion = {
            user: user,
            nameProduct: req.body.nameProduct,
            userName: req.body.userName,
            opinion: req.body.opinion, 
            star: req.body.star
        }
        console.log(product);
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
                purchaseDate: req.body[1].key,
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