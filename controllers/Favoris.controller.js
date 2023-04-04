const config = require("../config/Auth.config");
const db = require("../schema");
const User = db.user;
let jwt = require("jsonwebtoken");

//ajouter un nouveau favori au tableau des produits favoris du client
exports.createNewFavorite = async (req, res) => {
    let response = {};
    console.log(req.body);
    try {
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
      const decodedJwtToken = jwt.decode(jwtToken)
      const user = await User.findOne({
        _id: decodedJwtToken.id
      })
      //on créé notre favoris dans le array favoris du document user, à savoir que l'id c'est celui du produit rattaché
      const favoriteCreate = {
        id: req.body.id,
      }
      const user1 = await User.findOneAndUpdate(
        { _id: decodedJwtToken.id }, { favoris:[...user.favoris, favoriteCreate] }, { new: true }
      )
      if (!user1) {
        throw new Error('User not found!')
      }
      //console.log(user1);
      response.message = 'Successfully add favorite data';
      response.status = 200
      response.body = user1.favoris.toObject();
      return res.status(200).send(response);
    } catch (error) {
      console.error('Error in userService.js', error)
      throw new Error(error)
    } 
  }
  
  //supprimer une favori de la list (sous tableau) 
  exports.deleteFavorite = async (req, res) => {
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
        { _id: decodedJwtToken.id }, { favoris:user.favoris.filter((pic) => pic.id !== req.body.id) }, { new: true }
      )
      response.message = 'Successfully delete favoris data';
      response.status = 200
      response.body = user1.favoris.toObject();
      return res.status(200).send(response); 
    } catch (error) {
      console.error('Error in userService.js', error)
      throw new Error(error);
    }
  }