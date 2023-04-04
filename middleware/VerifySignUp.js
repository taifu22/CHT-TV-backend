//ici on verifie si on a des doublons emails lors de l'inscription, et si le role corresponds à l'user

const db = require("../schema/index");
const User = db.user;

verifySignUp = (req, res, next) => {
    User.findOne({
    email: req.body.email
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (user) {
            res.status(400).send({ message: "Failed! Email is already in use!" });
            return;
        }

        next();
    });
}; 

module.exports = verifySignUp; 