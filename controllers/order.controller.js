const config = require("../config/Auth.config");
const db = require("../schema");
const User = db.user;
 
let jwt = require("jsonwebtoken");

//ajouter une nouvelle commande dans le profile utilisateur, suite a un achat bien passé
exports.createNewOrder = async (req, res) => {
    let response = {};
    try {
      const jwtToken = req.headers.authorization.split('Bearer')[1].trim()
      const decodedJwtToken = jwt.decode(jwtToken)
      const user = await User.findOne({
        _id: decodedJwtToken.id
      }) 
      
      const user1 = await User.findOneAndUpdate(
        { _id: decodedJwtToken.id }, { orders:[...user.orders, req.body] }, { new: true } 
      )
      if (!user1) {
        throw new Error('User not found!')
      }
      response.message = 'Successfully add orders data';
      response.status = 200
      response.body = user1.orders.toObject();
      return res.status(200).send(response); 
    } catch (error) {
      console.error('Error in userService.js', error)
      throw new Error(error)
    }
}

//supprimer une commande qui a été annulé pendant le checkout stripe
exports.cancelNewOrder = async (req, res) => {
  let response = {};
  try {
    const jwtToken = req.headers.authorization.split('Bearer')[1].trim();
    const decodedJwtToken = jwt.decode(jwtToken)
    const user = await User.findOne({
      _id: decodedJwtToken.id
    })
    user.orders.pop();
    const user1 = await User.findOneAndUpdate(
      { _id: decodedJwtToken.id }, { orders: user.orders }, { new: true }
    )
    response.message = 'Successfully delete order data';
    response.status = 200
    response.body = user1.orders.toObject();
    return res.status(200).send(response); 
  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error);
  }
}