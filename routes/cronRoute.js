const express = require('express');
const router = express.Router();

router.get('/cron/year', (req, res) => {

    console.log(req)


    res.send('cron generate!')
})

module.exports = router;