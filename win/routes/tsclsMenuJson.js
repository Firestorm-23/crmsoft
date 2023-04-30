
const express = require('express');
const router = express.Router();
const fs = require('fs');

// const GenConstant = require('../tsclsGenConstants');
var { ErrorObj } = require('../local/tsclsGenUtils');

router.get('/', (req, p_res) => {
    try {

        fs.readFile(__dirname + '/../local/menu.json', 'utf8', (p_error, p_fileData) => {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            p_res.send(p_fileData);
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

module.exports = router;