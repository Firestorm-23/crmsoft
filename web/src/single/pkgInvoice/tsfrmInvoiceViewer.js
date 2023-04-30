import React, { Component } from 'react';
// import { GenConstants } from '../../tsclsGenConstants';
import {
    tsGetInvoiceDispNameByActionCode, isEmpty, isObjEmpty, tsPrint, tsGenerateInvoicePDF,
    tsGetInvoiceDispNoByInvoiceNo, tsGetDateFromServerDateForInpField, tsGetGstAmount, tsGetIGSTAmount
} from '../../tsclsGenUtils';
import TProductSelectionCntr from './tsfrmProductSelectionCntr';
import {
    IconButton,
    Tooltip,
    Button
} from '@material-ui/core';
import TInvoiceDlg from './tsfrmSingleInvoice';
import PrintIcon from '@material-ui/icons/Print';
import EditIcon from '@material-ui/icons/Edit';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import TLoading from '../../reusable/tsclsLoading';
import TDialog from '../../reusable/tsclsDialog';

class tsfrmInvoiceViewer extends Component {
    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            SProducts: [],
            SIsDialogOpen: false,
            SIsDialogOpenInReadOnlyMode: true,
            SLoading: false,
            IsAlertDialogOpen: false
        };
    }

    pvtGetCustomerFields(p_objCustomerData) {
        /**
         * @method pvtGetCustomerFields
         * This method will return the grid column json
         */

        var p_arrCstFields = p_objCustomerData.cstFields || [];
        var p_objCstValues = p_objCustomerData.cstFieldValues || {};

        var //LMe = this,
            LArrColumn = [],
            LObj = {},
            L_funGetBalance = function (p_value) {
                var LValue = p_value;

                if (LValue > 0) {

                    return LValue + ' Cr';
                }
                else if (LValue < 0) {

                    return Math.abs(LValue) + ' Dr';
                }

                return LValue;
            };

        LArrColumn = [
            <div className="tsHBoxForPrint tsInvoiceViewBorder" key="tskey1">
                <span className="tsInvoiceViewDispField" key="tskey11">Customer Name</span>
                <span className="tsInvoiceViewValField" key="tskey12">{p_objCstValues.cstName}</span>
            </div>,
            <>{
                p_objCstValues.cstBalance === 0 ? <></> : <div key="tskey2" className="tsHBoxForPrint">
                    <span className="tsInvoiceViewDispField" key="tskey21">Balance</span>
                    <span className="tsInvoiceViewValField" key="tskey22">{L_funGetBalance(p_objCstValues.cstBalance)}</span>
                </div>
            }</>,
            <div className="tsHBoxForPrint" key="tskey33a">
                <span className="tsInvoiceViewDispField" key="tskey11">GST No</span>
                <span className="tsInvoiceViewValField" key="tskey12">{p_objCstValues.cstGSTNo}</span>
            </div>,
        ];

        //Getting custom fields
        if (isEmpty(p_arrCstFields) === false) {

            //Convert it into array
            p_arrCstFields = p_arrCstFields || [];

            p_arrCstFields.forEach(function (p_objRecord, p_index) {

                if (p_objRecord.isSystemField === true) {

                    return true;
                }//if..

                LObj = <div className="tsHBoxForPrint" key={"tskey3" + p_index}>
                    <span className="tsInvoiceViewDispField" key={"tskey31" + p_index}>{p_objRecord.fieldName}</span>
                    <span className="tsInvoiceViewValField" key={"tskey32" + p_index}>{p_objCstValues[p_objRecord.columnName]}</span>
                </div>;

                LArrColumn.push(LObj);
            });
        }//if..

        return LArrColumn;
    }

    pvtPrint() {
        var LMe = this,
            LRecord = LMe.props.PSelectedRecord;

        if (isObjEmpty(LRecord) === true) {
            return;
        } //if..


        tsPrint(LRecord.invoiceType, LRecord.invoiceNo);
        // var LWindow = window.open('/singleInvoice/' + LRecord.invoiceType + '/' + LRecord.invoiceNo);

        // LWindow.onload = function () {

        //     setTimeout(function () {
        //         LWindow.print();
        //     }, 100);
        // }
    }

    pvtGeneratePDF() {

        var LMe = this,
            LRecord = LMe.props.PSelectedRecord;

        if (isObjEmpty(LRecord) === true) {
            return;
        } //if..

        LMe.setState({ SLoading: true });

        tsGenerateInvoicePDF(LRecord.invoiceType, LRecord.invoiceNo, function (p_objResponseJson) {

            LMe.setState({ SLoading: false });

            if (p_objResponseJson.success === false) {

                LMe.FWarningText = p_objResponseJson.message;
                LMe.setState({ IsAlertDialogOpen: true });
            }//if..
        });
    }

    pvtHandleOnEditButtonClick() {
        var LMe = this,
            LRecord = LMe.props.PSelectedRecord;

        if (isObjEmpty(LRecord) === true) {
            return;
        } //if..

        LMe.setState({
            SIsDialogOpen: true,
            SIsDialogOpenInReadOnlyMode: false
        });
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
            PSelectedRecord={LMe.props.PSelectedRecord}
            PIsReadOnlyMode={LMe.state.SIsDialogOpenInReadOnlyMode}
            PIsDetailedView={true}
        />;
    }

    render() {
        var LMe = this,
            LObjInvoice = LMe.props.PSelectedRecord || {};

        return (
            <div className="">
                <div
                    className="tsHBox"
                >
                    <div>
                        <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            disableElevation
                            style={{ margin: '7px 0 0 0' }}
                            onClick={() => {
                                LMe.pvtHandleOnEditButtonClick();
                            }}
                            startIcon={<EditIcon />}
                        >
                            Edit Invoice
                        </Button>
                    </div>
                    <div className="flex1"> </div>

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

                    <div>
                        <IconButton
                            onClick={() => LMe.pvtPrint()}
                        >
                            <Tooltip title="Print">
                                <PrintIcon />
                            </Tooltip>
                        </IconButton>
                    </div>
                </div>

                <div className="tsVBox" key="tskey4">
                    <div className="tsHBoxForPrint tsInvoiceViewBorder" key="tskey41">
                        {isEmpty(LObjInvoice.invoiceType) === false ? <><span className="tsInvoiceViewDispField">Invoice Type</span>
                            <span key="tskey42" className="tsInvoiceViewValField">{tsGetInvoiceDispNameByActionCode(LObjInvoice.invoiceType)}</span></> : <></>}
                    </div>
                    <div key="tskey43" className="tsHBoxForPrint">
                        <span key="tskey44" className="tsInvoiceViewDispField">Invoice Number</span>
                        <span key="tskey45" className="tsInvoiceViewValField">{tsGetInvoiceDispNoByInvoiceNo(LObjInvoice.invoiceNo, LObjInvoice.invoiceType)}</span>
                    </div>
                    <div key="tskey6" className="tsHBoxForPrint">
                        <span key="tskey7" className="tsInvoiceViewDispField">Invoice Date</span>
                        <span key="tskey8" className="tsInvoiceViewValField">{tsGetDateFromServerDateForInpField(LObjInvoice.invoiceDate)}</span>
                    </div>
                    {/* Seperator */}
                    {LMe.pvtGetCustomerFields(LObjInvoice.customerData)}
                    {/* Seperator */}
                    <div key="tskey9" className="tsHBoxForPrint tsInvoiceViewBorder">
                        <span className="tsInvoiceViewDispField">Payment Mode</span>
                        <span className="tsInvoiceViewValField">{LObjInvoice.mode}</span>
                    </div>
                    <div key="tskey10" className="tsHBoxForPrint">
                        <span className="tsInvoiceViewDispField">Credited Amount</span>
                        <span className="tsInvoiceViewValField">Rs. {LObjInvoice.creditedAmount}</span>
                    </div>
                    <div key="tskey14" className="tsHBoxForPrint">
                        <span className="tsInvoiceViewDispField">Remark</span>
                        <span className="tsInvoiceViewValField"> {LObjInvoice.remark}</span>
                    </div>
                    {/* Seperator */}
                    <div key="tskey15" className="tsHBoxForPrint tsInvoiceViewBorder">
                        <span className="tsInvoiceViewDispField">Products</span>
                        <span className="tsInvoiceViewValField flex1" style={{ width: 540 }}>
                            {/* {JSON.stringify(LObjInvoice.products)} */}
                            <TProductSelectionCntr
                                PInvoiceType={LObjInvoice.invoiceType}
                                SetGrandTotal={(p_intGrandTotal) => {

                                }}

                                SetProducts={(p_arrProducts) => {

                                    LMe.setState({ SProducts: p_arrProducts || [] })
                                }}

                                //This will load the products according to product arrays
                                PProductsArr={LObjInvoice.products}

                                //Set ReadOnlyMode
                                PIsReadOnlyMode={true}
                            />

                        </span>
                    </div>
                    <div key="tskey13" className="tsHBoxForPrint tsInvoiceViewBorder">
                        <span className="tsInvoiceViewDispField">SGST Amount</span>
                        <span className="tsInvoiceViewValField">Rs. {tsGetGstAmount(LMe.state.SProducts, LObjInvoice.grandTotal)}</span>
                    </div>
                    <div key="tskey16" className="tsHBoxForPrint">
                        <span className="tsInvoiceViewDispField">CGST Amount</span>
                        <span className="tsInvoiceViewValField">Rs. {tsGetGstAmount(LMe.state.SProducts, LObjInvoice.grandTotal)}</span>
                    </div>
                    <div className="tsHBoxForPrint">
                        <span className="tsInvoiceViewDispField">IGST Amount</span>
                        <span className="tsInvoiceViewValField">Rs. {tsGetIGSTAmount(LMe.state.SProducts, LObjInvoice.grandTotal)}</span>
                    </div>

                    <div key="tskey17" className="tsHBoxForPrint">
                        <span className="tsInvoiceViewDispField">Total Inovice Amount</span>
                        <span className="tsInvoiceViewValField">Rs. {LObjInvoice.grandTotal}</span>
                    </div>
                    <div key="tskey18" className="tsInvoiceViewBorder"></div>
                </div>
                {LMe.pvtLoadDialog()}

                <TLoading
                    PLoadingText={'Generating PDF document, please wait...'}
                    PIsLoading={LMe.state.SLoading}
                    POnStopLoading={() => LMe.setState({ SLoading: false })}
                />
                <TDialog
                    IsDialogOpen={LMe.state.IsAlertDialogOpen}
                    OnDialogClose={() => LMe.setState({ IsAlertDialogOpen: false })}
                    DialogContent={LMe.FWarningText || ''}
                    DialogActions={<></>}
                    DialogHeader={'Warning'}
                    IsWindow={false}
                />
            </div>
        )
    }
}

export default tsfrmInvoiceViewer;