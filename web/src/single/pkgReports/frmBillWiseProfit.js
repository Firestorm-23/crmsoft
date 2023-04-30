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
import TGSTUtils from '../pkgGST/clsGSTUtils';
import TInvoiceDlg from '../pkgInvoice/tsfrmSingleInvoice';

class frmBillWiseProfit extends Component {

    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            SIsDialogOpen: false
        };
    }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         *
         */
        // var LMe = this
    }

    pvtGetGridColumn(p_arrFields) {
        /**
         * @method pvtGetGridColumn
         * This method will return the grid column json
         */

        // var LMe = this;

        return new TGSTUtils().GetInvoiceWiseProfitColumns();
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

        LUrl = BaseUrl() + 'statement/invoicewiseprofit';

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

        p_callBack([]);
    }

    pvtGetDialog() {

        var LMe = this;

        if (LMe.state.SIsDialogOpen === false) {
            return <></>;
        }

        return <TInvoiceDlg
            IsDialogOpen={LMe.state.SIsDialogOpen}
            OnDialogClose={() => LMe.setState({ SIsDialogOpen: false })}
            PSelectedRecord={LMe.FSelectedRecord}
            PIsReadOnlyMode={true}
            PIsDetailedView={true}
        />;
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
                            Check invoices wise profit report. Double click on invoice to view or print invoice.
                        </Box>
                    </div>
                </Box>

                <TReport
                    PGetGridColumn={LMe.pvtGetGridColumn}
                    PFetchProductDetails={LMe.pvtFetchProductDetails}
                    PFetchProductsFields={LMe.pvtFetchStocksFields}
                    PGetDialogContent={() => { }}
                    POnDblClick={(p_objSelectedRecord) => {

                        LMe.FSelectedRecord = p_objSelectedRecord || {};
                        LMe.setState({ SIsDialogOpen: true });
                    }}
                    PCanAddPsudoNodeInInvoiceType={false}
                    PChartConfig={{
                        lineDataKey: 'ProfitPerInvoice',
                        xAxisDataKey: 'invoiceNo',
                        dispName: 'Total Profit'
                    }}
                />

                {LMe.pvtGetDialog()}
            </div>
        );
    }
}

export default frmBillWiseProfit;