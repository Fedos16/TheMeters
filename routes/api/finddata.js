const express = require('express');
const router = express.Router();
const config = require('../../config');
const models = require('../../models');


router.post('/getAddresses', async (req, res) => {
    try {

        const val = req.body.address;

        let str_search = `.*${val.split(' ').join('.*')}.*`;

        let arr = await models.DataBase.find({ address: { $regex: str_search, $options: 'si' } }, { address: 1 }).limit(5);

        res.json({ ok: true, arr });

    } catch (e) {
        console.log(e);
        res.json({ ok: false, text: 'Сервер временно недоступен' });
    }
});
router.post('/getFullInfo', async (req, res) => {
    try {

        const _id = req.body._id;
        const text = req.body.text;

        let object;
        if (_id) {
            object = await models.DataBase.findOne({ _id });
        } else if (text) {
            object = await models.DataBase.findOne({ address: { $regex: text, $options: 'i' } })
        } else {
            res.json({ ok: false, text: 'Неизвестные параметры поиска' });
            return;
        }

        res.json({ ok: true, object });

    } catch (e) {
        console.log(e);
        res.json({ ok: false, text: 'Сервер временно недоступен' });
    }
});

module.exports = router;