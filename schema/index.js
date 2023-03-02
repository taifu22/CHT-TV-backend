const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./User.schema");
db.product = require("./Products.schema");
db.orders = require("./Order.schema");
db.opinion = require("./Opinion.schema");

module.exports = db;