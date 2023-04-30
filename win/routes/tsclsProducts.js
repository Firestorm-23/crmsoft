const express = require('express');
const router = express.Router();

const FDb = require('../tsclsDatabase');

const GenConstant = require('../tsclsGenConstants');
var { ErrorObj, isEmpty } = require('../local/tsclsGenUtils');

//Getting all Products
router.get('/', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var sql = `SELECT * FROM products WHERE projectId=${LProjectId}`;

        FDb.all(sql, [], (p_error, rows) => {

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

router.get('/type/:invoiceType', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var sql = `SELECT * FROM products WHERE invoiceType="${p_req.params.invoiceType}" AND projectId=${LProjectId}`;

        FDb.all(sql, [], (p_error, rows) => {

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

//Getting one user by id
router.get('/:id', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var LId = parseInt(p_req.params.id);

    var L_fun = function (p_objRecord) {

        p_res.json(p_objRecord || {});
    };

    if (LId === undefined) {

        L_fun(ErrorObj({ message: 'Id not found' }));
    }
    else {

        pvtGetCstById(L_fun, LId, LProjectId);
    }

});

//Creting new one
router.post('/', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var LArrFields = p_req.body.fieldsArr || [],
        LQuryParams = LArrFields.join(','),
        LValues = [];

    if (LArrFields != null) {

        LArrFields.forEach(function (p_strField) {

            // LParam[p_strField] = p_req.body[p_strField];
            LValues.push('"' + p_req.body[p_strField] + '"');
        });//forEach..
    }//if..

    var L_fun = function (p_objRecord) {
        p_res.json(p_objRecord || {});
    };

    try {

        LValues = LValues.join(',');

        var LSql = `INSERT INTO products (${LQuryParams}, projectId) VALUES (${LValues}, ${LProjectId})`;

        // insert one row into the customFields table
        FDb.run(LSql, [], function (p_error) {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            pvtGetCstById(L_fun, this.lastID, LProjectId);
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

//Delete the user by id
router.delete('/:id', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var LCheckSql = `SELECT count(id) as count FROM stock where productId = ${p_req.params.id} AND projectId=${LProjectId}`;

        FDb.all(LCheckSql, [], (p_error, p_objRecord) => {
            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            if (p_objRecord[0].count > 0) {

                return p_res.status(500).json(ErrorObj({ message: 'You have added stock for this product, so you can\'t delete this product, if you want delete this then first you need to delete the stock.' }));
            }
            else {
                // delete one row into the langs table
                FDb.run(`DELETE FROM products WHERE id=${p_req.params.id} AND projectId=${LProjectId}`, [], function (p_error) {
                    if (p_error) {

                        /**
                         * DONE: Check the stock is added by user for this or not
                         * If stock is added then do not allow to delete product
                         */

                        return p_res.status(500).json(ErrorObj(p_error));
                    }
                    p_res.json({
                        success: true,
                        message: 'Customer Deleted.',
                        id: parseInt(p_req.params.id)
                    });
                });
            }
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

router.put('/:id', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var LArrFields = p_req.body.fieldsArr || [],
        LUpdateQuery = '',
        LSql,
        LArrFieldsLen = LArrFields.length;

    if (LArrFields != null) {

        LArrFields.forEach(function (p_strField, p_index) {

            // p_res.User[p_strField] = p_req.body[p_strField];

            LUpdateQuery += p_strField + '="' + p_req.body[p_strField] + '"';

            //Adding comma
            if (LArrFieldsLen - 1 !== p_index) {

                LUpdateQuery += ',';
            }//if..
        });//forEach..
    }//if..

    try {

        var LId = parseInt(p_req.params.id);
        LSql = `UPDATE products SET ${LUpdateQuery} WHERE id=${LId} AND projectId=${LProjectId}`;

        var L_fun = function (p_objRecord) {

            p_res.json(p_objRecord || {});
        };

        // update one row into the langs table
        FDb.run(LSql, [], function (p_error) {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            pvtGetCstById(L_fun, LId, LProjectId);
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

function pvtGetCstById(p_callback, p_intId, p_intProjectId) {
    /**
     * @method pvtGetCstById
     * This method will return the products and call callback function
     * 
     * @param
     * {callback} - function
     * {id} - User Id
     */

    var sql = `SELECT * FROM products where id=${p_intId} AND projectId=${p_intProjectId}`;

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