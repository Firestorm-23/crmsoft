import React, { Component } from 'react';
import {
    Box,
    TextField,
    Paper,
    Button
} from '@material-ui/core';
import {
    tsGetDefaultFromDate, tsGetDefaultToDate, BaseUrl, tsPaymentPrint,
    isEmpty, tsGetInvoiceDispNameByActionCode, tsGetDateFromServerDateForInpField,
    tsGetInvoiceDispNoByInvoiceNo, tsStatementPrint, tsGenerateStatement, tsGetProjectId
} from '../../tsclsGenUtils';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import { GenConstants } from '../../tsclsGenConstants';
import TCustomerSelectionCntr from '../../reusable/tsfrmCustomerSelectionCntr';
import TDialog from '../../reusable/tsclsDialog';
import PrintIcon from '@material-ui/icons/Print';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import TLoading from '../../reusable/tsclsLoading';
import TInvoiceDlg from '../pkgInvoice/tsfrmSingleInvoice';
import TSuplierInvoiceDlg from '../pkgSupplier/tsfrmSingleInvoice';

class tsfrmCustomerStatement extends Component {

    constructor(props) {

        super(props);

        var LMe = this;

        LMe.state = {
            FetchedData: [],
            cstId: -1,
            fromDate: '',
            toDate: '',
            IsAlertDialogOpen: false,
            SLoading: false,
            SIsInvoiceDlgOpen: false,
            SIsSupplierInvoiceDlgOpen: false
        };

        LMe.FWarningText = '';
    }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         *
         */
        var LMe = this;

