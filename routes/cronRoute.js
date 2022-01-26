const express = require('express');
const router = express.Router();

router.get('/cron/year', (req, res) => {
    res.send('cron generate!')
})

module.exports = router;