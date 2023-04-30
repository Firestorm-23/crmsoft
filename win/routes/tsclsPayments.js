
const express = require('express');
const router = express.Router();

const FDb = require('../tsclsDatabase');

const GenConstant = require('../tsclsGenConstants');
var { ErrorObj, isEmpty } = require('../local/tsclsGenUtils');

//Getting all payments
router.put('/', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var sql = `SELECT * FROM customers INNER JOIN payments ON customers.id = payments.cstId WHERE customers.projectId=${LProjectId} ORDER BY payments.id DESC`;

        FDb.all(sql, [], (p_error, rows) => {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            rows = rows || [];
            var LReq = p_req.body || {};

            var LResponse = pvtGetFilteredRecords(LReq, rows) || [];

            p_res.json(LResponse);
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

//Getting all payments
router.put('/type/:invoiceType', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var sql = `SELECT * FROM customers INNER JOIN payments ON customers.id = payments.cstId WHERE invoiceType='${p_req.params.invoiceType}' AND customers.projectId=${LProjectId} ORDER BY payments.id DESC`;

        FDb.all(sql, [], (p_error, rows) => {
            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            rows = rows || [];
            var LReq = p_req.body || {};

            var LResponse = pvtGetFilteredRecords(LReq, rows) || [];

            p_res.json(LResponse);
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

function pvtGetFilteredRecords(p_objRequest, p_arrResponseRows) {

    var LReqFromDate = new Date(p_objRequest.fromDate),
        LReqToDate = new Date(p_objRequest.toDate),
        LSqlDate,
        LResponse = [];

    //Setting hours to 0, so that it comapares only with date
    LReqFromDate.setHours(0, 0, 0, 0);
    LReqToDate.setHours(0, 0, 0, 0);

    p_arrResponseRows.forEach((p_objRecord) => {

        //Getting date of payment
        LSqlDate = new Date(p_objRecord.paymentDate);
        LSqlDate.setHours(0, 0, 0, 0);

        //Check for date in range
        if (LSqlDate > LReqToDate || LSqlDate < LReqFromDate) {

            return true;//continue the loop
        }//if..

        LResponse.push(p_objRecord);
    });

    return LResponse;
}

//Getting all payments
router.get('/type/:invoiceType/invoiceNo/:invoiceNo/isPurchaserInvoice/:isPurchaserInvoice', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var sql = `SELECT * FROM payments WHERE invoiceType='${p_req.params.invoiceType}' AND invoiceNo=${p_req.params.invoiceNo} AND isPurchaserInvoice=${p_req.params.isPurchaserInvoice || 0} AND projectId=${LProjectId}`;

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

//Getting one payment by id
router.get('/:id', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {
        var LId = parseInt(p_req.params.id);

        var L_fun = function (p_objRecord) {

            p_res.json(p_objRecord || {});
        };

        pvtGetPaymentById(L_fun, LId, LProjectId);
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

//Creting new one
router.post('/', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var L_fun = function (p_objRecord) {

        p_res.json(p_objRecord || {});
    };

    try {
        var LBalance;

        if (p_req.body.credit && p_req.body.credit > 0) {
            LBalance = p_req.body.credit;
        }
        else {
            LBalance = -(p_req.body.debit);
        }

        var LUpdateQuery = `UPDATE customers SET cstBalance=cstBalance+${LBalance} WHERE id=${p_req.body.cstId} AND projectId=${LProjectId}`;
        FDb.run(LUpdateQuery, [], function (p_error) {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            // insert one row into the payments table
            var LSql = `INSERT INTO payments (invoiceType, paymentDate, cstId, invoiceNo, credit, debit, mode, remark, projectId) 
                        VALUES('${p_req.body.invoiceType}', '${p_req.body.paymentDate}', ${p_req.body.cstId}, '${p_req.body.invoiceNo}', ${p_req.body.credit}, ${p_req.body.debit}, '${p_req.body.mode}', '${p_req.body.remark}', ${LProjectId})`;

            FDb.run(LSql, [], function (p_error) {

                if (p_error) {

                    return p_res.status(500).json(ErrorObj(p_error));
                }//if..

                pvtGetPaymentById(L_fun, this.lastID, LProjectId);
            });
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

//We not allow to Delete the payment

//We not allow to Edit the payment


function pvtGetPaymentById(p_callback, p_intId, p_intProjectId) {
    /**
     * @method pvtGetPayment
     * This method will return the payment and call callback function
     * 
     * @param
     * {callback} - function
     * {id} - Payment Id
     */

    if (!p_intId) {

        return false;
    }

    var sql = `SELECT * FROM payments where id=${p_intId} AND projectId=${p_intProjectId}`;

    FDb.all(sql, [], (p_error, rows) => {

        if (p_error) {

            return p_callback(ErrorObj(p_error));
        }//if..

        if (p_callback) {

            p_callback(rows[0]);
        }
    });
}


module.exports = router;