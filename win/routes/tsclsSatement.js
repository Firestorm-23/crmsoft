const express = require('express');
const router = express.Router();

const FDb = require('../tsclsDatabase');

const GenConstant = require('../tsclsGenConstants');
var { ErrorObj, isEmpty } = require('../local/tsclsGenUtils');

//Getting all payments by customer
router.put('/customers', async (p_req, p_res) => {

    try {

        var LProjectId = p_req.headers.projectid;

        if (isEmpty(LProjectId) === true) {

            return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
        }//if..

        var LReq = p_req.body || {};

        var LSql = `SELECT * FROM payments WHERE cstId=${LReq.cstId} AND projectId=${LProjectId}`;

        FDb.all(LSql, [], (p_error, p_sqlRows) => {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            var LReqFromDate = new Date(LReq.fromDate),
                LReqToDate = new Date(LReq.toDate),
                LSqlDate,
                LResponse = [];

            //Setting hours to 0, so that it comapares only with date
            LReqFromDate.setHours(0, 0, 0, 0);
            LReqToDate.setHours(0, 0, 0, 0);

            p_sqlRows = p_sqlRows || [];

            var LBalance = 0;

            p_sqlRows.forEach(function (p_objRecord) {

                //Getting date of payment
                LSqlDate = new Date(p_objRecord.paymentDate);
                LSqlDate.setHours(0, 0, 0, 0);

                //If credited amount 
                if (p_objRecord.credit === 0) {

                    LBalance -= p_objRecord.debit;
                }
                else {

                    //If debited amount 
                    LBalance += p_objRecord.credit;
                }

                if (LSqlDate > LReqToDate || LSqlDate < LReqFromDate) {

                    return true;//continue the loop
                }//if..

                p_objRecord.balance = LBalance < 0 ? Math.abs(LBalance) + ' Dr' : LBalance + ' Cr';

                //Adding grandTotal field
                p_objRecord.grandTotal = p_objRecord.total;
                p_objRecord.invoiceDate = p_objRecord.paymentDate;

                LResponse.push(p_objRecord);
            });

            p_res.json(LResponse);
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

router.put('/productsale', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var LReq = p_req.body || {},
            // LSql = `SELECT invoices.id, invoices.invoiceDate, invoices.productId, products.*, sum(invoices.qty) as soldQty FROM invoices INNER JOIN products WHERE invoices.productId = products.id GROUP BY products.id;`;
            LSql = `SELECT invoices.id, invoices.invoiceDate, invoices.productId, products.*, invoices.qty as soldQty FROM invoices INNER JOIN products WHERE invoices.productId = products.id AND invoices.invoiceType = '${LReq.invoiceType}' AND (invoices.projectId=${LProjectId} AND products.projectId=${LProjectId})`;

        // We not give ALL option here, because of "Fields" issue
        // if (GenConstant.PSUDO_INVOICE_TYPE_ALL === LReq.invoiceType) {

        //     LSql = `SELECT invoices.id, invoices.invoiceDate, invoices.productId, products.*, invoices.qty as soldQty FROM invoices INNER JOIN products WHERE invoices.productId = products.id`;
        // }

        FDb.all(LSql, [], (p_error, p_sqlRows) => {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            p_sqlRows = p_sqlRows || [];

            var LReqFromDate = new Date(LReq.fromDate),
                LReqToDate = new Date(LReq.toDate),
                LSqlDate,
                LResponse = [],
                LPluckArrProductIds = [],
                LIndexOfExistingRecord,
                LExistingRecord;

            //Setting hours to 0, so that it comapares only with date
            LReqFromDate.setHours(0, 0, 0, 0);
            LReqToDate.setHours(0, 0, 0, 0);

            p_sqlRows.forEach(function (p_objRecord) {

                LSqlDate = new Date(p_objRecord.invoiceDate);

                LSqlDate.setHours(0, 0, 0, 0);

                //Check for date in range
                if (LSqlDate > LReqToDate || LSqlDate < LReqFromDate) {

                    return true;//continue the loop
                }//if..

                LIndexOfExistingRecord = LPluckArrProductIds.indexOf(p_objRecord.productId);

                //Not found in array
                if (LIndexOfExistingRecord < 0) {

                    LPluckArrProductIds.push(p_objRecord.productId);
                    LResponse.push(p_objRecord);

                    return true;//continue the loop
                }//if..

                //Get record from response array
                LExistingRecord = LResponse[LIndexOfExistingRecord] || {};

                //Update sold quantity
                LExistingRecord.soldQty += p_objRecord.soldQty;
            });

            p_res.json(LResponse);
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

function pvtGetCostPriceByStockId(p_intStockId, p_callBack) {

    // var LSql = `SELECT costPrice FROM stock WHERE id=${p_intStockId}`;
    var LSql = `SELECT stock.*, stock.qty as stockRemainingQty, products.productName, products.id as productId, products.gst, products.hsn FROM stock, products WHERE stock.id=${p_intStockId} AND stock.productId = products.id`;

    FDb.all(LSql, [], (p_error, p_arrRecords) => {

        var LObj = p_arrRecords[0] || {};

        delete LObj.qty;

        p_callBack(LObj);
    });
}

router.put('/profitproductwise', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var LReq = p_req.body || {};

        //Here we can't use groupby caluse bcz 
        var sql = `SELECT stockId, qty, soldPrice, invoiceDate, invoiceType FROM invoices WHERE invoiceType='${LReq.invoiceType}' AND projectId=${LProjectId}`;

        if (GenConstant().PSUDO_INVOICE_TYPE_ALL === LReq.invoiceType) {

            sql = `SELECT stockId, qty, soldPrice, invoiceDate, invoiceType FROM invoices WHERE projectId=${LProjectId}`;
        }

        FDb.all(sql, [], (p_error, p_arrRecords) => {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            var LResultArr = [],
                LIsFoundInResultArr = false,
                LLength,
                LCounter = 0,
                LReqFromDate = new Date(LReq.fromDate),
                LReqToDate = new Date(LReq.toDate),
                LSqlDate,
                LObj;

            //Setting hours to 0, so that it comapares only with date
            LReqFromDate.setHours(0, 0, 0, 0);
            LReqToDate.setHours(0, 0, 0, 0);

            p_arrRecords = p_arrRecords || [];

            p_arrRecords = p_arrRecords.filter(function (p_objRecord) {

                LSqlDate = new Date(p_objRecord.invoiceDate);

                LSqlDate.setHours(0, 0, 0, 0);

                //Check for date in range
                if (LSqlDate > LReqToDate || LSqlDate < LReqFromDate) {

                    return false;
                }//if..

                // //Removing time from invoice date, so that easily group by dates in client side
                // p_objRecord.invoiceDate = LSqlDate;

                return true;
            });

            LLength = p_arrRecords.length;

            var L_funHandleOnDone = function () {

                if (LLength === LCounter) {

                    p_res.json(LResultArr);
                }//if..
            };

            if (LLength === 0) {

                L_funHandleOnDone();
            }//if..

            p_arrRecords.forEach(function (p_objRecord) {

                pvtGetCostPriceByStockId(p_objRecord.stockId, function (p_objProduct) {

                    LObj = { ...p_objRecord, ...p_objProduct };

                    LCounter++;

                    //Checking if stockID is already in result array,
                    //then updating qty, else adding result array.

                    LIsFoundInResultArr = false;
                    LResultArr.forEach(function (p_objResult) {

                        if (p_objResult.stockId === LObj.stockId) {

                            p_objResult.qty += LObj.qty;

                            p_objResult.profit += (LObj.soldPrice - LObj.costPrice) * LObj.qty;
                            LIsFoundInResultArr = true;
                            return false;
                        }//if..
                    });

                    if (LIsFoundInResultArr === true) {

                        L_funHandleOnDone();
                        return;
                    }//if..

                    //Here means, adding unique stock in result array
                    LObj.profit = (LObj.soldPrice - LObj.costPrice) * LObj.qty;

                    LObj.id = LObj.stockId;

                    delete LObj.soldPrice;
                    LResultArr.push(LObj);

                    L_funHandleOnDone();
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

router.put('/profitdatewise', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var LReq = p_req.body || {};

        //Here we can't use groupby caluse bcz 
        var sql = `SELECT stockId, qty, soldPrice, invoiceDate, invoiceType FROM invoices WHERE invoiceType='${LReq.invoiceType}' AND projectId=${LProjectId}`;

        if (GenConstant().PSUDO_INVOICE_TYPE_ALL === LReq.invoiceType) {

            sql = `SELECT stockId, qty, soldPrice, invoiceDate, invoiceType FROM invoices WHERE projectId=${LProjectId}`;
        }

        FDb.all(sql, [], (p_error, p_arrRecords) => {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            var LResultArr = [],
                LIsFoundInResultArr = false,
                LLength,
                LCounter = 0,
                LReqFromDate = new Date(LReq.fromDate),
                LReqToDate = new Date(LReq.toDate),
                LSqlDate,
                LObj;

            //Setting hours to 0, so that it comapares only with date
            LReqFromDate.setHours(0, 0, 0, 0);
            LReqToDate.setHours(0, 0, 0, 0);

            p_arrRecords = p_arrRecords || [];

            p_arrRecords = p_arrRecords.filter(function (p_objRecord) {

                LSqlDate = new Date(p_objRecord.invoiceDate);

                LSqlDate.setHours(0, 0, 0, 0);

                //Check for date in range
                if (LSqlDate > LReqToDate || LSqlDate < LReqFromDate) {

                    return false;
                }//if..

                // //Removing time from invoice date, so that easily group by dates in client side
                p_objRecord.invoiceDate = LSqlDate;
                p_objRecord.invoiceLocalDateString = LSqlDate.toLocaleDateString();

                return true;
            });

            LLength = p_arrRecords.length;

            var L_funHandleOnDone = function () {

                if (LLength === LCounter) {

                    //Sorting array by date
                    LResultArr = LResultArr.sort(function (p_objRecord1, p_objRecord2) {

                        if (new Date(p_objRecord1.invoiceDate).getTime() < new Date(p_objRecord2.invoiceDate).getTime()) {

                            return -1;
                        }
                        return 1;
                    });

                    p_res.json(LResultArr);
                }//if..
            };

            if (LLength === 0) {

                L_funHandleOnDone();
            }//if..

            p_arrRecords.forEach(function (p_objRecord, p_intIndex) {

                pvtGetCostPriceByStockId(p_objRecord.stockId, function (p_objProduct) {

                    LObj = { ...p_objRecord, ...p_objProduct };

                    LCounter++;

                    //Checking if stockID is already in result array,
                    //then updating qty, else adding result array.

                    LIsFoundInResultArr = false;
                    LResultArr.forEach(function (p_objResult) {

                        if (new Date(p_objResult.invoiceDate).getTime() === new Date(LObj.invoiceDate).getTime()) {

                            p_objResult.profit += (LObj.soldPrice - LObj.costPrice) * LObj.qty;
                            LIsFoundInResultArr = true;
                            return false;
                        }//if..
                    });

                    if (LIsFoundInResultArr === true) {

                        L_funHandleOnDone();
                        return;
                    }//if..

                    //Here means, adding unique stock in result array
                    LObj.profit = (LObj.soldPrice - LObj.costPrice) * LObj.qty;

                    LObj.id = p_intIndex;

                    delete LObj.soldPrice;
                    LResultArr.push(LObj);

                    L_funHandleOnDone();
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

router.put('/invoicewiseprofit', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var LReq = p_req.body || {};

    var LSql = `SELECT *, sum((100 * (invoices.soldPrice * invoices.qty)) / (100.0 + products.gst)) as TaxableAmount,
                sum(invoices.soldPrice * invoices.qty) as grandTotal,
                sum((invoices.soldPrice - stock.costPrice) * invoices.qty ) as ProfitPerInvoice
                FROM invoices, customers, stock, products, payments
                WHERE invoices.invoiceType = '${LReq.invoiceType}' AND 
                invoices.cstId = customers.id AND invoices.productId = products.id AND 
                (stock.id = invoices.stockId AND products.id = stock.productId) AND
                (payments.invoiceNo = invoices.invoiceNo AND payments.invoiceType = '${LReq.invoiceType}' AND payments.isPurchaserInvoice=0) GROUP BY invoices.invoiceNo;`;

    FDb.all(LSql, [], (p_error, p_arrRecords) => {

        if (p_error) {

            return p_res.status(500).json(ErrorObj(p_error));
        }//if..

        var LReqFromDate = new Date(LReq.fromDate),
            LReqToDate = new Date(LReq.toDate),
            LSqlDate;

        //Setting hours to 0, so that it comapares only with date
        LReqFromDate.setHours(0, 0, 0, 0);
        LReqToDate.setHours(0, 0, 0, 0);

        p_arrRecords = p_arrRecords || [];

        //Filtering array, getting data between the range
        p_arrRecords = p_arrRecords.filter(function (p_objRecord) {

            LSqlDate = new Date(p_objRecord.invoiceDate);

            LSqlDate.setHours(0, 0, 0, 0);

            //Check for date in range
            if (LSqlDate > LReqToDate || LSqlDate < LReqFromDate) {

                return false;
            }//if..

            return true;
        });

        p_res.json(p_arrRecords);
    });
});

router.put('/cashflow', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var LReq = p_req.body || {},
        LSql, LResponse = {
            sale: {},
            purshare: {}
        };

    LSql = 'SELECT credit, total, debit, invoiceType, paymentDate, isPurchaserInvoice FROM payments';

    FDb.all(LSql, [], (p_error, p_arrRecords) => {

        if (p_error) {

            return p_res.status(500).json(ErrorObj(p_error));
        }//if..

        var LReqFromDate = new Date(LReq.fromDate),
            LReqToDate = new Date(LReq.toDate),
            LSqlDate;

        //Setting hours to 0, so that it comapares only with date
        LReqFromDate.setHours(0, 0, 0, 0);
        LReqToDate.setHours(0, 0, 0, 0);

        p_arrRecords = p_arrRecords || [];

        //Filtering array, getting data between the range
        p_arrRecords.forEach(function (p_objRecord) {

            LSqlDate = new Date(p_objRecord.paymentDate);

            LSqlDate.setHours(0, 0, 0, 0);

            //Check for date in range
            if (LSqlDate > LReqToDate || LSqlDate < LReqFromDate) {

                return true;
            }//if..

            pvtCalculateResponseByInvoiceType(LResponse.sale, p_objRecord, 1);
            pvtCalculateResponseByInvoiceType(LResponse.purshare, p_objRecord, 0);
        });

        p_res.json(LResponse);
    });
});

function pvtCalculateResponseByInvoiceType(p_objResponse, p_objSqlRecord, p_intForPurchaser) {

    if (p_objSqlRecord.isPurchaserInvoice === p_intForPurchaser) {

        return;
    }

    var LInvoiceType = p_objSqlRecord.invoiceType;

    //If response object don't have a property
    if (p_objResponse.hasOwnProperty(LInvoiceType) === false) {

        p_objResponse[LInvoiceType] = {
            //Here exact addition of DB columns (credit, total, debit)
            total: 0,
            credit: 0,
            debit: 0
        };
    }//if..

    LResult = p_objResponse[LInvoiceType];

    LResult.total += p_objSqlRecord.total;
    LResult.credit += p_objSqlRecord.credit;
    LResult.debit += p_objSqlRecord.debit;
}

module.exports = router;