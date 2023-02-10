const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname :{
        type: String,
        required: true
    },
    lastname :{
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true, 
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: Array
    },
    orders: {
        type: Array
    },
    image: {
        type: Object
    },
    favoris : {
        type : Array
    },
    opinions : {
        type: Array 
    }
},
{
    timestamps: true,
    toObject: {
      transform: (doc, ret, options) => {
        ret.id = ret._id
        delete ret._id
        delete ret.password 
        delete ret.__v
        return ret
      }
    }
  }
)

const User = mongoose.model('user', userSchema);

module.exports = User