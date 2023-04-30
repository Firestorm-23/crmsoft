import React, { Component } from 'react';
import TCustomerSelectionCntr from '../../reusable/tsfrmCustomerSelectionCntr';
import { Box, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Button, Snackbar } from '@material-ui/core';
import ReceiptIcon from '@material-ui/icons/Receipt';
import SaveIcon from '@material-ui/icons/Save';
import { isEmpty, BaseUrl, tsGetPaymentModes, tsPaymentPrint, tsGetProjectId } from '../../tsclsGenUtils';
import TDialog from '../../reusable/tsclsDialog';
import CircularProgress from '@material-ui/core/CircularProgress';
import { GenConstants } from '../../tsclsGenConstants';

class tsfrmPaymentInOut extends Component {
    /**
     * @props: isVisible, 
     * @returns 
     */

    constructor(props) {
        super(props);
        var LMe = this;

        LMe.state = {
            cstId: -1,
            SPaymentType: '',
            SAmount: 0,
            SPaymentMode: '',
            SRemark: '',
            IsAlertDialogOpen: false,
            IsSnackOn: false,
            SIsLoading: false
        };
    }

    pvtResetAllFields() {
        var LMe = this;

        LMe.setState({
            // cstId: -1,
            SPaymentType: '',
            SAmount: 0,
            SPaymentMode: '',
            SRemark: '',
            IsAlertDialogOpen: false,
            SIsLoading: false,
            //Making snack enable
            IsSnackOn: true
        });
    }

