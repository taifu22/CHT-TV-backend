const PORT = 4000;
const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const produitsRouter = require('./routes/Produits.route');
const authRouter = require('./routes/Auth.route');
const StripeRouter = require('./routes/Stripe.route');
const OrderRouter = require('./routes/Order.route');
const ImageRouter = require('./routes/image.route');
const FavRouter = require('./routes/Favoris.route');
const db = require("./schema/index");
const AdminRouter = require('./routes/Admin.route');
const Role = db.role;

/*body-parser pour tranformer ce qu'il y a dans le body des requetes sous formed'objet js*/
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
//const bodyParser = bodyparser.json();

//cors pour accepter les requetes à partir ,de toutes origins
app.use(cors());

//connexion à notre server 
app.listen(PORT, () => {
    console.log('server up and running on http://localhost:'+ PORT);
});

//configuration du dotenv pour acceder au fichier avec les variables d'environnement
dotenv.config({path: './config.env'});
//avec cette contante DB on récupère la variable d'environnement process.env.DATABASE
const DB = process.env.DATABASE

//route public accessible pour les utilisateur, pour stocker et recuperer les images de profile
app.use('/uploads/imagesUsersProfil', express.static(path.join(__dirname, 'uploads/imagesUsersProfil')))

//connexio à notre bdd mongo, et on ajoute avec initial, le document admin et user a la collection role
mongoose.connect(DB, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(conn => {
        console.log('connect to database...');
    }).catch(er => {
        console.log("Connection error", er);
        process.exit();
    })

//produits Router pour get et post les produits
app.use('/api/produits', produitsRouter);

//auth router pour inscription/login du coup authentifier l'user 
app.use('/api/auth', authRouter);

//stripe for checkout user's paiements
app.use('/api', StripeRouter);

//middleware for store user's orders in bdd
app.use('/api', OrderRouter)

//middleware for store user's profil's image
app.use('/api', ImageRouter);

//middleware for store user's favorites products
app.use('/api/auth', FavRouter);

//middleware for access to dashboard admin 
app.use('/api/admin', AdminRouter);

module.exports = app;




