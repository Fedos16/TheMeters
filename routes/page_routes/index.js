const express = require('express');
const router = express.Router();

const models = require('../../models');
const path = require('path');

router.get('/', (req, res) => {
    res.render('main.ejs');
})

module.exports = router;