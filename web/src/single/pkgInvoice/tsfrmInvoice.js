import React, { Component } from 'react';
import TCustomerSelectionCntr from '../../reusable/tsfrmCustomerSelectionCntr';
import TProductSelectionCntr from './tsfrmProductSelectionCntr';
import { Box, Paper, FormControl, Select, MenuItem, InputLabel, TextField, Button, Snackbar } from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import TInvoiceType from '../../reusable/tscmpInvoiceType';
import { GenConstants } from '../../tsclsGenConstants';
import { isEmpty, BaseUrl, tsGetPaymentModes, tsPrint, tsGetProjectId, tsGetInvoiceDispNoByInvoiceNo } from '../../tsclsGenUtils';
import CircularProgress from '@material-ui/core/CircularProgress';
import SaveIcon from '@material-ui/icons/Save';
import TDialog from '../../reusable/tsclsDialog';

class tsfrmInvoice extends Component {
    /**
     * @props: isVisible, 
     * @returns 
     */

    constructor(props) {
        super(props);
        var LMe = this;

        LMe.state = {
            cstId: -1,
            SInvoiceType: GenConstants().PESTICIDE_ACT_CODE,
            SPayingAmount: 0,
            SGrandTotal: 0,
            SPaymentMode: '',
            SRemark: '',
            SIsLoading: false,
            IsAlertDialogOpen: false,
            IsSnackOn: false
        };

        LMe.FSnackMsg = '';
        LMe.FWarningText = '';

        LMe.FGridPanel = React.createRef();
    }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         * 
         */
        var LMe = this,
            LRecord = LMe.props.PSelectedRecord;

        if (isEmpty(LRecord) === true) {
            return;
        }//if..
        // setTimeout(function () {

