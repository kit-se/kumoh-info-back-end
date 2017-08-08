var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StationSchema = new Schema({
    STOP_ID: Number,
    STOP_SERVICEID: Number,
    STOP_KNAME: String,
    STOP_SHORTNAME: String,
    LOCATION: { type: [Number], index: '2dsphere' }
});

mongoose.model('Station', StationSchema);