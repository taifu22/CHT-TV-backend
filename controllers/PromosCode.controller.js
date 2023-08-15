const db = require("../schema");
let fs = require('fs');
const PromosCode = db.promosCode;
const User = db.user;
let jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const stripe = require('stripe')(process.env.SECRET_KEY_STRIPE_TEST);


//controller pour récuperer la liste des categories
exports.getPromosCode = async (req, res) => {
    try {
        const promosCode = await PromosCode.find();
        res.status(200).json({
            status: 'success',
            data: promosCode
        })

    } catch (error) {
        console.log(error); 
    }
}

//controller pour créer une nouvelle categorie, pour les produits coté dashboard admin
exports.createNewPromosCode = async (req, res) => {
    let response = {};
    console.log(req.body);
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
        //on verifie si l'user est bien l'admin pour qu'il puisse ajouter une nouvelle categorie
        if (user.role === 'admin') {
            //on créé notre nouvelle category
            const newpromosCode = {
                code: req.body.code,
                price: req.body.price,
                description: req.body.description
            }
            //on ajoute la nouvelle categorie dans la collection Categorys
            const promosCode = new PromosCode(newpromosCode)
            promosCode.save((err, user) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                console.log(promosCode);
                response.message = 'Successfully add new promosCode';
                response.status = 200
                response.body = promosCode.toObject();
                return res.status(200).send(response);
            });
            //on créé le coupon dans la dashBoard de Stripe
            const coupon = await stripe.coupons.create({
                name: req.body.code,
                amount_off: req.body.price * 100,
                currency: 'eur',
                duration: 'once', // Durée d'utilisation du coupon (une fois)
            });
          
            res.json(coupon);
        }

    } catch (error) {
        console.error('Error in userService.js', error)
        throw new Error(error)
    }
}

//supprimer un produit, en ayant le token et seulement si le role est admin
exports.deletePromosCode = async (req, res) => {
    let response = {};
    try {
        const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
        const decodedJwtToken = jwt.decode(jwtToken)
        const user = await User.findOne({
            _id: decodedJwtToken.id
        })

        if (user.role === 'admin') {
            //récupèration du code promo depuis la bdd
            const promosCode = await PromosCode.findOne(
                { _id: req.body.id }
            )
            //suppression code promo depuis la bdd
            const promosCode1 = await PromosCode.findOneAndDelete(
                { _id: req.body.id }, { new: true }
            )

            //suppression du code promo depuis la dashboard Stripe
            // Récupération de tous les coupons
            const coupons = await stripe.coupons.list();
            // Recherche du coupon par son nom
            const coupon = coupons.data.find(c => c.name === req.body.name);
            if (!coupon) {
            throw new Error('Coupon not found');
            }
            //suppression du code promo depuis la dash Stripe
            const deletedCoupon = await stripe.coupons.del(coupon.id); 
            //réponse de la suppression 
            res.json(deletedCoupon);

            response.message = 'Successfully delete promosCode data'; 
            response.status = 200 
        }
        return res.status(200).send(response); 
    } catch (error) {
        console.error('Error in userService.js', error)
        throw new Error(error);
    }
}