    pvtValidate() {
        /**
         * @method pvtValidate
         * This method will validate the form
         */
        var LMe = this;

        if (isEmpty(LMe.state.cstId) === true || LMe.state.cstId === -1) {
            LMe.FWarningText = 'Select a Customer and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        if (isEmpty(LMe.state.SPaymentType) === true) {
            LMe.FWarningText = 'Select a Payment type and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        if (isEmpty(LMe.state.SAmount) === true || LMe.state.SAmount === 0) {
            LMe.FWarningText = 'Enter Amount and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        if (isEmpty(LMe.state.SPaymentMode) === true) {
            LMe.FWarningText = 'Select Payment mode and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }
    }

    pvtGenerateBtnClick() {
        /**
         * @method pvtGenerateBtnClick
         * This method will complete the transcation 
         */
        var LMe = this,
            LUrl = BaseUrl() + 'payments',
            LParamObj = {},
            LRequestOptions;

        if (LMe.pvtValidate() === false || LMe.state.SIsLoading === true) {

            return;
        }//if..

        LMe.setState({
            SIsLoading: true
        });

        LParamObj = {
            invoiceType: '',
            paymentDate: new Date().toString(),
            cstId: LMe.state.cstId,
            invoiceNo: '',
            mode: LMe.state.SPaymentMode,
            remark: LMe.state.SRemark,
            credit: 0,
            debit: 0
        };

        if (LMe.state.SPaymentType === 'credit') {

            LParamObj.credit = LMe.state.SAmount;
            LParamObj.invoiceType = GenConstants().PAYMENT_IN_ACT_CODE;
        }
        else if (LMe.state.SPaymentType === 'debit') {

            LParamObj.debit = LMe.state.SAmount;
            LParamObj.invoiceType = GenConstants().PAYMENT_OUT_ACT_CODE;
        }

        LRequestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify(LParamObj)
        };

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    LMe.setState({
                        IsLoading: false
                    });

                    if (responseJson.success === false || isEmpty(responseJson)) {

                        LMe.FWarningText = responseJson.message || 'Error occur on server';
                        LMe.setState({ IsAlertDialogOpen: true, SIsLoading: false });
                        return false;
                    } //if..

                    LMe.FSnackMsg = 'Transaction Successful';

                    tsPaymentPrint(responseJson.id);

                    LMe.pvtResetAllFields();
                },
                (error) => {
                    LMe.setState({ IsAlertDialogOpen: true, SIsLoading: false });
                }
            );
    }

    pvtGetPaymentModeMenuItems() {
        /**
         * @method pvtGetPaymentModeMenuItems
         * This method will return the menu items for payment type
         */
        var //LMe = this,
            LKey,
            LArrComponent = [],
            LArrPaymentModes = tsGetPaymentModes() || [];

        LArrComponent.push(<MenuItem key={'none-paymentmode-key'} value={''}><em>None</em></MenuItem>);

        LArrPaymentModes.forEach(function (p_objRecord, p_intIndex) {

            //Remove all spaces
            LKey = p_objRecord.name.replace(/\s/g, '') + '-key' + p_intIndex;

            LArrComponent.push(<MenuItem key={LKey} value={p_objRecord.name}>{p_objRecord.name}</MenuItem>);
        });

        return LArrComponent;
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
                        <ReceiptIcon />
                    </div>
                    <div style={{ margin: '18px 6px 0 0' }}>
                        {/* Module Title */}
                        <div style={{ fontSize: '20px' }}> {LMe.props.moduleInfo.displayTxt} </div>

                        {/* Module Description */}
                        <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
                            Credit, Debit Payment.
                        </Box>
                    </div>
                </Box>

                <Paper style={{ margin: '0 20px 0 20px' }} variant="outlined">
                    <TCustomerSelectionCntr
                        SetCstId={(p_intCustomerId) => LMe.setState({ cstId: p_intCustomerId })}
                    ></TCustomerSelectionCntr>
                </Paper>

                <Paper style={{ margin: '20px 20px 0 20px', padding: '0 20px 20px 20px' }} className="tsVBox" variant="outlined">
                    <h4>Payment Details</h4>

                    <div className="tsHBox">
                        <FormControl style={{ margin: '0 0 0 0', width: '200px' }}>
                            <InputLabel>Payment type</InputLabel>
                            <Select
                                value={LMe.state.SPaymentType}
                                onChange={(e) => {
                                    LMe.setState({ SPaymentType: e.target.value });
                                }}
                            >
                                <MenuItem key={'none-key'} value={''}><em>None</em></MenuItem>
                                <MenuItem key={'credit-key'} value={'credit'}>Credit</MenuItem>
                                <MenuItem key={'debit-key'} value={'debit'}>Debit</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField label="Amount" placeholder="Amount" required
                            style={{ margin: '3px 0 0 20px', width: '200px' }}
                            onChange={(e) => LMe.setState({ SAmount: e.currentTarget.value })}
                            value={LMe.state.SAmount}
                            margin="dense"
                            type="number"
                        />

                        <FormControl style={{ margin: '0 0 0 20px', width: '200px' }}>
                            <InputLabel>Payment Mode</InputLabel>
                            <Select
                                value={LMe.state.SPaymentMode}
                                onChange={(e) => {
                                    LMe.setState({ SPaymentMode: e.target.value });
                                }}
                            >
                                {LMe.pvtGetPaymentModeMenuItems()}
                            </Select>
                        </FormControl>
                    </div>
                    <TextField label="Remark" placeholder="Remark"
                        style={{ margin: '20px 0 0 0', width: '200px' }}
                        onChange={(e) => LMe.setState({ SRemark: e.currentTarget.value })}
                        value={LMe.state.SRemark}
                        margin="dense"
                        multiline
                    />
                </Paper>
                <div className="flex1"></div>
                <div className="tsHBox">
                    <div className="flex1"></div>
                    <Button
                        style={{ margin: '0 50px 30px 0' }}
                        size="large"
                        variant="contained"
                        color="primary"
                        startIcon={LMe.state.SIsLoading ? '' : <SaveIcon />}
                        disableElevation
                        onClick={() => { LMe.pvtGenerateBtnClick() }}
                    >
                        {LMe.state.SIsLoading ? <><CircularProgress size={20} color="inherit" /> <span style={{ margin: '0 0 0 10px' }}>Loading...</span></>
                            : 'Save and Generate Receipt'}
                    </Button>
                </div>
                <TDialog
                    IsDialogOpen={LMe.state.IsAlertDialogOpen}
                    OnDialogClose={() => LMe.setState({ IsAlertDialogOpen: false })}
                    DialogContent={LMe.FWarningText || ''}
                    DialogActions={<></>}
                    DialogHeader={'Warning'}
                    IsWindow={false}
                />
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    open={LMe.state.IsSnackOn}
                    onClose={() => LMe.setState({ IsSnackOn: false })}
                    message={LMe.FSnackMsg}
                    key={'verticalhorizontalSnack'}
                />
            </div>
        );
    }
}

export default tsfrmPaymentInOut;