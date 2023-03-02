//voici les regex du composant express-validator, pour la route /signup
const { check } = require('express-validator');

module.exports = 
    [
        check("firstname") 
          .isLength({ min: 2 }) 
          .withMessage("the name must have minimum length of 2")
          .trim(),
         
        check("lastname") 
          .isLength({ min: 2 })
          .withMessage("the name must have minimum length of 2")
          .trim(),  
    
        check("email")
          .isEmail()
          .withMessage("invalid email address")
          .normalizeEmail(),
    
        check("password")
          .isLength({ min: 8, max: 15 })
          .withMessage("your password should have min and max length between 8-15")
          .matches(/\d/)
          .withMessage("your password should have at least one number")
          //.matches(/[!@#$%^&*(),.?":{}|<>]/)
          //.withMessage("your password should have at least one sepcial character")
    ]
