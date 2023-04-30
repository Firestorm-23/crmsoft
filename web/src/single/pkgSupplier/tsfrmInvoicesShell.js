import React, { Component } from 'react';
import {
    Box,
    Toolbar,
    IconButton,
    Button,
    Tooltip,
    Paper,
    TextField
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import {
    BaseUrl, isEmpty, tsGetInvoiceDispNameByActionCode, tsPrintSupplierInvoice, tsGenerateSupplierInvoicePDF,
    tsGetDateFromServerDateForInpField, tsGetInvoiceDispNoByInvoiceNo, tsGetDefaultFromDate, tsGetDefaultToDate, tsGetProjectId
} from '../../tsclsGenUtils';
import RestorePageIcon from '@material-ui/icons/RestorePage';
import RefreshIcon from '@material-ui/icons/Refresh';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import TInvoiceType from '../../reusable/tscmpInvoiceType';
import { GenConstants } from '../../tsclsGenConstants';
import TInvoiceDlg from './tsfrmSingleInvoice';
import TDialog from '../../reusable/tsclsDialog';
import PrintIcon from '@material-ui/icons/Print';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import TLoading from '../../reusable/tsclsLoading';

class tsfrmInvoicesShell extends Component {
    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            FetchedData: null,
            SInvoiceType: '',
            SIsDialogOpen: false,
            IsAlertDialogOpen: false,
            SIsDialogOpenInReadOnlyMode: true,
            IsCnfrmDialogOpen: false,
            SLoading: false,
            fromDate: '',
            toDate: ''
        };
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

        setTimeout(() => {
            LMe.pvtFetchInvoices();
        }, 100);
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

    pvtRefresh() {
        /**
         * @method pvtRefresh
         * This function will refresh the grid
         *
         * @returns: Nothing
         */
        var LMe = this;

        LMe.FSelectedRecord = null;

        LMe.setState({
            FetchedData: null,
        });

        LMe.pvtFetchInvoices();
    }

    pvtFetchInvoices(p_strInvoiceType) {
        /**
         * @method pvtFetchProducts
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var LMe = this,
            LUrl = BaseUrl() + 'supplierinvoices';

        p_strInvoiceType = p_strInvoiceType || LMe.state.SInvoiceType;

        if (isEmpty(p_strInvoiceType) === true) {

            return;
        }//if..

        if (isEmpty(p_strInvoiceType) === false && p_strInvoiceType !== GenConstants().PSUDO_INVOICE_TYPE_ALL) {

            LUrl = BaseUrl() + 'supplierinvoices/type/' + p_strInvoiceType;
        }//if..

        var LParamObj = {
            fromDate: LMe.state.fromDate,
            toDate: LMe.state.toDate,
            invoiceType: LMe.state.SInvoiceType
        };

        if (isEmpty(LParamObj.fromDate) === true || isEmpty(LParamObj.toDate) === true) {

            return;
        }

        var LRequestOptions = {
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
                    if (responseJson.status === false) {

                        LMe.setState({
                            FetchedData: [],
                        });
                        return;
                    }//if..

                    LMe.setState({
                        FetchedData: responseJson
                    });
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

    pvtHandleOnInvoiceTypeChange(p_actCodeInvoiceType) {
        /**
         * @method pvtHandleOnInvoiceTypeChange
         * 
         * @param {p_actCodeInvoiceType}: Action code for invoice type
         */
        var LMe = this;

        LMe.setState({ SInvoiceType: p_actCodeInvoiceType });

        LMe.FSelectedRecord = null;
        // LMe.pvtFetchInvoices(p_actCodeInvoiceType);
    }

    pvtLoadDialog() {
        /**
         * @method pvtLoadDialog
         * This method will loads the Dialog
         */
        var LMe = this;

        if (LMe.state.SIsDialogOpen === false) {

            return <></>;
        }

        return <TInvoiceDlg
            IsDialogOpen={LMe.state.SIsDialogOpen}
            OnDialogClose={() => LMe.setState({ SIsDialogOpen: false })}
            PSelectedRecord={LMe.FSelectedRecord}
            PIsReadOnlyMode={LMe.state.SIsDialogOpenInReadOnlyMode}
            PIsDetailedView={true}
        />;
    }

    pvtOpenInvoice(p_boolIsReadOnlyMode) {
        var LMe = this;

        if (isEmpty(LMe.FSelectedRecord) === true) {
            LMe.FWarningText = 'Select a Invoice and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..

        LMe.setState({
            SIsDialogOpen: true,
            SIsDialogOpenInReadOnlyMode: p_boolIsReadOnlyMode
        });
    }

    pvtHandleOnEditButtonClick() {
        var LMe = this;

        if (isEmpty(LMe.FSelectedRecord) === true) {
            LMe.FWarningText = 'Select a Invoice and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..

        LMe.pvtOpenInvoice(false);
    }

    pvtHandleOnViewInvoice() {
        var LMe = this;

        if (isEmpty(LMe.FSelectedRecord) === true) {
            LMe.FWarningText = 'Select a Invoice and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..

        LMe.pvtOpenInvoice(true);
    }

    pvtPrint() {
        var LMe = this;

        if (isEmpty(LMe.FSelectedRecord) === true) {
            LMe.FWarningText = 'Select a Invoice and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..


        tsPrintSupplierInvoice(LMe.FSelectedRecord.invoiceType, LMe.FSelectedRecord.invoiceNo);
        // var LWindow = window.open('/singleInvoice/' + LMe.FSelectedRecord.invoiceType + '/' + LMe.FSelectedRecord.invoiceNo);

        // LWindow.onload = function () {

        //     setTimeout(function () {
        //         LWindow.print();
        //     }, 100);
        // }
    }

    pvtGeneratePDF() {
        var LMe = this;

        if (isEmpty(LMe.FSelectedRecord) === true) {
            LMe.FWarningText = 'Select a Invoice and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..

        LMe.setState({ SLoading: true });

        tsGenerateSupplierInvoicePDF(LMe.FSelectedRecord.invoiceType, LMe.FSelectedRecord.invoiceNo, function (p_objResponseJson) {

            LMe.setState({ SLoading: false });

            if (p_objResponseJson.success === false) {

                LMe.FWarningText = p_objResponseJson.message;
                LMe.setState({ IsAlertDialogOpen: true });
            }//if..
        });
    }

    pvtHandleOnDeleteButtonClick() {
        var LMe = this;

        if (isEmpty(LMe.FSelectedRecord) === true) {
            LMe.FWarningText = 'Select a record and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..

        LMe.FCnfrmText = "Are you sure want to delete this invoice?";

        LMe.F_callBackOnCnfrmTrue = LMe.pvtDelete;
        LMe.setState({ IsCnfrmDialogOpen: true });
    }

    pvtDelete() {
        var LMe = this,
            LArrFetchedData,
            LArrResponse = [],
            LRequestOptions,
            LUrl;

        if (isEmpty(LMe.FSelectedRecord) === true) {
            LMe.FWarningText = 'Select a Invoice and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..

        // eslint-disable-next-line no-useless-concat
        LUrl = BaseUrl() + 'supplierinvoices' + '/' + LMe.FSelectedRecord.invoiceNo + '/' + LMe.FSelectedRecord.invoiceType;

        LArrFetchedData = LMe.state.FetchedData || [];
        // This will start the loading
        LMe.setState({ FetchedData: [] });

        LRequestOptions = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify(LMe.FSelectedRecord),
        };

        // fire command
        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.success === false) {
                        LMe.FWarningText = responseJson.message;

                        LMe.setState({
                            FetchedData: LArrFetchedData,
                            IsCnfrmDialogOpen: false,
                            IsAlertDialogOpen: true
                        });

                        return;
                    }
                    LMe.FSelectedRecord = null;

                    LArrFetchedData.forEach(function (p_objRecord) {
                        //Record if exists
                        if (p_objRecord.invoiceNo === parseInt(responseJson.invoiceNo)) {
                            //remove deleted record
                            return true; //continue
                        } //if..

                        LArrResponse.push(p_objRecord);
                    }); //forEach...

                    // Update state.
                    LMe.setState({ FetchedData: LArrResponse, IsCnfrmDialogOpen: false });
                },
                (error) => {
                    this.setState({
                        FetchedData: [],
                        IsCnfrmDialogOpen: false
                    });
                }
            );
    }

    pvtGetWarningDlgAction(p_canShowWarningIcon) {
        var LMe = this;
        if (p_canShowWarningIcon === true) {
            return (
                <>
                    <Button
                        onClick={() => {

                            if (isEmpty(LMe.F_callBackOnCnfrmTrue) === false) {

                                LMe.F_callBackOnCnfrmTrue();
                            }//if..
                        }}
                        color="primary"
                        variant="contained"
                        size="small"
                    >
                        Confirm
                    </Button>
                </>
            );
        }

        return <></>;
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
                        <RestorePageIcon />
                    </div>
                    <div style={{ margin: '18px 6px 0 0' }}>
                        {/* Module Title */}
                        <div style={{ fontSize: '20px' }}> {LMe.props.moduleInfo.displayTxt} </div>

                        {/* Module Description */}
                        <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
                            Here you can see the invoices.
                        </Box>
                    </div>
                </Box>

                <Paper style={{ margin: '0 20px 0 20px' }} className="tsHBox" variant="outlined">

                    <div style={{ margin: '45px 0 0 20px' }}>
                        <TInvoiceType
                            Value={LMe.state.SInvoiceType}
                            OnChange={p_value => LMe.pvtHandleOnInvoiceTypeChange(p_value)}
                            EmptyText={'Product Type'}>
                        </TInvoiceType>
                    </div>

                    <TextField
                        label={'From Date'}
                        type="date"
                        margin="dense"
                        style={{ margin: '29px 0 0 20px' }}
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
                            LMe.pvtRefresh()
                        }}
                    >
                        Apply Filter
                    </Button>
                </Paper>

                <Toolbar
                    style={{ margin: '0 0 0 0px' }}
                    component="div"
                    variant="dense"
                >
                    <Button
                        size="small"
                        style={{ margin: '0 0 0 0' }}
                        variant="contained"
                        color="primary"
                        disableElevation
                        onClick={() => {
                            LMe.pvtOpenInvoice(true);
                        }}
                    // startIcon={<EditIcon />}
                    >
                        View Invoice
                    </Button>

                    <Button
                        size="small"
                        style={{ margin: '0 0 0 5px' }}
                        variant="outlined"
                        color="primary"
                        disableElevation
                        onClick={() => {
                            LMe.pvtHandleOnEditButtonClick();
                        }}
                        startIcon={<EditIcon />}
                    >
                        Edit Invoice
                    </Button>
                    <Button
                        size="small"
                        style={{ margin: '0 0 0 5px' }}
                        variant="outlined"
                        color="primary"
                        disableElevation
                        onClick={() => {
                            LMe.pvtHandleOnDeleteButtonClick();
                        }}
                        startIcon={<DeleteIcon />}
                    >
                        Delete Invoice
                    </Button>

                    <IconButton
                        style={{ margin: '0 15px 0 0' }}
                        aria-label="Refresh"
                        onClick={() => LMe.pvtRefresh()}
                    >
                        <Tooltip title="Refresh">
                            <RefreshIcon />
                        </Tooltip>
                    </IconButton>

                    {/* <TInvoiceType
                        Value={LMe.state.SInvoiceType}
                        OnChange={p_value => LMe.pvtHandleOnInvoiceTypeChange(p_value)}
                        EmptyText={'Invoice Type'}
                        CanAddPsudoNode={false}
                    ></TInvoiceType> */}
                    <div className="flex1"></div>

                    <IconButton
                        style={{ margin: '0 0 0 0' }}
                        aria-label="Generate PDF"
                        onClick={() => LMe.pvtGeneratePDF()}
                        color="primary"
                    >
                        <Tooltip title="Generate PDF">
                            <PictureAsPdfIcon />
                        </Tooltip>
                    </IconButton>

                    <IconButton
                        style={{ margin: '0 0 0 0' }}
                        aria-label="Print"
                        onClick={() => LMe.pvtPrint()}
                    // color="primary"
                    >
                        <Tooltip title="Print">
                            <PrintIcon />
                        </Tooltip>
                    </IconButton>
                </Toolbar>
                <div
                    style={{ margin: '5px 20px 20px 20px' }}
                    className="flex1"
                >
                    <DataGrid
                        columns={[
                            {
                                field: 'invoiceDate',
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
                                field: 'cstName',
                                headerName: 'Name',
                                headerClassName: 'tsGridHeader',
                                minWidth: 200,
                                flex: 1,
                                color: 'primary'
                            },
                            {
                                field: 'invoiceNo',
                                headerName: 'Invoice No',
                                headerClassName: 'tsGridHeader',
                                minWidth: 145,
                                // hide: true,
                                renderCell: (params) => (
                                    <span>
                                        {tsGetInvoiceDispNoByInvoiceNo(params.value, params.getValue(params.id, 'invoiceType'), 1)}
                                    </span>
                                ),
                            },
                            {
                                field: 'strInvoiceNo',
                                headerName: 'Supplier\'s Invoice No',
                                headerClassName: 'tsGridHeader',
                                minWidth: 220
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
                            LMe.pvtOpenInvoice(true)
                        }
                        onRowClick={(e) => LMe.pvtHandleOnRowClick(e.row)}
                    />
                </div>
                {LMe.pvtLoadDialog()}

                <TDialog
                    IsDialogOpen={LMe.state.IsAlertDialogOpen}
                    OnDialogClose={() => LMe.setState({ IsAlertDialogOpen: false })}
                    DialogContent={LMe.FWarningText || ''}
                    DialogActions={<></>}
                    DialogHeader={'Warning'}
                    IsWindow={false}
                />

                <TDialog
                    IsDialogOpen={LMe.state.IsCnfrmDialogOpen}
                    OnDialogClose={() => LMe.setState({ IsCnfrmDialogOpen: false })}
                    DialogContent={LMe.FCnfrmText || ''}
                    DialogActions={LMe.pvtGetWarningDlgAction(true)}
                    DialogHeader={'Confirm'}
                    IsWindow={false}
                />

                <TLoading
                    PLoadingText={'Generating PDF document, please wait...'}
                    PIsLoading={LMe.state.SLoading}
                    POnStopLoading={() => LMe.setState({ SLoading: false })}
                />
            </div>
        );
    }
}

export default tsfrmInvoicesShell;
