const db = require("../schema");
let fs = require('fs');
const Categorys = db.categorys;
const User = db.user;
let jwt = require("jsonwebtoken");


//controller pour récuperer la liste des categories
exports.getCategories = async (req, res) => {
    try {
        const categorys = await Categorys.find();
        res.status(200).json({
            status: 'success',
            data: categorys
        })

    } catch (error) {
        console.log(error);
    }
}

//controller pour créer une nouvelle categorie, pour les produits coté dashboard admin
exports.createNewCategory = async (req, res) => {
    let response = {};
    console.log(req.file);
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
            const newCategory = {
                name: req.body.name,
                image: req.file.filename
            }
            //on ajoute la nouvelle categorie dans la collection Categorys
            const product = new Categorys(newCategory)
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

    } catch (error) {
        console.error('Error in userService.js', error)
        throw new Error(error)
    }
}

//supprimer un produit, en ayant le token et seulement si le role est admin
exports.deleteCategory = async (req, res) => {
    let response = {};
    try {
        const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
        const decodedJwtToken = jwt.decode(jwtToken)
        const user = await User.findOne({
            _id: decodedJwtToken.id
        })

        if (user.role === 'admin') {
            const category = await Categorys.findOne(
                { _id: req.body.id }
            )
            //delete image (icon) of category 
            if (category['image'] !== undefined) {
                const filename = category.image  
                const directoryPath = "C:/react projets/project-cht-TV/backend/uploads/imagesUsersProfil/";
                fs.unlink(directoryPath + filename, (error) => {
                    if (error) {
                        console.log('Found error see here: ' + error);
                    }
                })
            }
            console.log(category);
            const category1 = await Categorys.findOneAndDelete(
                { _id: req.body.id }, { new: true }
            )
            response.message = 'Successfully delete category data';
            response.status = 200 
        }
        return res.status(200).send(response); 
    } catch (error) {
        console.error('Error in userService.js', error)
        throw new Error(error);
    }
}