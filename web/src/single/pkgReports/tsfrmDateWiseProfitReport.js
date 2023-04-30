import React, { Component } from 'react';

import {
    Box
} from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import TReport from '../../reusable/tsfrmReports';
import {
    BaseUrl, isEmpty, tsGetProjectId
} from '../../tsclsGenUtils';
// import { GenConstants } from '../../tsclsGenConstants';

class tsfrmDateWiseProfitReport extends Component {

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
                field: 'invoiceLocalDateString',//'invoiceDate',
                headerName: 'Date',
                headerClassName: 'tsGridHeader',
                flex: 1,
                minWidth: 200,
                // renderCell: (params) => {

                //     return tsGetDateFromServerDateForInpField(params.value);
                // },
            },
            {
                field: 'profit',
                headerName: 'Profit / Loss',
                headerClassName: 'tsGridHeader',
                cellClassName: (params) => params.value > 0 ? 'tsGridSuccessCell' : 'tsGridFailureCell',
                flex: 1,
                minWidth: 200,
                renderCell: (params) => {
                    var LValue = params.value;

                    if (LValue > 0) {

                        return <span title='Profit Amount calculated from "Sold Quantity" by "Sold Amount".'>{'Rs. ' + Math.abs(LValue)}</span>;
                    }
                    return <span title='Loss Amount calculated from "Sold Quantity" by "Sold Amount".'>{'Rs. ' + Math.abs(LValue)}</span>;
                }
            }
        ];

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

        LUrl = BaseUrl() + 'statement/profitdatewise';

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
        if (isEmpty(p_callBack) === false) {

            p_callBack([]);
        }//if..
    }

    pvtGetDialogContent(p_objRecord) {

        return <>{JSON.stringify(p_objRecord)}</>;
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
                            Check product wise profit / loss report.
                        </Box>
                    </div>
                </Box>

                <TReport
                    PGetGridColumn={LMe.pvtGetGridColumn}
                    PFetchProductDetails={LMe.pvtFetchProductDetails}
                    PFetchProductsFields={LMe.pvtFetchStocksFields}
                    PGetDialogContent={LMe.pvtGetDialogContent}
                    CanShowDetailedView={false}
                    PCanAddPsudoNodeInInvoiceType={true}
                    PChartConfig={{
                        lineDataKey: 'profit',
                        xAxisDataKey: 'invoiceLocalDateString',
                        dispName: 'Profit Amount'
                    }}
                    PIsChartView={true}
                />
            </div>
        );
    }
}

export default tsfrmDateWiseProfitReport;