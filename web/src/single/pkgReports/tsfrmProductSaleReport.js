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

class tsfrmProductSaleReport extends Component {

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
            LArrColumn = [],
            LObj = {};

        LArrColumn = [
            {
                field: 'productName',
                headerName: 'Name',
                headerClassName: 'tsGridHeader',
                flex: 1,
                minWidth: 200
            },
            {
                field: 'soldQty',
                headerName: 'Sold Quantity',
                headerClassName: 'tsGridHeader',
                // flex: 1,
                width: 165,
                cellClassName: 'tsGridSuccessCell'
            },
            {
                field: 'hsn',
                headerName: 'HSN Code',
                headerClassName: 'tsGridHeader',
                // flex: 1,
                width: 150
            },
            {
                field: 'gst',
                headerName: 'GST',
                headerClassName: 'tsGridHeader',
                // flex: 1,
                width: 150
            },
        ];

        //Getting custom fields
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
            });//forEach
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

        LUrl = BaseUrl() + 'statement/productsale';

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

    pvtFetchProductsFields(p_InvoiceType, p_callBack) {
        /**
         * @method pvtFetchProductsFields
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var //LMe = this,
            LUrl,
            LInvoiceType = p_InvoiceType;

        LUrl = BaseUrl() + 'customFields/type/' + GenConstants().PRODUCT_CSTM_FIELDS + '/' + LInvoiceType;

        var LRequestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            }
        };

        // No need to check for session
        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {

                    if (isEmpty(p_callBack) === false) {

                        p_callBack(responseJson);
                    }//if..
                },
                (error) => {
                    p_callBack([]);
                }
            );
    }

    pvtGetDialogContent(p_objRecord) {

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
                            Check product-wise sales. Double click on product for stock details.
                        </Box>
                    </div>
                </Box>

                <TReport
                    PGetGridColumn={LMe.pvtGetGridColumn}
                    PFetchProductDetails={LMe.pvtFetchProductDetails}
                    PFetchProductsFields={LMe.pvtFetchProductsFields}
                    PGetDialogContent={LMe.pvtGetDialogContent}
                    PChartConfig={{
                        lineDataKey: 'soldQty',
                        xAxisDataKey: 'productName',
                        dispName: 'Sold Item Quantity'
                    }}
                />
            </div>
        );
    }
}

export default tsfrmProductSaleReport;