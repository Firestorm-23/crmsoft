
const express = require('express');
const router = express.Router();

const FDb = require('../tsclsDatabase');

var { ErrorObj, isEmpty } = require('../local/tsclsGenUtils');
var GenConstant = require('../tsclsGenConstants');

//Getting all Customers
router.get('/', async (p_req, p_res) => {

    try {

        var LProjectId = p_req.headers.projectid;

        if (isEmpty(LProjectId) === true) {

            return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
        }//if..

        var sql = `SELECT * FROM customers WHERE projectId=${LProjectId} ORDER BY id DESC`;

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

    pvtGetCstById(L_fun, LId, LProjectId);
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

        var LSql = `INSERT INTO customers (${LQuryParams}, projectId) VALUES (${LValues}, ${LProjectId})`;
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

    try {

        var LProjectId = p_req.headers.projectid,
            LCstId = p_req.params.id;

        if (isEmpty(LProjectId) === true) {

            return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
        }//if..

        //Checking customer has already done any transcation or not
        LSql = `SELECT * FROM payments WHERE cstId=${LCstId}`;
        FDb.all(LSql, [], (p_error, p_arrCustomers) => {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            if (isEmpty(p_arrCustomers) === false && p_arrCustomers.length > 0) {

                //Here means customer has already done any transcation or not

                return p_res.status(500).json(ErrorObj({ message: 'This customer has already done transactions, so can not delete this customer.' }));
            }//if..

            // delete one row into the langs table
            FDb.run(`DELETE FROM customers WHERE id=${LCstId} AND projectId=${LProjectId}`, [], function (p_error) {

                if (p_error) {

                    return p_res.status(500).json(ErrorObj(p_error));
                }//if..

                p_res.json({
                    success: true,
                    message: 'Customer Deleted.',
                    id: parseInt(LCstId)
                });
            });
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
        LSql = `UPDATE customers SET ${LUpdateQuery} WHERE id=${LId} AND projectId=${LProjectId}`;

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
     * This method will return the customers and call callback function
     * 
     * @param
     * {callback} - function
     * {id} - User Id
     */

    var sql = `SELECT * FROM customers where id=${p_intId} AND projectId=${p_intProjectId}`;

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