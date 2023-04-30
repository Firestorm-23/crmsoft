const express = require('express');
const router = express.Router();

const FDb = require('../tsclsDatabase');

/**
 * /project command supports only GET and PUT command
 */

var GenConstant = require('../tsclsGenConstants');
var { ErrorObj, isEmpty } = require('../local/tsclsGenUtils');

router.get('/', async (p_req, p_res) => {

    try {

        var LProjectId = p_req.headers.projectid;

        if (isEmpty(LProjectId) === true) {

            return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
        }//if..

        var sql = `SELECT * FROM projects WHERE id=${LProjectId}`;

        FDb.all(sql, [], (p_error, rows) => {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            p_res.json(rows[0]);
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

router.put('/:id', async (p_req, p_res) => {

    try {

        var LProjectId = p_req.headers.projectid;

        if (isEmpty(LProjectId) === true) {

            return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
        }

        // p_res.json(p_req.body);
        var LReq = p_req.body || {};

        var LUpdateSql = `UPDATE projects SET orgName = '${LReq.orgName}', orgAddress = '${LReq.orgAddress || ''}', orgCity = '${LReq.orgCity || ''}',
            orgPincode = '${LReq.orgPincode || ''}', propName = '${LReq.propName || ''}', propMobileNo = '${LReq.propMobileNo || ''}', propState = '${LReq.propState || ''}', liscenseNos = '${LReq.liscenseNos || ''}' WHERE id=${p_req.params.id}`;

        FDb.run(LUpdateSql, [], function (p_error) {
            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..
            p_res.json(p_req.body);
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

router.put('/invoice/:id', async (p_req, p_res) => {

    try {

        var LProjectId = p_req.headers.projectid;

        if (isEmpty(LProjectId) === true) {

            return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
        }

        // p_res.json(p_req.body);
        var LReq = p_req.body || {};

        var LUpdateSql = `UPDATE projects SET defaultInvoice = '${LReq.defaultInvoice}' WHERE id=${p_req.params.id}`;

        FDb.run(LUpdateSql, [], function (p_error) {
            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            p_res.json({ ...p_req.body, id: p_req.params.id });
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

module.exports = router;