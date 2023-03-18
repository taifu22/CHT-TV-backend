const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    id: {
        type: String
    },
    user: {
        type: String
    },
    object: {
        type: String
    },
    date: {
        type: String
    },
    messages: {
        type: Array
    },
    newMessage: {
        type: Boolean
    }
})

const Messages = mongoose.model('messages', messageSchema);

module.exports = Messages