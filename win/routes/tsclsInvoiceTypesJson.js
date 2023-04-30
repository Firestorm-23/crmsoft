
const express = require('express');
const router = express.Router();
const FDb = require('../tsclsDatabase');
const GenConstant = require('../tsclsGenConstants');
var { ErrorObj, isEmpty } = require('../local/tsclsGenUtils');

router.get('/', (p_req, p_res) => {
    try {

        var LProjectId = p_req.headers.projectid;

        if (isEmpty(LProjectId) === true) {

            return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
        }//if..

        var LSql = `SELECT * FROM invoiceTypes WHERE projectId=${LProjectId}`;

        FDb.all(LSql, [], (p_error, rows) => {
            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            p_res.json(rows);
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

function pvtGetActionCodeForInvoice(p_strInvoiceType) {

    if (p_strInvoiceType === undefined || p_strInvoiceType === null) {
        return '';
    }

    var LInvoiceType = p_strInvoiceType;

    LInvoiceType = LInvoiceType.split(" ");
    LInvoiceType = LInvoiceType.join("");
    // LInvoiceType = LInvoiceType.toUpperCase();

    LInvoiceType = 'act' + LInvoiceType;

    return LInvoiceType;
}

router.post('/', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var L_funHandleOnSuccess = function (p_insertedRecord) {

        p_res.json(p_insertedRecord || {});
    };

    var LActionCode = pvtGetActionCodeForInvoice(p_req.body.SINGULAR_NAME) || '';

    FDb.run(`INSERT INTO invoiceTypes (NAME, SINGULAR_NAME, ACT_CODE, INVOICE_NO_STARTS_WITH, projectId) VALUES 
    ('${p_req.body.NAME}', '${p_req.body.SINGULAR_NAME}', '${LActionCode}', '${p_req.body.INVOICE_NO_STARTS_WITH}', ${LProjectId})`, [], function (p_error) {

        if (p_error) {

            return p_res.status(500).json(ErrorObj(p_error));
        }//if..

        pvtGetInvoiceTypeById(L_funHandleOnSuccess, this.lastID, LProjectId);
    });
});

router.put('/:id', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var L_funHandleOnSuccess = function (p_insertedRecord) {

        p_res.json(p_insertedRecord || {});
    };

    FDb.run(`UPDATE invoiceTypes SET NAME='${p_req.body.NAME}',
                                     SINGULAR_NAME='${p_req.body.SINGULAR_NAME}',
                                     INVOICE_NO_STARTS_WITH='${p_req.body.INVOICE_NO_STARTS_WITH}'
            WHERE projectId=${LProjectId} AND id=${p_req.params.id}`, [], function (p_error) {

        if (p_error) {

            return p_res.status(500).json(ErrorObj(p_error));
        }//if..

        pvtGetInvoiceTypeById(L_funHandleOnSuccess, p_req.params.id, LProjectId);
    });
});

router.delete('/:id', async (p_req, p_res) => {
    try {

        var LProjectId = p_req.headers.projectid;

        if (isEmpty(LProjectId) === true) {

            return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
        }//if..

        // delete one row into the langs table
        FDb.run(`DELETE FROM invoiceTypes WHERE id=${p_req.params.id} AND projectId=${LProjectId}`, [], function (p_error) {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            p_res.json({
                success: true,
                message: 'Invoice Type successfully deleted.',
                id: parseInt(p_req.params.id)
            });
        });

    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

function pvtGetInvoiceTypeById(p_callback, p_intId, p_intProjectId) {
    /**
     * @method pvtGetFieldById
     * This method will return the field and call callback function
     * 
     * @param
     * {callback} - function
     * {id} - User Id
     */

    var LSql = `SELECT * FROM invoiceTypes where id=${p_intId} AND projectId=${p_intProjectId}`;

    FDb.all(LSql, [], (p_error, rows) => {
        if (p_error) {

            return p_callback(ErrorObj(p_error));
        }//if..

        if (p_callback) {

            p_callback(rows[0]);
        }
    });
}

module.exports = router;