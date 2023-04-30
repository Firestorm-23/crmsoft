import React, { Component } from 'react';

import {
    Paper,
    TextField,
    Button
} from '@material-ui/core';

import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';

import TDialog from './tsclsDialog';
import TLoading from './tsclsLoading';
import TChart from './tscmpChart';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { GenConstants } from '../tsclsGenConstants';
import {
    tsGetDefaultFromDate, tsGetDefaultToDate, isEmpty, isObjEmpty,
    // tsGetInvoiceDispNameByActionCode, tsGetDateFromServerDateForInpField,
    // tsGetInvoiceDispNoByInvoiceNo, tsStatementPrint, tsGenerateStatement
} from '../tsclsGenUtils';

import TInvoiceType from './tscmpInvoiceType';

import AssessmentIcon from '@material-ui/icons/Assessment';
import AppsIcon from '@material-ui/icons/Apps';

class tsfrmReports extends Component {

    constructor(props) {

        super(props);

        var LMe = this;

        LMe.state = {
            FetchedData: [],
            SColumnData: [],
            fromDate: '',
            toDate: '',
            SInvoiceType: GenConstants().PESTICIDE_ACT_CODE,
            IsAlertDialogOpen: false,
            SLoading: false,
            IsProductDialogOpen: false,
            SIsChartView: false
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

        LMe.pvtSetDefaultValuesInFilter();

        setTimeout(() => {
            LMe.pvtGenerateReport();
        }, 100);
    }

    pvtSetDefaultValuesInFilter() {
        /**
         * @method pvtSetDefaultValuesInFilter
         * This method will set the default from date and to date for this form.
         * From date will be 1st date of month
         * End date will be today'date
         */
        var LMe = this;

        LMe.setState({
            toDate: tsGetDefaultToDate(),
            fromDate: tsGetDefaultFromDate(),
            SIsChartView: LMe.props.PIsChartView || false
        });
    }

    pvtHandleOnRowClick(p_objSelectedRecord) {
        /**
         * @method pvtHandleOnRowClick: This function will set the selected row record as a class level.
         *
         * @param{p_objSelectedRecord}: Selected Record
         * @return: Nothing
         */
        var LMe = this;

        //Not in used for now
        LMe.FSelectedRecord = p_objSelectedRecord;
    }

    pvtValidate() {
        /**
         * @method pvtValidate
         * Validate the form
         */
        var LMe = this;

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

    pvtGenerateReport() {
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

        var LParamObj = {
            fromDate: LMe.state.fromDate,
            toDate: LMe.state.toDate,
            invoiceType: LMe.state.SInvoiceType
        };

        LMe.props.PFetchProductDetails(LParamObj, function (p_objResponse, p_ParamObj) {

            if (p_objResponse.success === false) {
                LMe.setState({
                    FetchedData: [],
                });
                return;
            }//if..

            LMe.props.PFetchProductsFields(LMe.state.SInvoiceType, function (p_columnData) {

                if (p_columnData.status === false) {
                    LMe.setState({
                        FetchedData: [],
                    });
                    return;
                }

                LMe.setState({
                    FetchedData: p_objResponse,
                    SColumnData: LMe.props.PGetGridColumn(p_columnData)
                });
            });
        });
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
    }

    pvtHandleOnRowDoubleClick(p_objSelectedRecord) {

        var LMe = this;

        if (isEmpty(LMe.props.POnDblClick) === false) {

            LMe.props.POnDblClick(p_objSelectedRecord);
            return;
        }

        LMe.setState({ IsProductDialogOpen: true });
    }

    pvtGetProductDialog() {
        var LMe = this;

        if (LMe.props.CanShowDetailedView === false) {

            return <></>;
        }//if

        if (LMe.state.IsProductDialogOpen === false || isObjEmpty(LMe.FSelectedRecord) === true) {
            return <></>;
        }

        return (
            <TDialog
                IsDialogOpen={LMe.state.IsProductDialogOpen}
                OnDialogClose={() => LMe.setState({ IsProductDialogOpen: false })}
                DialogContent={LMe.props.PGetDialogContent(LMe.FSelectedRecord)}
                DialogActions={() => { }}
                DialogHeader={'Quick Product Info'}
                DialogLoading={false}
                IsWindow={true}
            />
        );
    }



    pvtGetChart() {

        var LMe = this;
        return (
            <Paper style={{ padding: '20px 20px 20px 0' }} className="flex1 tsHBox" variant="outlined">
                <TChart
                    PRecords={LMe.state.FetchedData || []}
                    PChartConfig={LMe.props.PChartConfig}
                />
            </Paper>
        );
    }

    pvtGetGridView() {

        var LMe = this;

        return (
            // 
            <DataGrid
                columns={LMe.state.SColumnData || []}
                rows={LMe.state.FetchedData || []}
                ref={LMe.FGridRef}
                // rowHeight={50}
                pagination
                // pageSize={10}
                csvOptions={{ allColumns: true }}
                loading={LMe.state.FetchedData === null ? true : false}
                // sortModel={LMe.state.SortModel}
                // onSortModelChange={(model) => LMe.setState({SortModel: model})}

                density={'compact'}
                onCellDoubleClick={(params) =>
                    LMe.pvtHandleOnRowDoubleClick(params.row)
                }
                components={{
                    Toolbar: GridToolbar,
                }}
                hideFooter
                onRowClick={(e) => LMe.pvtHandleOnRowClick(e.row)}
            />
            // 
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
                <Paper style={{ margin: '0 20px 0 20px' }} className="tsHBox" variant="outlined">

                    <div style={{ margin: '45px 0 0 20px' }}>
                        <TInvoiceType
                            Value={LMe.state.SInvoiceType}
                            OnChange={p_value => LMe.pvtHandleOnInvoiceTypeChange(p_value)}
                            EmptyText={'Product Type'}
                            CanAddPsudoNode={LMe.props.PCanAddPsudoNodeInInvoiceType || false}
                        >
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
                            LMe.pvtGenerateReport()
                        }}
                    >
                        Generate
                    </Button>
                    {/* <Button
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
                        Generate and Print
                    </Button>

                    <Button
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
                        Generate PDF
                    </Button> */}

                    <div className="flex1"></div>
                    {/* <div>
                        <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            disableElevation
                            style={{ margin: '40px 20px 30px 10px' }}
                            startIcon={LMe.state.SIsChartView === false ? <AssessmentIcon /> : <AppsIcon />}
                            onClick={() => LMe.setState({ SIsChartView: !LMe.state.SIsChartView })}
                        >
                            {LMe.state.SIsChartView === false ? 'Chart View' : 'Grid View'}
                        </Button>
                    </div> */}

                    <div style={{ margin: '33px 20px 0 10px' }}>
                        <ToggleButtonGroup
                            value={LMe.state.SIsChartView ? 'chart' : 'grid'}
                            onChange={() => LMe.setState({ SIsChartView: !LMe.state.SIsChartView })}
                            exclusive={true}
                            size="small"
                        >
                            <ToggleButton title="Switch to Grid View" value="grid">
                                <AppsIcon />
                            </ToggleButton>
                            <ToggleButton title="Switch to Chart View" value="chart">
                                <AssessmentIcon />
                            </ToggleButton>

                        </ToggleButtonGroup>
                    </div>
                </Paper>
                <div
                    style={{ margin: '5px 20px 0 20px' }}
                    className="flex1 tsVBox"
                >
                    {LMe.state.SIsChartView ? LMe.pvtGetChart() : LMe.pvtGetGridView()}
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
                {LMe.pvtGetProductDialog()}
            </div>
        );
    }
}

export default tsfrmReports;