        // }, 1000);
        LMe.setState({
            cstId: LRecord.cstId,
            SGrandTotal: LRecord.grandTotal,
            SInvoiceType: LRecord.invoiceType,
            SPayingAmount: LRecord.creditedAmount,
            SPaymentMode: LRecord.mode,
            SRemark: LRecord.remark || ''
        });
    }

    pvtResetAllFields() {
        var LMe = this;

        LMe.FGridPanel.current.ResetFields();

        LMe.setState({
            // cstId: -1,
            SPayingAmount: 0,
            SGrandTotal: 0,
            SPaymentMode: '',
            SRemark: '',
            IsAlertDialogOpen: false,
            SIsLoading: false,
            //Making snack enable
            IsSnackOn: true
        });
    }

    pvtHandleOnInvoiceTypeChange(p_actCodeInvoiceType) {
        /**
         * @method pvtHandleOnInvoiceTypeChange
         * 
         * @param {p_actCodeInvoiceType}: Action code for invoice type
         */
        var LMe = this;

        LMe.setState({
            SInvoiceType: p_actCodeInvoiceType,
            SPayingAmount: 0,
            SGrandTotal: 0
        });

        // LMe.pvtFetchProductsFields(p_actCodeInvoiceType);
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

        if (isEmpty(LMe.state.SInvoiceType) === true) {
            LMe.FWarningText = 'Select a Invoice type and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        var LArrProducts = LMe.FGridPanel.current.GetProductJson();
        if (isEmpty(LArrProducts) === true) {
            LMe.FWarningText = 'Add at least one Product to continue.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        // if (LMe.props.PIsOpenInDialog === true) {
        //     return true;
        // }

        if (isEmpty(LMe.state.SPayingAmount) === true || LMe.state.SPayingAmount === 0) {
            LMe.FWarningText = 'Enter Paying Amount (Credit) and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        if (isEmpty(LMe.state.SPaymentMode) === true) {
            LMe.FWarningText = 'Select Payment mode and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return false;
        }

        return true;

    }

    EditInvoice(p_callBack) {
        /**
         * @public
         */
        var LMe = this;

        /**
         * Edit invoice will first delete the invoice and create new one with same invoice no
         */

        //This will always give true 
        if (LMe.props.PIsOpenInDialog === true) {

            LMe.pvtDelete(p_callBack);
        }
    }

    pvtGenerateBtnClick(p_callBack) {
        var LMe = this,
            LUrl = BaseUrl() + 'invoices',
            LArrProducts,
            LRequestOptions,
            LMethod = 'POST',
            LRequestJson = {};

        // cstId: -1,
        // SInvoiceType: GenConstants().PESTICIDE_ACT_CODE,
        // SPayingAmount: 0,
        // SGrandTotal: 0,
        // SPaymentMode: '',
        // SRemark: '',

        if (LMe.pvtValidate() === false || LMe.state.SIsLoading === true) {

            return;
        }//if..

        LArrProducts = LMe.FGridPanel.current.GetProductJson();

        LRequestJson = {
            cstId: LMe.state.cstId,
            products: LArrProducts,
            payingAmount: LMe.state.SPayingAmount,
            grandTotal: LMe.state.SGrandTotal,
            invoiceType: LMe.state.SInvoiceType,
            invoiceDate: (LMe.props.PSelectedRecord && LMe.props.PSelectedRecord.invoiceDate) || new Date().toString(),
            mode: LMe.state.SPaymentMode,
            remark: LMe.state.SRemark || '',
        };

        //Edit mode
        if (LMe.props.PIsOpenInDialog === true) {

            LRequestJson.invoiceNo = LMe.props.PSelectedRecord && LMe.props.PSelectedRecord.invoiceNo;
            // LMethod = 'PUT';
            // LUrl = BaseUrl() + 'invoices/' + LRequestJson.invoiceNo;
            if (isEmpty(LRequestJson.invoiceNo) === true) {

                LMe.FWarningText = 'Something wents wrong.';
                LMe.setState({ IsAlertDialogOpen: true });
                return;
            }
        }
        // console.log(LMe.props.PSelectedRecord);

        LMe.setState({
            SIsLoading: true
        });

        LRequestOptions = {
            method: LMethod,
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify(LRequestJson)
        };

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    LMe.setState({
                        SIsLoading: false
                    });

                    if (responseJson.success === false || isEmpty(responseJson)) {

                        LMe.FWarningText = responseJson.message || 'Error occur on server';
                        LMe.setState({ IsAlertDialogOpen: true, SIsLoading: false });
                        return false;
                    } //if..

                    LMe.FSnackMsg = 'Invoice created - Invoice No: ' + tsGetInvoiceDispNoByInvoiceNo(responseJson.invoiceNo, responseJson.invoiceType, 0);
                    // LMe.setState({IsSnackOn: true});

                    LMe.pvtResetAllFields();

                    if (isEmpty(p_callBack) === false) {

                        //Callback contain stop loading for edit mode
                        p_callBack();
                    }

                    tsPrint(responseJson.invoiceType || LRequestJson.invoiceType, responseJson.invoiceNo)
                },
                (error) => {
                    LMe.setState({ IsAlertDialogOpen: true, SIsLoading: false });
                }
            );
    }

    pvtDelete(p_callBack) {
        var LMe = this,
            LRequestOptions,
            LUrl;

        // eslint-disable-next-line no-useless-concat
        LUrl = BaseUrl() + 'invoices' + '/' + (LMe.props.PSelectedRecord && LMe.props.PSelectedRecord.invoiceNo) + '/' + LMe.state.SInvoiceType;

        if (isEmpty(LMe.props.PSelectedRecord.invoiceNo) === true) {

            return;
        }//if..

        LRequestOptions = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify({ cstId: LMe.state.cstId }),
        };

        // fire command
        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.success === false) {
                        LMe.FWarningText = responseJson.message;
                        LMe.setState({
                            IsAlertDialogOpen: true
                        });

                        return;
                    }

                    LMe.pvtGenerateBtnClick(p_callBack);

                },
                (error) => {
                    LMe.FWarningText = error.message;
                    LMe.setState({
                        IsAlertDialogOpen: true
                    });
                }
            );
    }

    pvtGetHeader() {
        /**
         * @method pvtGetHeader
         */
        var LMe = this;

        if (LMe.props.PIsOpenInDialog === true) {
            return <></>;
        }

        return <Box component="div" display="flex" px={3} pb={2}>
            {/* Module Icon */}
            <div style={{ margin: '20px 6px 0 0' }}>
                <DescriptionIcon />
            </div>
            <div style={{ margin: '18px 6px 0 0' }}>
                {/* Module Title */}
                <div style={{ fontSize: '20px' }}> {LMe.props.moduleInfo.displayTxt} </div>

                {/* Module Description */}
                <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
                    Create a new Invoice.
                </Box>
            </div>
        </Box>;
    }

    pvtGetSaveBtn() {
        /**
         * @method pvtGetSaveBtn
         * This method will return the save and generate invoice btn, if form is not invoked as a model
         */
        var LMe = this;

        if (LMe.props.PIsOpenInDialog === true) {
            return <></>;
        }//if..

        return <Button
            style={{ margin: '0 0 0 0' }}
            size="small"
            variant="contained"
            color="primary"
            startIcon={LMe.state.SIsLoading ? '' : <SaveIcon />}
            disableElevation
            onClick={() => { LMe.pvtGenerateBtnClick() }}
        >
            {LMe.state.SIsLoading ? <><CircularProgress size={20} color="inherit" /> <span style={{ margin: '0 0 0 10px' }}>Loading...</span></>
                : 'Generate Invoice'}
        </Button>;
    }

    pvtGetPaymentFields() {
        var LMe = this;

        // if (LMe.props.PIsOpenInDialog === true) {
        //     return <></>;
        // }//if..

        return <>
            <TextField label="Credit" placeholder="Amount" required
                style={{ margin: '3px 0 0 20px', width: '130px' }}
                onChange={(e) => LMe.setState({ SPayingAmount: e.currentTarget.value })}
                value={LMe.state.SPayingAmount}
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

            <TextField label="Remark" placeholder="Remark"
                style={{ margin: '4px 0 0 20px', width: '200px' }}
                onChange={(e) => LMe.setState({ SRemark: e.currentTarget.value })}
                value={LMe.state.SRemark}
                margin="dense"
            // multiline
            />

        </>;
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

                {LMe.pvtGetHeader()}

                {/* Customer selection and Invoice type */}
                <Paper style={{ margin: '0 20px 0 20px' }} className="tsHBox" variant="outlined">

                    <TCustomerSelectionCntr
                        SetCstId={(p_intCustomerId) => LMe.setState({ cstId: p_intCustomerId })}

                        //Not setting state here, because it is loading for first time and call componentDidMont method is getting -1 id
                        //This will load the customer for this id
                        cstId={LMe.props.PSelectedRecord && LMe.props.PSelectedRecord.cstId}
                    ></TCustomerSelectionCntr>

                    <div style={{ margin: '5px 0 0 30px' }}>
                        <h4>Invoice Type</h4>

                        <div style={{ margin: '27px 0 0 0' }}>
                            <TInvoiceType
                                Value={LMe.state.SInvoiceType}
                                OnChange={p_value => LMe.pvtHandleOnInvoiceTypeChange(p_value)}
                                EmptyText={'Invoice Type'}
                            ></TInvoiceType>
                        </div>
                    </div>
                </Paper>

                <TProductSelectionCntr
                    PInvoiceType={LMe.state.SInvoiceType}
                    ref={LMe.FGridPanel}
                    SetGrandTotal={(p_intGrandTotal) => {

                        //Edit mode
                        if (LMe.props.PIsOpenInDialog === true) {
                            LMe.setState({ SGrandTotal: p_intGrandTotal });
                        }
                        else {
                            LMe.setState({ SGrandTotal: p_intGrandTotal, SPayingAmount: p_intGrandTotal });
                        }
                    }}

                    //This will load the products according to product arrays
                    PProductsArr={LMe.props.PSelectedRecord && LMe.props.PSelectedRecord.products}
                />

                <Paper style={{ margin: '20px 20px 20px 20px', padding: '0 20px 20px 20px' }} className="tsVBox" variant="outlined">
                    <h4>Payment Details</h4>

                    <div className="tsHBox">
                        <TextField label="Total Amount" placeholder="Amount" required
                            style={{ margin: '3px 0 0 0', width: '120px' }}
                            onChange={(e) => LMe.setState({ SGrandTotal: e.currentTarget.value })}
                            value={LMe.state.SGrandTotal}
                            margin="dense"
                            type="number"
                            InputProps={{
                                readOnly: true
                            }}
                        />

                        {LMe.pvtGetPaymentFields()}

                        <div className="flex1"></div>
                        {LMe.pvtGetSaveBtn()}
                    </div>
                </Paper>

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

export default tsfrmInvoice;