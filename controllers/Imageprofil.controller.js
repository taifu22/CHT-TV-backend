let fs = require('fs');
const db = require("../schema");
const User = db.user;
let jwt = require("jsonwebtoken");  

//modifier l'image de profil de l'utilisateur (j'envoie à la bdd le nom de l'image pour aprés la récuperer )
exports.updateImgProfil = async (req, res) => {
    console.log(req.file);;
    let response = {};

    try {
        const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
        const decodedJwtToken = jwt.decode(jwtToken);

        const user1 = await User.findOne({
            _id: decodedJwtToken.id
        })
        //delete image profil if already exist, for replace with the new image of profil
        if (user1['image'] !== undefined) { 
            if (user1.image['img'] !== undefined) {
                console.log(user1.image.img.data);
                const filename = user1.image.img.data  
                const directoryPath = "C:/react projets/project-cht-TV/backend/uploads/imagesUsersProfil/";
                fs.unlink(directoryPath + filename, (error) => {
                    if (error) {
                        console.log('Found error see here: ' + error);
                    }
                })
            } 
        }
        //create new objetc with new file image
        const newImage= {
            name: req.body.name,
            img: {
                data: req.file.filename, 
                contentType: req.file.mimetype
            }
        }
        //find user with id and update profil's image
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
