let multer = require('multer');
let fs = require('fs');
let path = require('path');
const db = require("../schema");
const User = db.user;
let jwt = require("jsonwebtoken");
 
// var storage = multer.diskStorage({

//     destination: function (req, file, cb) {
  
//       cb(null, '/filepath')
//     },
  
  
//     filename: function (req, file, cb) {
  
//       let filename = 'filenametogive';
//        req.body.file = filename
  
//       cb(null, filename)
//     }
//   })
  
//   exports.upload = multer({ storage: storage })

//modifier l'image de profil de l'utilisateur (j'envoie à la bdd le nom de l'image pour aprés la récuperer )
exports.updateImgProfil = async (req, res) => {
    console.log(req.file);;
    let response = {};

    try {
        const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
        const decodedJwtToken = jwt.decode(jwtToken);

        const newImage= {
            name: req.body.name,
            img: {
                data: req.file.filename,
                contentType: req.file.mimetype
            }
        }
        const user = await User.findOneAndUpdate(
        { _id: decodedJwtToken.id }, { image: newImage }, { new: true }
        )

        if (!user) {
        throw new Error('User not found!');
        }

        response.message = 'Successfully update image data';
        response.status = 200
        response.body = user.image;
        return res.status(200).send(response);
    } catch (error) {
        console.error('Error in userService.js', error)
        throw new Error(error)
    }
  }
