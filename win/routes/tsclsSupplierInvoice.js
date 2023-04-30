const express = require('express');
const router = express.Router();

const FDb = require('../tsclsDatabase');

const GenConstant = require('../tsclsGenConstants');
var { ErrorObj, isEmpty } = require('../local/tsclsGenUtils');

/**
 * purchasedPrice field: The purchasedPrice field in purchaserInvoice table in DB will always be same as 
 * the costPrice field in stock table, also qty field will be same as tqty field in stock tbl.
 */

//Getting all purchaserinvoices
router.put('/type/:invoiceType', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var LReq = p_req.body || {};

        var sql = `SELECT sum(qty*purchasedPrice) as grandTotal, purchaserinvoices.id, invoiceType, invoiceNo, purchaserinvoices.strInvoiceNo, cstId, invoiceDate, customers.cstName FROM purchaserinvoices INNER JOIN customers ON customers.id = purchaserinvoices.cstId WHERE invoiceType='${p_req.params.invoiceType}' AND (purchaserinvoices.projectId=${LProjectId} AND customers.projectId=${LProjectId}) GROUP BY invoiceNo`;

        FDb.all(sql, [], (p_error, rows) => {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            rows = rows || [];

            var LReqFromDate = new Date(LReq.fromDate),
                LReqToDate = new Date(LReq.toDate),
                LSqlDate,
                LResponse = [];

            //Setting hours to 0, so that it comapares only with date
            LReqFromDate.setHours(0, 0, 0, 0);
            LReqToDate.setHours(0, 0, 0, 0);

            rows.forEach((p_objRecord) => {

                //Getting date of payment
                LSqlDate = new Date(p_objRecord.invoiceDate);
                LSqlDate.setHours(0, 0, 0, 0);

                //Check for date in range
                if (LSqlDate > LReqToDate || LSqlDate < LReqFromDate) {

                    return true;//continue the loop
                }//if..

                LResponse.push(p_objRecord);
            });

            p_res.json(LResponse);
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

//Getting all payments
router.get('/singleInvoice/type/:invoiceType/invoiceNo/:invoiceNo', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var sql = `SELECT sum(qty*purchasedPrice) as grandTotal, purchaserinvoices.id, invoiceType, invoiceNo, purchaserinvoices.strInvoiceNo, cstId, invoiceDate, customers.cstName FROM purchaserinvoices INNER JOIN customers ON customers.id = purchaserinvoices.cstId WHERE invoiceType='${p_req.params.invoiceType}' AND invoiceNo=${p_req.params.invoiceNo} AND (purchaserinvoices.projectId=${LProjectId} AND customers.projectId=${LProjectId})`;

        FDb.all(sql, [], (p_error, p_arrInvoiceRecords) => {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            var LPrSql = `SELECT productId, stockId, qty, purchasedPrice FROM purchaserinvoices WHERE invoiceType='${p_req.params.invoiceType}' AND invoiceNo=${p_req.params.invoiceNo} AND projectId=${LProjectId}`;

            FDb.all(LPrSql, [], (p_error, p_arrInvoiceProducts) => {

                if (p_error) {

                    return p_res.status(500).json(ErrorObj(p_error));
                }//if..

                var LObj = p_arrInvoiceRecords[0] || {};
                LObj.products = p_arrInvoiceProducts || [];

                p_res.json(LObj);
            });

        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

//Getting products by id
router.get('/type/:invoiceType/invoiceNo/:invoiceNo', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..


    try {
        var sql = `SELECT productId, stockId, qty, purchasedPrice, strInvoiceNo FROM purchaserinvoices WHERE invoiceType='${p_req.params.invoiceType}' AND invoiceNo=${p_req.params.invoiceNo} AND projectId=${LProjectId}`;

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

//Creting new one
router.post('/', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var LRepsonse = {};

        var LDebit = parseInt(p_req.body.grandTotal) - parseInt(p_req.body.payingAmount);
        /**
         * @field cstBalance: Negative means DR & Postitve means credit
         */

        var LUpdateQuery = `UPDATE customers SET cstBalance=cstBalance+${LDebit} WHERE id=${p_req.body.cstId} AND projectId=${LProjectId}`;

        //If debit is less than 0 means paying amount is greater than grand total
        if (LDebit < 0) {

            LUpdateQuery = `UPDATE customers SET cstBalance=cstBalance-${Math.abs(LDebit)} WHERE id=${p_req.body.cstId} AND projectId=${LProjectId}`;
        }

        FDb.run(LUpdateQuery, [], function (p_error) {
            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            var LSqlSelect = `SELECT invoiceNo FROM purchaserinvoices WHERE invoiceType='${p_req.body.invoiceType}' AND projectId=${LProjectId} order by invoiceNo DESC LIMIT 1`;

            FDb.all(LSqlSelect, [], (p_error, rows) => {

                if (p_error) {

                    return p_res.status(500).json(ErrorObj(p_error));
                }//if..

                var LInvoiceNo = 1;
                if (rows[0]) {

                    LInvoiceNo = rows[0].invoiceNo || 0;
                    LInvoiceNo++;
                }

                //If edit invoice
                if (p_req.body.invoiceNo) {

                    LInvoiceNo = p_req.body.invoiceNo;
                }//if..

                var LCredit = 0;
                if (LDebit < 0) {

                    LCredit = Math.abs(LDebit);
                    LDebit = 0;
                }

                // insert one row into the payments table
                var LPaymentInsertSql = `INSERT INTO payments (invoiceType, paymentDate, cstId, invoiceNo, total, credit, debit, mode, remark, isPurchaserInvoice, projectId) VALUES 
                    ('${p_req.body.invoiceType}', '${p_req.body.invoiceDate}', ${p_req.body.cstId}, ${LInvoiceNo}, ${p_req.body.grandTotal}, ${LDebit}, ${LCredit}, '${p_req.body.mode}', '${p_req.body.remark}', 1, ${LProjectId})`;

                FDb.run(LPaymentInsertSql, [], function (p_error) {

                    if (p_error) {

                        return p_res.status(500).json(ErrorObj(p_error));
                    }//if..

                    var LProducts = p_req.body.products || [],
                        LProductsLen = LProducts.length,
                        LCountIndex = 0;

                    LProducts.forEach(function (p_objRecord) {

                        var LInvoiceInsertSql = `INSERT INTO purchaserinvoices (invoiceType, invoiceNo, strInvoiceNo, productId, stockId, qty, purchasedPrice, cstId, invoiceDate, projectId) VALUES 
                                            ('${p_req.body.invoiceType}', ${LInvoiceNo}, '${p_req.body.strInvoiceNo || LInvoiceNo}', ${p_objRecord.productId}, ${p_objRecord.stockId}, ${p_objRecord.qty}, ${p_objRecord.price},${p_req.body.cstId}, '${p_req.body.invoiceDate}', ${LProjectId})`;

                        FDb.run(LInvoiceInsertSql, [], function (p_error) {
                            if (p_error) {

                                return p_res.status(500).json(ErrorObj(p_error));
                            }//if..

                            if (LProductsLen - 1 === LCountIndex) {

                                LRepsonse.invoiceNo = LInvoiceNo;
                                LRepsonse.invoiceType = p_req.body.invoiceType;
                                LRepsonse.strInvoiceNo = p_req.body.strInvoiceNo || LInvoiceNo;
                                LRepsonse.success = true;
                                p_res.json(LRepsonse || {});
                            }//if..

                            LCountIndex++;
                        });
                    });
                });
            });
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

router.delete('/:invoiceNo/:invoiceType', async (p_req, p_res) => {

    /**
     * Here we need cstId in body
     * ER - Need to remove cstid dependency from client side as we already fetch the invoice details
     */

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {
        /**
         * Here we are not maintaining stock on the basis of this invoice.
         * This is just for maintaining the purchaser's balance
         */

        //Local Functions

        var L_funStep3UpdateQty = function () {

            var LInvoiceSql = `SELECT * FROM purchaserinvoices WHERE invoiceType='${p_req.params.invoiceType}' AND invoiceNo=${p_req.params.invoiceNo} AND projectId=${LProjectId}`;

            FDb.all(LInvoiceSql, [], (p_error, p_invoiceRecord) => {

                if (p_error) {

                    return p_res.status(500).json(ErrorObj(p_error));
                }//if..

                var LProductsLen = p_invoiceRecord.length,
                    LCountIndex = 0;

                p_invoiceRecord.forEach(function (p_objRecord) {

                    // /**
                    //  * TODO: Need to validate here
                    //  * First need to check that stock is already sold or not.
                    //  * Currently this is handle in client side
                    //  */
                    // var LUpdateStockQuery = `DELETE FROM stock WHERE id=${p_objRecord.stockId}`;
                    // FDb.run(LUpdateStockQuery, [], function (err) {
                    //     if (err) {
                    //         console.log(err.message);
                    //         return p_res.status(500).json(
                    //             {
                    //                 message: err.message,
                    //                 error: err,
                    //                 success: false
                    //             }
                    //         );
                    //     }

                    //     var LUpdateProductkQuery = `UPDATE products SET qty=qty-${p_objRecord.qty} WHERE id=${p_objRecord.productId}`;
                    //     FDb.run(LUpdateProductkQuery, [], function (err) {
                    //         if (err) {
                    //             console.log(err.message);
                    //             return p_res.status(500).json(
                    //                 {
                    //                     message: err.message,
                    //                     error: err,
                    //                     success: false
                    //                 }
                    //             );
                    //         }


                    if (LProductsLen - 1 === LCountIndex) {

                        //Step4: Delete invoice
                        var LPaymentDeleteSql = `DELETE FROM purchaserinvoices WHERE invoiceType='${p_req.params.invoiceType}' AND invoiceNo=${p_req.params.invoiceNo} AND projectId=${LProjectId}`;

                        FDb.run(LPaymentDeleteSql, [], function (p_error) {
                            if (p_error) {

                                return p_res.status(500).json(ErrorObj(p_error));
                            }//if..

                            p_res.json({
                                success: true,
                                message: 'Invoice deleted.',
                                invoiceNo: p_req.params.invoiceNo,
                                invoiceType: p_req.params.invoiceType
                            });

                        });

                        return;
                    }//if..
                    LCountIndex++;
                    //     });
                    // });
                });
            });
        };

        var L_funDeletePaymentRecord = function () {
            var LPaymentDeleteSql = `DELETE FROM payments WHERE invoiceType='${p_req.params.invoiceType}' AND invoiceNo=${p_req.params.invoiceNo} AND isPurchaserInvoice=1 AND projectId=${LProjectId}`;
            FDb.run(LPaymentDeleteSql, [], function (err) {
                if (err) {
                    console.log(err.message);
                    return p_res.status(500).json(
                        {
                            message: err.message,
                            error: err,
                            success: false
                        }
                    );
                }

                //Next
                L_funStep3UpdateQty();
            });
        };

        //First step
        // Getting Payment record from table for Invoice type and invoice id
        var LPaymentRecordSql = `SELECT * FROM payments WHERE invoiceType='${p_req.params.invoiceType}' AND invoiceNo=${p_req.params.invoiceNo} AND isPurchaserInvoice=1 AND projectId=${LProjectId}`;

        FDb.all(LPaymentRecordSql, [], (p_error, rows) => {
            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            var LPaymentRecord = rows[0] || {};

            //Grand Total
            var LGrandTotalRecordSql = `SELECT sum(qty*purchasedPrice) as grandTotal FROM purchaserinvoices WHERE invoiceType='${p_req.params.invoiceType}' AND invoiceNo=${p_req.params.invoiceNo} AND projectId=${LProjectId}`;
            FDb.all(LGrandTotalRecordSql, [], (p_error, p_objGrandTotal) => {

                if (p_error) {

                    return p_res.status(500).json(ErrorObj(p_error));
                }//if..

                var LGrandTotal = p_objGrandTotal[0].grandTotal;

                //If invoice is not in credit (credit === grandTotal )
                if (LPaymentRecord.credit === LGrandTotal) {

                    L_funDeletePaymentRecord();
                }
                //If invoice is in credit
                else {

                    var LUpdateCstBalanceQuery = `UPDATE customers SET cstBalance=cstBalance-${LPaymentRecord.credit} WHERE id=${p_req.body.cstId} AND projectId=${LProjectId}`;

                    if (LPaymentRecord.credit === 0) {

                        LUpdateCstBalanceQuery = `UPDATE customers SET cstBalance=cstBalance+${LPaymentRecord.debit} WHERE id=${p_req.body.cstId} AND projectId=${LProjectId}`;
                    }

                    FDb.run(LUpdateCstBalanceQuery, [], function (p_error) {

                        if (p_error) {

                            return p_res.status(500).json(ErrorObj(p_error));
                        }//if..

                        L_funDeletePaymentRecord();
                    });
                }
            });
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

module.exports = router;