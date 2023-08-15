const db = require("../schema");
let fs = require('fs');
const Cart = db.cart;
const User = db.user;
let jwt = require("jsonwebtoken");


//controller pour récuperer la liste des produits dans le panier
exports.getProductsCart = async (req, res) => {
    try {
        //on verifie comme toujours en premier le token de l'user pour verifier aprés qu'il s'agit bien de lui
        const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
        const decodedJwtToken = jwt.decode(jwtToken)
        const user = await User.findOne({
            _id: decodedJwtToken.id
        }) 
        //on verifie si l'user existe dans la bdd
        if (!user) {
            throw new Error('User not found!')
        }
        //on récupère ses produits du panier
        const userCart = await Cart.findOne({
            userId: decodedJwtToken.id
        })
        res.status(200).json({
            status: 'success',
            data: userCart.products
        })

    } catch (error) {
        console.log(error); 
    }
}

//controller pour ajouter un produit ou plusieurs au panier savegardé en bdd
exports.addProductsCart = async (req, res) => {
    try { 
        //on verifie comme toujours en premier le token de l'user pour verifier aprés qu'il s'agit bien de l'admin
        const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
        const decodedJwtToken = jwt.decode(jwtToken)
        const user = await User.findOne({
            _id: decodedJwtToken.id
        }) 
        //on verifie si l'user existe dans la bdd
        if (!user) {
            throw new Error('User not found!')
        }
        //on récupère le panier de l'user en question   
        const userCart = await Cart.findOne({
            userId: decodedJwtToken.id
        })

        let productsFiltered;
        console.log(req.body); 
        /*quand le user est déconnecté, la req.body, c'est toujours un array avec des ou un produit/s à l'intérieur, ici on filtre,
        et les products, qui sont déja dans le panier du client coté bdd, ne seront pas rajouté en doublon*/
        //Donc ca c'est pour eviter les doublons
        /*Par contre quand l'user est connecté la req.body, c'est juste un objet, donc pas array, qu'on rajoute en bdd, sans passer par 
        cette condition*/ 
        if (userCart.products.length && Array.isArray(req.body)) {
            productsFiltered = req.body.map(item => {
              if (!userCart.products.some(item1 => item.id === item1.id)) {
                if (item !== null) {
                    return item
                } 
              }
            }).filter(item => item !== undefined); //avec ce filtre on supprime les éléments undefined
        } 
  
        //console.log(productsFiltered);    
    
        /*ici soit 1- on ajoute plusieurs produits au panier (le user est déconnecté et il a ajouté plusieurs produits avant de se connecter
        une fois connecté ce tableau de produits sera ajouté à la colections carts de cet user) 2- soit il y a un seul produit sous forme
        d'objet à ajouter au panier (user connecté)*/
        /*bien sur si productsFiltered existe (user déconnecté) on l'utilise, sinon si la liste des products dans le panier était vide, on
        utilise la req.body (on aura pas filtré, car la liste étais vide)*/
        const productsToAdd = Array.isArray((productsFiltered ? productsFiltered : req.body)) ? (productsFiltered ? productsFiltered : req.body) : [(productsFiltered ? productsFiltered : req.body)];  // Vérifier si req.body est un tableau, sinon le convertir en un tableau contenant un seul élément

        userCart.products.push(...productsToAdd); // Ajouter les produits du panier de l'utilisateur déconnecté au panier de l'utilisateur connecté

        await userCart.save(); // Enregistrer les modifications dans la base de données 
        res.status(200).json({
            status: 'success add product in cartUser', 
            data: userCart 
        })

    } catch (error) {
        console.log(error);
    }
}

//controller pour supprimer un produit du panier savegardé en bdd
exports.deleteProductsCart = async (req, res) => {
    try {
        //on verifie comme toujours en premier le token de l'user pour verifier aprés qu'il s'agit bien de l'admin
        const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
        const decodedJwtToken = jwt.decode(jwtToken)
        const user = await User.findOne({
            _id: decodedJwtToken.id
        }) 
        //on verifie si l'user existe dans la bdd
        if (!user) {
            throw new Error('User not found!')
        }
        //on récupère le panier de l'user en question
        const userCart = await Cart.findOne({
            userId: decodedJwtToken.id
        })
        //on supprime le produit de son panier
        const cart = await Cart.findOneAndUpdate(
            { userId: decodedJwtToken.id }, { products:userCart.products.filter((pic, index) => pic.id !== req.body.id) }, { new: true }
        )
        res.status(200).json({
            status: 'success delete product of cartuser',
            data: cart
        })

    } catch (error) {
        console.log(error); 
    }
}

//si un achat a été finalisé, on vide la totalité du panier de l'utilisateur
exports.deleteAllProductsCart = async (req, res) => {
    try {
        //on verifie comme toujours en premier le token de l'user pour verifier aprés qu'il s'agit bien de l'admin
        const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
        const decodedJwtToken = jwt.decode(jwtToken)
        const user = await User.findOne({
            _id: decodedJwtToken.id
        }) 
        //on verifie si l'user existe dans la bdd
        if (!user) {
            throw new Error('User not found!')
        }
        //on vide le array products, qui contients tous les produits du panier
        const cart = await Cart.findOneAndUpdate(
            { userId: decodedJwtToken.id }, { products:[] }, { new: true }
        )
        res.status(200).json({
            status: 'success delete all data product of user\'s cart',
            data: cart
        })

    } catch (error) {
        console.log(error);
    }
}

//on modifie la quantité d'un produit de notre panier
exports.updateQuantityProductCart = async (req, res) => {
    try {
        //on verifie comme toujours en premier le token de l'user pour verifier aprés qu'il s'agit bien de l'admin
        const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
        const decodedJwtToken = jwt.decode(jwtToken)
        const user = await User.findOne({
            _id: decodedJwtToken.id
        }) 
        //on verifie si l'user existe dans la bdd
        if (!user) {
            throw new Error('User not found!')
        }
        //on récupère le cart qui nous intéresse par rapport à l'id de l'user depuis la collection cart
        const userCart = await Cart.findOne({
            userId: decodedJwtToken.id
        })
        //maintenant on modifie la quantité du produit qui nous intéresse
        const productsUpdate = userCart.products.map(item => {
            if (item.id === req.body.id) { 
                return { ...item, quantity: req.body.quantity} 
            }
            return item
        })
        //on sauvegarde le tout dans notre bdd
        const userCart1 = await Cart.findOneAndUpdate(
            { userId: decodedJwtToken.id }, { products:productsUpdate }, { new: true }
        )

        res.status(200).json({
            status: 'success update data quantity product of user\'s cart',
            data: userCart1
        })

    } catch (error) {
        console.log(error);
    }
}