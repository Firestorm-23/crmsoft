import React, { Component } from 'react';

import {
    Box, Paper, FormControl, InputLabel, Select, MenuItem, TextField, Button
} from '@material-ui/core';

import EventNoteIcon from '@material-ui/icons/EventNote';
import { GenConstants } from '../../tsclsGenConstants';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import TDialog from '../../reusable/tsclsDialog';
import {
    tsGetDefaultFromDate, tsGetDefaultToDate, isEmpty, BaseUrl, tsGetProjectId, isObjEmpty
} from '../../tsclsGenUtils';

import TGSTUtils from './clsGSTUtils';

class frmGSTR1 extends Component {

    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            SActiveGSTTab: GenConstants().GSTR1,
            IsAlertDialogOpen: false,
            FetchedData: [],
            SColumnData: []
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
            SToDate: tsGetDefaultToDate(),
            SFromDate: tsGetDefaultFromDate()
        });
    }

    pvtValidate() {
        /**
         * @method pvtValidate
         * Validate the form
         */
        var LMe = this;

        if (isEmpty(LMe.state.SActiveGSTTab) === true) {

            LMe.FWarningText = 'Select GST and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        if (isEmpty(LMe.state.SFromDate) === true) {
            LMe.FWarningText = 'Enter from date and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        if (isEmpty(LMe.state.SToDate) === true) {
            LMe.FWarningText = 'Enter to date and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        var LFromDate = new Date(LMe.state.SFromDate),
            LToDate = new Date(LMe.state.SToDate);

        if (LFromDate > LToDate) {
            LMe.FWarningText = 'From date must be less than than To date.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        return true;
    }

    pvtLoadData(p_arrResponseJson) {
        /**
         * @method pvtLoadData
         * This method will load data to datagrid
         */
        var LMe = this,
            LStateObj = {};

        p_arrResponseJson = p_arrResponseJson || [];

        //Creating instance of GSTUtils of not created
        if (isObjEmpty(LMe.FGSTUtils) === true) {

            LMe.FGSTUtils = new TGSTUtils();
        }//if..

        switch (LMe.state.SActiveGSTTab) {

            case GenConstants().GSTR1:

                LStateObj.SColumnData = LMe.FGSTUtils.GetGSTR1Columns();
                LStateObj.FetchedData = p_arrResponseJson;
                break;

            case GenConstants().B2CS:

                LStateObj.SColumnData = LMe.FGSTUtils.GetB2CSColumns();
                LStateObj.FetchedData = p_arrResponseJson;
                break;

            case GenConstants().B2CL:

                LStateObj.SColumnData = LMe.FGSTUtils.GetB2CLColumns();
                LStateObj.FetchedData = p_arrResponseJson;
                break;

            case GenConstants().B2B:

                LStateObj.SColumnData = LMe.FGSTUtils.GetB2BColumns();
                LStateObj.FetchedData = p_arrResponseJson;
                break;

            case GenConstants().HSN:

                LStateObj.SColumnData = LMe.FGSTUtils.GetHSNColumns();
                LStateObj.FetchedData = p_arrResponseJson;
                break;

            default:
                LStateObj.SColumnData = [];
                LStateObj.FetchedData = [];
        }//switch..

        LMe.setState(LStateObj);
    }

    pvtGenerateReport() {
        /**
         * @method pvtGenerateReport
         * This method will generate report
         *
         * @param: Nothing
         * @returns: Nothing
         */

        var LMe = this;

        //Validating the filters
        if (LMe.pvtValidate() === false) {

            return;
        }//if..

        var LParamObj = {
            fromDate: LMe.state.SFromDate,
            toDate: LMe.state.SToDate,
            gstType: LMe.state.SActiveGSTTab
        };

        var LUrl = BaseUrl() + 'gstreports';

        var LRequestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify(LParamObj)
        };

        // No need to check for session
        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {

                    if (responseJson.success === false) {

                        LMe.FWarningText = responseJson.message;
                        LMe.setState({ IsAlertDialogOpen: true });

                        LMe.pvtLoadData([]);
                        return false;
                    }//if..

                    LMe.pvtLoadData(responseJson);
                },
                (error) => {

                    LMe.FWarningText = error.message;
                    LMe.setState({ IsAlertDialogOpen: true });
                    return false;
                }
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
                        <EventNoteIcon />
                    </div>
                    <div style={{ margin: '18px 6px 0 0' }}>
                        {/* Module Title */}
                        <div style={{ fontSize: '20px' }}> {LMe.props.moduleInfo.displayTxt} Report</div>

                        {/* Module Description */}
                        <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
                            GSTR-1 is a sales return that is required to be filed by every GST registered person.
                        </Box>
                    </div>
                </Box>

                <div className="" style={{ margin: '0 30px' }}>
                    <Paper style={{ padding: 20 }} className="tsHBox" variant="outlined">
                        <FormControl style={{ width: 200 }}>
                            <InputLabel>{'GSTR-1'}</InputLabel>
                            <Select
                                value={LMe.state.SActiveGSTTab}
                                onChange={(e) => {

                                    // LMe.pvtHandleOnChange(e.target.value);
                                    LMe.setState({ SActiveGSTTab: e.target.value });
                                }}
                            >
                                <MenuItem key={GenConstants().GSTR1 + '-key'} value={GenConstants().GSTR1}>{GenConstants().GSTR1}</MenuItem>
                                <MenuItem key={GenConstants().B2B + '-key'} value={GenConstants().B2B}>{GenConstants().B2B}</MenuItem>
                                <MenuItem key={GenConstants().B2CL + '-key'} value={GenConstants().B2CL}>{GenConstants().B2CL}</MenuItem>
                                <MenuItem key={GenConstants().B2CS + '-key'} value={GenConstants().B2CS}>{GenConstants().B2CS}</MenuItem>
                                {/* <MenuItem key={GenConstants().CDNR + '-key'} value={GenConstants().CDNR}>{GenConstants().CDNR}</MenuItem>
                                <MenuItem key={GenConstants().CDNUR + '-key'} value={GenConstants().CDNUR}>{GenConstants().CDNUR}</MenuItem>
                                <MenuItem key={GenConstants().EXP + '-key'} value={GenConstants().EXP}>{GenConstants().EXP}</MenuItem> */}
                                <MenuItem key={GenConstants().HSN + '-key'} value={GenConstants().HSN}>{GenConstants().HSN}</MenuItem>
                                {/* <MenuItem key={GenConstants().ITEM_WISE_SALE + '-key'} value={GenConstants().ITEM_WISE_SALE}>{GenConstants().ITEM_WISE_SALE}</MenuItem>
                                <MenuItem key={GenConstants().ITEM_WISE_SALE_RETURN + '-key'} value={GenConstants().ITEM_WISE_SALE_RETURN}>{GenConstants().ITEM_WISE_SALE_RETURN}</MenuItem>
                                <MenuItem key={GenConstants().ITEM_SUMMARY + '-key'} value={GenConstants().ITEM_SUMMARY}>{GenConstants().ITEM_SUMMARY}</MenuItem> */}
                            </Select>
                        </FormControl>
                        <TextField
                            label={'From Date'}
                            type="date"
                            margin="dense"
                            style={{ margin: '2px 0 0 20px' }}
                            value={LMe.state.SFromDate}
                            InputLabelProps={{
                                shrink: true
                            }}
                            required={true}
                            onChange={(e) => {

                                LMe.setState({ SFromDate: e.currentTarget.value })
                            }}
                        />

                        <TextField
                            label={'To Date'}
                            type="date"
                            margin="dense"
                            style={{ margin: '2px 0 0 20px' }}
                            value={LMe.state.SToDate}
                            InputLabelProps={{
                                shrink: true
                            }}
                            required={true}
                            onChange={(e) => {

                                LMe.setState({ SToDate: e.currentTarget.value })
                            }}
                        />
                        <div><Button
                            size="small"
                            variant="contained"
                            color="primary"
                            disableElevation
                            style={{ margin: '15px 0 0 30px' }}
                            onClick={() => {
                                LMe.pvtGenerateReport()
                            }}
                        >
                            Generate Report
                        </Button></div>
                    </Paper>
                </div>
                <div
                    style={{ margin: '5px 30px' }}
                    className="flex1 tsVBox"
                >
                    <DataGrid
                        columns={LMe.state.SColumnData || []}
                        rows={LMe.state.FetchedData || []}
                        ref={LMe.FGridRef}
                        pagination
                        csvOptions={{ allColumns: true }}
                        loading={LMe.state.FetchedData === null ? true : false}
                        density={'compact'}
                        onCellDoubleClick={(params) => {
                            // LMe.pvtHandleOnRowDoubleClick(params.row)
                        }}
                        components={{
                            Toolbar: GridToolbar,
                        }}
                        hideFooter
                        onRowClick={(e) => {
                            // LMe.pvtHandleOnRowClick(e.row)
                        }}
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
            </div>
        );
    }
}

export default frmGSTR1;