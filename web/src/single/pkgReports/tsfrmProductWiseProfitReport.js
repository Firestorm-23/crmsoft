import React, { Component } from 'react';

import {
    Box
} from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import TReport from '../../reusable/tsfrmReports';
import {
    BaseUrl, isEmpty, tsGetProjectId
} from '../../tsclsGenUtils';
import { GenConstants } from '../../tsclsGenConstants';
import TProductStockSelection from '../pkgManageProducts/tsfrmStocksShell';

class tsfrmProfitReport extends Component {

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         *
         */
        // var LMe = this;
    }

    pvtGetGridColumn(p_arrFields) {
        /**
         * @method pvtGetGridColumn
         * This method will return the grid column json
         */

        var //LMe = this,
            LArrColumn = [];
        // LObj = {};

        LArrColumn = [
            {
                field: 'productName',
                headerName: 'Product Name',
                headerClassName: 'tsGridHeader',
                flex: 1,
                minWidth: 200
            },
            {
                field: 'qty',
                headerName: 'Sold Quantity',
                headerClassName: 'tsGridHeader',
                // flex: 1,
                width: 165
            },
            {
                field: 'costPrice',
                headerName: 'Cost Price per Unit',
                headerClassName: 'tsGridHeader',
                minWidth: 200,
                renderCell: (params) => {
                    return 'Rs. ' + params.value;
                }
            },
            {
                field: 'profit',
                headerName: 'Profit / Loss',
                headerClassName: 'tsGridHeader',
                cellClassName: (params) => params.value > 0 ? 'tsGridSuccessCell' : 'tsGridFailureCell',
                width: 165,
                renderCell: (params) => {
                    var LValue = params.value;

                    if (LValue > 0) {

                        return <span title='Profit Amount calculated from "Sold Quantity" by "Sold Amount".'>{'Rs. ' + Math.abs(LValue)}</span>;
                    }
                    return <span title='Loss Amount calculated from "Sold Quantity" by "Sold Amount".'>{'Rs. ' + Math.abs(LValue)}</span>;
                }
            },
            {
                field: 'hsn',
                headerName: 'HSN Code',
                headerClassName: 'tsGridHeader',
                // flex: 1,
                width: 150,

                isRequired: true,
                isField: true
            },
            {
                field: 'gst',
                headerName: 'GST',
                headerClassName: 'tsGridHeader',
                // flex: 1,
                width: 150,

                isRequired: true,
                isField: true
            },
        ];

        var LObj = {};

        if (isEmpty(p_arrFields) === false) {

            //Convert it into array
            p_arrFields = p_arrFields || [];

            p_arrFields.forEach(function (p_objRecord) {

                if (p_objRecord.isSystemField === true) {

                    return true;
                }//if..

                LObj = {};

                LObj['headerName'] = p_objRecord.fieldName;

                //Setting column name
                LObj['field'] = p_objRecord.columnName;
                LObj['headerClassName'] = 'tsGridHeader';
                LObj['minWidth'] = 200;

                LArrColumn.push(LObj);
            });

        }//if..

        return LArrColumn;
    }

    pvtFetchProductDetails(p_objParams, p_callBack) {
        /**
         * @method pvtFetchProductDetails
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var //LMe = this,
            LParamObj = p_objParams || {},
            LRequestOptions,
            LUrl;

        LUrl = BaseUrl() + 'statement/profitproductwise';

        LRequestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify(LParamObj),
        };

        // No need to check for session
        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {

                    if (isEmpty(p_callBack) === false) {

                        p_callBack(responseJson, LParamObj);
                    }
                },
                (error) => {

                    p_callBack([]);
                }
            );
    }

    pvtFetchStocksFields(p_actCodeInvoiceType, p_callBack) {
        /**
         * @method pvtFetchStocksFields
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var //LMe = this,
            LUrl,
            LInvoiceType = p_actCodeInvoiceType;

        if (isEmpty(LInvoiceType) === true || p_actCodeInvoiceType === GenConstants().PSUDO_INVOICE_TYPE_ALL) {

            if (isEmpty(p_callBack) === false) {

                p_callBack([]);
            }//if..
            return;
        }//if..

        LUrl = BaseUrl() + 'customFields/type/' + GenConstants().STOCK_CSTM_FIELDS + '/' + LInvoiceType;

        var LRequestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            }
        };

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {

                    if (isEmpty(p_callBack) === false) {

                        p_callBack(responseJson);
                    }//if..
                },
                (error) => {
                    if (isEmpty(p_callBack) === false) {

                        p_callBack([]);
                    }//if..
                }
            );
    }

    pvtGetProductDialogContent(p_objRecord) {

        // var LMe = this;
        return (
            <TProductStockSelection
                PProductId={p_objRecord.productId}
                PInvoiceType={p_objRecord.invoiceType}
                PStockId={p_objRecord.stockId}
            />
        );
    }

    render() {
        var LMe = this;

        return (
            <div
                className="flex1 tsVBox"
                style={{
                    margin: '10px 0 10px 0',
                }}
            >
                <Box component="div" display="flex" px={3} pb={2}>
                    {/* Module Icon */}
                    <div style={{ margin: '20px 6px 0 0' }}>
                        <DescriptionIcon />
                    </div>
                    <div style={{ margin: '18px 6px 0 0' }}>
                        {/* Module Title */}
                        <div style={{ fontSize: '20px' }}> {LMe.props.moduleInfo.displayTxt} </div>

                        {/* Module Description */}
                        <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
                            Check product wise profit / loss report. Double click on product for stock details.
                        </Box>
                    </div>
                </Box>

                <TReport
                    PGetGridColumn={LMe.pvtGetGridColumn}
                    PFetchProductDetails={LMe.pvtFetchProductDetails}
                    PFetchProductsFields={LMe.pvtFetchStocksFields}
                    PCanAddPsudoNodeInInvoiceType={true}
                    PGetDialogContent={LMe.pvtGetProductDialogContent}
                    PChartConfig={{
                        lineDataKey: 'profit',
                        xAxisDataKey: 'productName',
                        dispName: 'Total Profit'
                    }}
                />
            </div>
        );
    }
}

export default tsfrmProfitReport;