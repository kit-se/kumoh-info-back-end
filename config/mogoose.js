var mongoose = require('mongoose');
//.set('debug', true);

module.exports = function() {
    mongoose.Promise = global.Promise;
    var db = mongoose.connect('mongodb://localhost/database', {useMongoClient: true});
    require('../models/Station.js');
    return db;
}