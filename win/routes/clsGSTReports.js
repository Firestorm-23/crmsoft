
const express = require('express');
const router = express.Router();

const FDb = require('../tsclsDatabase');

const GenConstant = require('../tsclsGenConstants');
var { ErrorObj, isEmpty } = require('../local/tsclsGenUtils');

router.put('/', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var LReq = p_req.body || {};

    var LSql = pvtGetSqlByGSTType(LReq.gstType);

    if (isEmpty(LSql)) {

        return p_res.status(500).json(ErrorObj({ message: 'Sql Statement is not defined for this type.' }));
    }//if..

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

            // if (isEmpty(p_objRecord.cstGSTNo) === true) {

            //     return false;
            // }

            LSqlDate = new Date(p_objRecord.invoiceDate);

            LSqlDate.setHours(0, 0, 0, 0);

            //Check for date in range
            if (LSqlDate > LReqToDate || LSqlDate < LReqFromDate) {

                return false;
            }//if..

            switch (LReq.gstType) {

                case GenConstant().B2CS:
                    if (p_objRecord.GrandTotal > 250000) {
                        return false;
                    }
                    break;

                case GenConstant().B2CL:
                    if (p_objRecord.GrandTotal <= 250000) {
                        return false;
                    }
                    break;
            }

            return true;
        });

        if (LReq.gstType === GenConstant().GSTR1) {

            var LLength = p_arrRecords.length,
                LIndex = 0;

            p_arrRecords.forEach(function (p_objRecord, p_intIndex) {

                pvtGetProducts(p_objRecord.invoiceNo, p_objRecord.invoiceType, function (p_arrProducts) {

                    p_objRecord.products = p_arrProducts || [];
                    LIndex++;

                    if (LIndex >= LLength) {
                        p_res.json(p_arrRecords);
                    }
                });
            });
        }
        else {

            p_res.json(p_arrRecords);
        }
    });
});

function pvtGetProducts(p_intInvoiceNo, p_strInvoiceType, p_callback) {

    var LSql = `select invoices.productId, invoices.stockId, invoices.qty, invoices.soldPrice, products.gstType, products.gst from invoices, products on 
                products.id = invoices.productId where invoices.invoiceNo = ${p_intInvoiceNo} and invoices.invoiceType='${p_strInvoiceType}'`;

    FDb.all(LSql, [], (p_error, p_arrRecords) => {

        if (p_error) {

            return p_res.status(500).json(ErrorObj(p_error));
        }//if..

        p_callback(p_arrRecords);
    });
}

function pvtGetSqlByGSTType(p_strGstType) {

    var LSql = '';

    switch (p_strGstType) {

        case GenConstant().GSTR1:
            LSql = `SELECT *,  sum((100 * (invoices.soldPrice * invoices.qty)) / (100.0 + products.gst)) as TaxableAmount,
                sum(invoices.soldPrice * invoices.qty) as GrandTotal 
                FROM invoices, customers, products, payments
                ON invoices.cstId = customers.id AND invoices.productId = products.id AND 
                (payments.invoiceNo = invoices.invoiceNo AND payments.invoiceType = invoices.invoiceType AND payments.isPurchaserInvoice=0) 
                WHERE products.gst > 0
                GROUP BY invoices.invoiceNo, invoices.invoiceType`;
            break;

        case GenConstant().B2CS:
            LSql = `SELECT invoices.id as id,
                    sum((100 * (invoices.soldPrice * invoices.qty)) / (100.0 + products.gst)) as TaxableAmount,
                    products.gst as Rate,
                    customers.cstState as State,
                    sum(invoices.soldPrice * invoices.qty) as GrandTotal
                    FROM invoices, customers, products, payments
                    ON invoices.cstId = customers.id AND invoices.productId = products.id
                    WHERE products.gst > 0 AND
                    (payments.invoiceNo = invoices.invoiceNo AND payments.invoiceType = invoices.invoiceType AND payments.isPurchaserInvoice=0) 
                    GROUP BY invoices.invoiceNo, invoices.invoiceType`;
            break;

        case GenConstant().B2CL:
            LSql = `SELECT invoices.id as id, invoices.invoiceNo, invoices.invoiceDate, invoices.invoiceType,
                    sum((100 * (invoices.soldPrice * invoices.qty)) / (100.0 + products.gst)) as TaxableAmount,
                    products.gst as Rate,
                    customers.cstState as State,
                    sum(invoices.soldPrice * invoices.qty) as GrandTotal
                    FROM invoices, customers, products, payments
                    ON invoices.cstId = customers.id AND invoices.productId = products.id
                    WHERE products.gst > 0 AND
                    (payments.invoiceNo = invoices.invoiceNo AND payments.invoiceType = invoices.invoiceType AND payments.isPurchaserInvoice=0) 
                    GROUP BY invoices.invoiceNo, invoices.invoiceType`;
            break;

        case GenConstant().B2B:
            LSql = `SELECT invoices.id as id, invoices.invoiceNo, invoices.invoiceDate, invoices.invoiceType,
                    sum((100 * (invoices.soldPrice * invoices.qty)) / (100.0 + products.gst)) as TaxableAmount,
                    products.gst as Rate,
                    customers.cstState as State,
                    customers.cstGSTNo as cstGSTNo,
                    customers.cstName,
                    sum(invoices.soldPrice * invoices.qty) as GrandTotal
                    FROM invoices, customers, products, payments
                    ON invoices.cstId = customers.id AND invoices.productId = products.id
                    WHERE products.gst > 0 AND customers.cstGSTNo > 0 AND
                    (payments.invoiceNo = invoices.invoiceNo AND payments.invoiceType = invoices.invoiceType AND payments.isPurchaserInvoice=0) 
                    GROUP BY invoices.invoiceNo, invoices.invoiceType`;
            break;
        case GenConstant().HSN:

            LSql = `select products.id, sum(invoices.qty) as qty,
                    sum(invoices.soldPrice * invoices.qty) as TotalVal, 
                    products.productName, products.hsn, 
                    sum((100 * (invoices.soldPrice * invoices.qty)) / (100.0 + products.gst)) as TaxableAmount,
                    products.gst as gst, products.gstType as gstType
                    from invoices, products on invoices.productId = products.id where products.gst > 0 group by products.id`;

            break;
    }

    return LSql;
}

module.exports = router;