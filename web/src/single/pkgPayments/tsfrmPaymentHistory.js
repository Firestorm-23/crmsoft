import React, { Component } from 'react';
import {
    Box,
    Toolbar,
    IconButton,
    Tooltip,
    Paper,
    TextField,
    Button
} from '@material-ui/core';
import {
    BaseUrl, isEmpty, tsGetInvoiceDispNameByActionCode, tsGeneratePaymentInvoice,
    // tsIsInvoiceByType, tsPrint,
    tsGetDateFromServerDateForInpField, tsGetInvoiceDispNoByInvoiceNo, tsPaymentPrint, tsGetDefaultFromDate,
    tsGetDefaultToDate,
    tsGetProjectId
} from '../../tsclsGenUtils';
import HistoryIcon from '@material-ui/icons/History';
import RefreshIcon from '@material-ui/icons/Refresh';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import TInvoiceType from '../../reusable/tscmpInvoiceType';
import { GenConstants } from '../../tsclsGenConstants';
import PrintIcon from '@material-ui/icons/Print';
import TDialog from '../../reusable/tsclsDialog';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import TLoading from '../../reusable/tsclsLoading';

class tsfrmPaymentHistory extends Component {
    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            FetchedData: null,
            SInvoiceType: GenConstants().PSUDO_INVOICE_TYPE_ALL,
            IsAlertDialogOpen: false,
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
         */
        var LMe = this;

        LMe.pvtSetDefaultFromDateAndToDate();

        setTimeout(() => {

            LMe.pvtFetchPaymentDetails();
        }, 200);
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

        LMe.pvtFetchPaymentDetails();
    }

    pvtFetchPaymentDetails(p_strInvoiceType) {
        /**
         * @method pvtFetchProducts
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var LMe = this,
            LUrl = BaseUrl() + 'payments';

        p_strInvoiceType = p_strInvoiceType || LMe.state.SInvoiceType;

        if (isEmpty(p_strInvoiceType) === false && p_strInvoiceType !== GenConstants().PSUDO_INVOICE_TYPE_ALL) {

            LUrl = BaseUrl() + 'payments/type/' + p_strInvoiceType;
        }//if..

        var LParamObj = {
            fromDate: LMe.state.fromDate,
            toDate: LMe.state.toDate,
            invoiceType: p_strInvoiceType
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
                    if (responseJson.status === true) {
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
        // LMe.pvtFetchPaymentDetails(p_actCodeInvoiceType);
    }

    pvtPrint() {
        var LMe = this;

        if (isEmpty(LMe.FSelectedRecord) === true) {
            LMe.FWarningText = 'Select a Record and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..


        //This will print the invoice
        // if (tsIsInvoiceByType(LMe.FSelectedRecord.invoiceType) === true) {

        //     tsPrint(LMe.FSelectedRecord.invoiceType, LMe.FSelectedRecord.invoiceNo);
        //     return;
        // }

        tsPaymentPrint(LMe.FSelectedRecord.id);
    }

    pvtGeneratePDF() {
        var LMe = this;

        if (isEmpty(LMe.FSelectedRecord) === true) {
            LMe.FWarningText = 'Select a Record and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..

        LMe.setState({ SLoading: true });

        tsGeneratePaymentInvoice(LMe.FSelectedRecord.id, function (p_objResponseJson) {

            LMe.setState({ SLoading: false });

            if (p_objResponseJson.success === false) {

                LMe.FWarningText = p_objResponseJson.message;
                LMe.setState({ IsAlertDialogOpen: true });
            }//if..
        });
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
                        <HistoryIcon />
                    </div>
                    <div style={{ margin: '18px 6px 0 0' }}>
                        {/* Module Title */}
                        <div style={{ fontSize: '20px' }}> {LMe.props.moduleInfo.displayTxt} </div>

                        {/* Module Description */}
                        <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
                            Here you can see the payment history.
                        </Box>
                    </div>
                </Box>

                <Paper style={{ margin: '0 20px 0 20px' }} className="tsHBox" variant="outlined">

                    <div style={{ margin: '45px 0 0 20px' }}>
                        <TInvoiceType
                            Value={LMe.state.SInvoiceType}
                            OnChange={p_value => LMe.pvtHandleOnInvoiceTypeChange(p_value)}
                            EmptyText={'Invoice Type'}
                            CanAddPsudoNode={true}
                            PCanShowSystemTypes={true}
                        ></TInvoiceType>
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
                    style={{ margin: '5px 0 0 0px' }}
                    component="div"
                    variant="dense"
                >

                    <IconButton
                        style={{ margin: '0 15px 0 0' }}
                        aria-label="Refresh"
                        onClick={() => LMe.pvtRefresh()}
                    >
                        <Tooltip title="Refresh">
                            <RefreshIcon />
                        </Tooltip>
                    </IconButton>

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
                    // title="Print"    
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
                                field: 'cstName',
                                headerName: 'Name',
                                headerClassName: 'tsGridHeader',
                                minWidth: 200,
                                color: 'primary'
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
                                field: 'mode',
                                headerName: 'Mode of Payment',
                                headerClassName: 'tsGridHeader',
                                minWidth: 200,
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
                            },
                        ]}
                        rows={LMe.state.FetchedData || []}
                        ref={LMe.FGridRef}
                        // rowHeight={50}
                        // pagination
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
                            LMe.pvtHandleOnRowClick(params.row)
                        }
                        // hideFooter
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
            </div>
        );
    }
}

export default tsfrmPaymentHistory;
