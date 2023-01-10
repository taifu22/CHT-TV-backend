/*ici dans ce middleware on va mettre en place la validatyion des datas pour voir coté back-end si l'utilisateur
rentre les bonnes datas pour l'inscription et le login
Coté front-end on utilse le hook react-form pour cela, mais vaut mieux mettre en place aussi coté back-end 
car l'utilisateur pourrait utiliser des logiciels de type postman*/
const { validationResult } = require('express-validator');

DataIsValid = (req, res, next) => {
    
    const error = validationResult(req).formatWith(({ msg }) => msg);
    const hasError = !error.isEmpty();

    if (hasError) {
      res.status(422).json({ error: error.array() });
    } else {
      next();
    }
}

module.exports = DataIsValid;