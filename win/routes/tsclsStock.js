const express = require('express');
const router = express.Router();

const FDb = require('../tsclsDatabase');

var GenConstant = require('../tsclsGenConstants');
var { ErrorObj, isEmpty } = require('../local/tsclsGenUtils');

//Getting all stock
//Not in used
router.get('/', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var sql = `SELECT * FROM stock WHERE projectId=${LProjectId}`;

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

//Getting stock by id
router.get('/:id', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var LId = parseInt(p_req.params.id);

    var L_fun = function (p_objRecord) {

        p_res.json(p_objRecord || {});
    };

    pvtGetStockById(L_fun, LId, LProjectId);
});

//Getting stocks by product ids
router.get('/byproductids/:id', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var LProductId = parseInt(p_req.params.id);

    var sql = `SELECT * FROM stock where productId=${LProductId} ORDER BY id DESC`;

    FDb.all(sql, [], (p_error, rows) => {
        if (p_error) {

            return p_res.status(500).json(ErrorObj(p_error));
        }//if..

        p_res.json(rows || []);
    });
});

/**
 * Remaining Quantity will be calculated at rest side
 * field name: qty
 */

//Creting new one
router.post('/', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var LArrFields = p_req.body.fieldsArr || [],
        LQuryParams,
        LValues = [],
        LParam = {};

    if (LArrFields != null) {

        LArrFields.forEach(function (p_strField) {

            LParam[p_strField] = p_req.body[p_strField];

            LValues.push('"' + p_req.body[p_strField] + '"');
        });//forEach..
    }//if..

    var L_fun = function (p_objRecord) {
        p_res.json(p_objRecord || {});
    };

    //Adding "qty" field in array
    LArrFields.push('qty');
    //Setting tqty to qty field in array
    LValues.push(LParam.tqty);

    try {


        LQuryParams = LArrFields.join(',');
        LValues = LValues.join(',');

        var LSql = `INSERT INTO stock (${LQuryParams}, projectId) VALUES (${LValues}, ${LProjectId})`;
        // insert one row into the customFields table
        FDb.run(LSql, [], function (p_error) {
            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            var LLastId = this.lastID;
            //Success
            var LUpdateQuery = `UPDATE products SET qty = qty + ${LParam.tqty} WHERE id=${LParam.productId} AND projectId=${LProjectId}`;
            FDb.run(LUpdateQuery, [], function (p_error) {
                if (p_error) {

                    return p_res.status(500).json(ErrorObj(p_error));
                }//if..
                pvtGetStockById(L_fun, LLastId, LProjectId);
            });
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

        var LCheckSql = `SELECT qty, tqty FROM stock where id=${p_req.params.id} AND projectId=${LProjectId}`;

        FDb.all(LCheckSql, [], (p_error, rows) => {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..


            if (rows[0].qty !== rows[0].tqty) {

                return p_res.status(500).json(ErrorObj({ message: 'You already sold this product, so you cannot delete this stock. If you want to delete this stock then first you need to delete that invoice.' }));
            }

            // delete one row into the langs table
            var LUpdateDecrementQuery = `UPDATE products SET qty = qty - (SELECT qty FROM stock where id=${p_req.params.id}) WHERE id=(SELECT productId FROM stock where id=${p_req.params.id}) AND projectId=${LProjectId}`;

            FDb.run(LUpdateDecrementQuery, [], function (p_error) {

                if (p_error) {

                    return p_res.status(500).json(ErrorObj(p_error));
                }//if..

                FDb.run(`DELETE FROM stock WHERE id=${p_req.params.id} AND projectId=${LProjectId}`, [], function (p_error) {
                    if (p_error) {

                        return p_res.status(500).json(ErrorObj(p_error));
                    }//if..

                    //Success
                    p_res.json({
                        success: true,
                        message: 'Stock Deleted.',
                        id: parseInt(p_req.params.id)
                    });
                });
            });
        });
    }
    catch (p_err) {

        return p_res.status(500).json(
            {
                message: p_err.message,
                success: false
            }
        );
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
        LParam = {},
        LArrFieldsLen = LArrFields.length;

    if (LArrFields != null) {

        LArrFields.forEach(function (p_strField, p_index) {

            // p_res.User[p_strField] = p_req.body[p_strField];
            LParam[p_strField] = p_req.body[p_strField];

            LUpdateQuery += p_strField + '="' + p_req.body[p_strField] + '"';

            //Adding comma
            if (LArrFieldsLen - 1 !== p_index) {

                LUpdateQuery += ',';
            }//if..
        });//forEach..
    }//if..

    try {
        var LId = parseInt(p_req.params.id);

        var L_fun = function (p_objRecord) {

            p_res.json(p_objRecord || {});
        };

        var LCheckSql = `SELECT qty, tqty FROM stock where id=${LId} AND projectId=${LProjectId}`;

        FDb.all(LCheckSql, [], (p_error, rows) => {
            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            var LRQty = rows[0].qty - rows[0].tqty;
            LRQty += parseInt(LParam.tqty);

            LUpdateQuery += ', qty=' + LRQty;


            if (LRQty < 0) {

                return p_res.status(500).json(ErrorObj({
                    message: 'You already sold this item, so you cannot change the quantity.'
                }));
            }

            //Revert the existing qty
            var LUpdateDecrementQuery = `UPDATE products SET qty = qty - (SELECT qty FROM stock where id=${LId}) WHERE id=${LParam.productId} AND projectId=${LProjectId}`;

            FDb.run(LUpdateDecrementQuery, [], function (p_error) {
                if (p_error) {

                    return p_res.status(500).json(ErrorObj(p_error));
                }//if..

                var LUpdateIncrementQuery = `UPDATE products SET qty = qty + ${parseInt(LParam.tqty)} WHERE id=${LParam.productId} AND projectId=${LProjectId}`;

                FDb.run(LUpdateIncrementQuery, [], function (p_error) {
                    if (p_error) {

                        return p_res.status(500).json(ErrorObj(p_error));
                    }//if..

                    LSql = `UPDATE stock SET ${LUpdateQuery} WHERE id=${LId} AND projectId=${LProjectId}`;

                    // update one row into the langs table
                    FDb.run(LSql, [], function (p_error) {
                        if (p_error) {

                            return p_res.status(500).json(ErrorObj(p_error));
                        }//if..

                        pvtGetStockById(L_fun, LId, LProjectId);
                    });
                });
            });
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

function pvtGetStockById(p_callback, p_intId, p_intProjectId) {
    /**
     * @method pvtGetStockById
     * This method will return the stock and call callback function
     * 
     * @param
     * {callback} - function
     * {id} - User Id
     */

    if (p_intId === undefined) {
        return;
    }

    var sql = `SELECT * FROM stock where id=${p_intId} AND projectId=${p_intProjectId}`;

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