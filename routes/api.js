/**
 * Created by dongs on 2017. 7. 13..
 */
const express = require('express');
const router = express.Router();
const apiController = require("../controllers/api");
//const mongoose = require('mongoose');
//var Station = require('../models/Station');


/* GET home page. */
//router.get('/stations', apiController.readAll);
//router.get('/station/:service_id', apiController.read);
router.get('/businfo/:pos', apiController.businfo);
router.get('/sikdang/:pos', apiController.sikdanginfo);
module.exports = router;