        LMe.pvtSetDefaultFromDateAndToDate();
    }

    pvtSetDefaultFromDateAndToDate() {
        /**
         * @method pvtSetDefaultFromDateAndToDate
         * This method will set the default from date and to date for this form.
         * From date will be 1st date of month
         * End date will be today'date
         */
        var LMe = this;

        LMe.setState({
            toDate: tsGetDefaultToDate(),
            fromDate: tsGetDefaultFromDate()
        });

    }

    pvtValidate() {
        /**
         * @method pvtValidate
         * Validate the form
         */
        var LMe = this;

        if (isEmpty(LMe.state.cstId) === true || LMe.state.cstId === -1) {
            LMe.FWarningText = 'Select a Customer and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        if (isEmpty(LMe.state.fromDate) === true) {
            LMe.FWarningText = 'Enter from date and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        if (isEmpty(LMe.state.toDate) === true) {
            LMe.FWarningText = 'Enter to date and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        var LFromDate = new Date(LMe.state.fromDate),
            LToDate = new Date(LMe.state.toDate);

        if (LFromDate > LToDate) {
            LMe.FWarningText = 'From date must be less than than To date.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        return true;
    }

    pvtGeneratePDF() {
        var LMe = this;

        if (LMe.pvtValidate() === false) {

            return;
        }

        LMe.FSelectedRecord = null;

        LMe.setState({ SLoading: true });

        LMe.pvtFetchPaymentDetails(function (p_ParamObj) {

            tsGenerateStatement(p_ParamObj.cstId, p_ParamObj.fromDate, p_ParamObj.toDate, function (p_objResponseJson) {

                LMe.setState({ SLoading: false });

                if (p_objResponseJson.success === false) {

                    LMe.FWarningText = p_objResponseJson.message;
                    LMe.setState({ IsAlertDialogOpen: true });
                }//if..
            });
        });
    }

    pvtGenerateReport(p_canPrint) {
        /**
         * @method pvtGenerateReport
         * This function will refresh the grid, generate the customer's report
         *
         * @returns: Nothing
         */

        var LMe = this;

        if (LMe.pvtValidate() === false) {

            return;
        }

        LMe.FSelectedRecord = null;

        LMe.setState({
            FetchedData: null,
        });

        LMe.pvtFetchPaymentDetails(function (p_ParamObj) {

            if (p_canPrint) {

                tsStatementPrint(p_ParamObj.cstId, p_ParamObj.fromDate, p_ParamObj.toDate);
            }
        });
    }

    pvtFetchPaymentDetails(p_callBack) {
        /**
         * @method pvtFetchProducts
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var LMe = this,
            LParamObj,
            LRequestOptions,
            LUrl;

        LUrl = BaseUrl() + 'statement/customers';

        LParamObj = {
            cstId: LMe.state.cstId,
            fromDate: LMe.state.fromDate,
            toDate: LMe.state.toDate
        };

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
                    if (responseJson.success === false) {
                        LMe.setState({
                            FetchedData: [],
                        });
                        return;
                    }//if..

                    LMe.setState({
                        FetchedData: responseJson
                    });

                    if (isEmpty(p_callBack) === false) {

                        p_callBack(LParamObj);
                    }
                },
                (error) => {
                    this.setState({
                        FetchedData: [],
                    });
                }
            );
    }

    pvtHandleOnRowClick(p_objSelectedRecord) {
        /**
         * INTENT: This function will set the selected row record as a class level.
         *
         * @param: Selected Record
         * @return: Nothing
         */
        var LMe = this;

        LMe.FSelectedRecord = p_objSelectedRecord;
    }

    pvtHandleOnRowDblClick(p_objSelectedRecord) {
        var LMe = this;

        //If payment invoice
        if (isEmpty(p_objSelectedRecord.invoiceNo) === true) {

            tsPaymentPrint(p_objSelectedRecord.id);
            return;
        }//if..

        //If supplier/purchaser invoice
        if (p_objSelectedRecord.isPurchaserInvoice === 1) {

            LMe.setState({ SIsSupplierInvoiceDlgOpen: true });
            return;
        }//if..

        //If normal invoice
        LMe.setState({ SIsInvoiceDlgOpen: true });
    }

    pvtGetInvoiceDialog() {

        var LMe = this;

        if (LMe.state.SIsInvoiceDlgOpen === false) {
            return <></>;
        }

        return <TInvoiceDlg
            IsDialogOpen={LMe.state.SIsInvoiceDlgOpen}
            OnDialogClose={() => LMe.setState({ SIsInvoiceDlgOpen: false })}
            PSelectedRecord={LMe.FSelectedRecord}
            PIsReadOnlyMode={true}
            PIsDetailedView={true}
        />;
    }

    pvtGetSupplierInvoiceDialog() {

        var LMe = this;

        if (LMe.state.SIsSupplierInvoiceDlgOpen === false) {
            return <></>;
        }

        return <TSuplierInvoiceDlg
            IsDialogOpen={LMe.state.SIsSupplierInvoiceDlgOpen}
            OnDialogClose={() => LMe.setState({ SIsSupplierInvoiceDlgOpen: false })}
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
                        <AssignmentIcon />
                    </div>
                    <div style={{ margin: '18px 6px 0 0' }}>
                        {/* Module Title */}
                        <div style={{ fontSize: '20px' }}> {LMe.props.moduleInfo.displayTxt} </div>

                        {/* Module Description */}
                        <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
                            Generate the customer's statement. Double click on invoice to view or print invoice.
                        </Box>
                    </div>
                </Box>
                <Paper style={{ margin: '0 20px 0 20px' }} className="tsHBox" variant="outlined">

                    <div style={{ margin: '13px 0 0 0' }}>
                        <TCustomerSelectionCntr
                            SetCstId={(p_intCustomerId) => LMe.setState({ cstId: p_intCustomerId })}
                            PCanShowHeaderLabel={false}
                        ></TCustomerSelectionCntr>
                    </div>

                    <TextField
                        label={'From Date'}
                        type="date"
                        margin="dense"
                        style={{ margin: '29px 0 0 0' }}
                        value={LMe.state.fromDate}
                        InputLabelProps={{
                            shrink: true
                        }}
                        required={true}
                        onChange={(e) => {

                            LMe.setState({ fromDate: e.currentTarget.value })
                        }}
                    />

                    <TextField
                        label={'To Date'}
                        type="date"
                        margin="dense"
                        style={{ margin: '29px 0 0 20px' }}
                        value={LMe.state.toDate}
                        InputLabelProps={{
                            shrink: true
                        }}
                        required={true}
                        onChange={(e) => {

                            LMe.setState({ toDate: e.currentTarget.value })
                        }}
                    />
                    {/* <div className="flex1"> </div> */}
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        disableElevation
                        style={{ margin: '40px 0 30px 30px' }}
                        onClick={() => {
                            LMe.pvtGenerateReport()
                        }}
                    >
                        Generate
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        disableElevation
                        style={{ margin: '40px 0 30px 10px' }}
                        startIcon={<PrintIcon />}
                        onClick={() => {
                            LMe.pvtGenerateReport(true)
                        }}
                    >
                        Print
                    </Button>

                    {/* <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        disableElevation
                        style={{ margin: '40px 20px 30px 10px' }}
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => {
                            LMe.pvtGeneratePDF(true)
                        }}
                    >
                        PDF
                    </Button> */}
                </Paper>
                <div
                    style={{ margin: '5px 20px 20px 20px' }}
                    className="flex1"
                >
                    <DataGrid
                        columns={[
                            {
                                field: 'paymentDate',
                                headerName: 'Date',
                                headerClassName: 'tsGridHeader',
                                minWidth: 180,
                                color: 'primary',
                                sort: 'asc',
                                renderCell: (params) => {

                                    return tsGetDateFromServerDateForInpField(params.value);
                                },
                            },
                            {
                                field: 'invoiceType',
                                headerName: 'Invoice Type',
                                headerClassName: 'tsGridHeader',
                                minWidth: 157,
                                renderCell: (params) => (
                                    <span>
                                        {tsGetInvoiceDispNameByActionCode(params.value)}
                                    </span>
                                ),
                            },
                            {
                                field: 'invoiceNo',
                                headerName: 'Invoice Number',
                                headerClassName: 'tsGridHeader',
                                minWidth: 157,
                                renderCell: (params) => {
                                    //If invoiceNo is 0 or null then return the payment Id as its not invoice
                                    var LInvoiceNo = params.value || params.getValue(params.id, 'id');

                                    return <span>
                                        {tsGetInvoiceDispNoByInvoiceNo(LInvoiceNo, params.getValue(params.id, 'invoiceType'), params.getValue(params.id, 'isPurchaserInvoice'))}
                                    </span>
                                },
                            },
                            {
                                field: 'mode',
                                headerName: 'Mode of Payment',
                                headerClassName: 'tsGridHeader',
                                minWidth: 200,
                            },
                            {
                                field: 'total',
                                headerName: 'Total',
                                headerClassName: 'tsGridHeader',
                                minWidth: 150,
                                renderCell: (params) => {
                                    return 'Rs. ' + params.value;
                                },
                            },
                            {
                                field: 'credit',
                                headerName: 'Credit',
                                headerClassName: 'tsGridHeader',
                                minWidth: 150,
                                renderCell: (params) => {
                                    return 'Rs. ' + params.value;
                                },
                            },
                            {
                                field: 'debit',
                                headerName: 'Debit',
                                headerClassName: 'tsGridHeader',
                                minWidth: 150,
                                renderCell: (params) => {
                                    return 'Rs. ' + params.value;
                                },
                            },
                            {
                                field: 'balance',
                                headerName: 'Balance',
                                headerClassName: 'tsGridHeader',
                                minWidth: 150,
                                renderCell: (params) => {
                                    return 'Rs. ' + params.value;
                                },
                            },
                            {
                                field: 'remark',
                                headerName: 'Remark',
                                headerClassName: 'tsGridHeader',
                                minWidth: 250,
                                renderCell: (params) => {
                                    var LValue = params.value;

                                    return <span title={LValue}>{LValue}</span>;
                                },
                            }
                        ]}
                        rows={LMe.state.FetchedData || []}
                        ref={LMe.FGridRef}
                        // rowHeight={50}
                        pagination
                        // pageSize={10}
                        csvOptions={{ allColumns: true }}
                        loading={LMe.state.FetchedData === null ? true : false}
                        // sortModel={LMe.state.SortModel}
                        // onSortModelChange={(model) => LMe.setState({SortModel: model})}
                        components={{
                            Toolbar: GridToolbar,
                        }}
                        density={'compact'}
                        onCellDoubleClick={(params) =>
                            LMe.pvtHandleOnRowDblClick(params.row)
                        }
                        hideFooter
                        onRowClick={(e) => LMe.pvtHandleOnRowClick(e.row)}
                    />
                </div>
                <TDialog
                    IsDialogOpen={LMe.state.IsAlertDialogOpen}
                    OnDialogClose={() => LMe.setState({ IsAlertDialogOpen: false })}
                    DialogContent={LMe.FWarningText || ''}
                    DialogActions={<></>}
                    DialogHeader={'Warning'}
                    IsWindow={false}
                />
                <TLoading
                    PLoadingText={'Generating PDF document, please wait...'}
                    PIsLoading={LMe.state.SLoading}
                    POnStopLoading={() => LMe.setState({ SLoading: false })}
                />

                {LMe.pvtGetInvoiceDialog()}
                {LMe.pvtGetSupplierInvoiceDialog()}
            </div>
        );
    }
}

export default tsfrmCustomerStatement;
