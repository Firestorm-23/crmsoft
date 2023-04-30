import React, { Component } from 'react';
// import { GenConstants } from '../../tsclsGenConstants';
import { tsGetInvoiceDispNameByActionCode, isEmpty, tsGetInvoiceDispNoByInvoiceNo, tsGetDateFromServerDateForPrintField, tsGetGstAmount, tsGetIGSTAmount } from '../../../tsclsGenUtils';
import TProductSelectionCntr from '../tsfrmProductSelectionCntr';

class tsfrmInvoiceViewer extends Component {
    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            SProducts: []
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
            <div className="tsHBoxForPrint tsInvoiceViewBorder">
                <span className="tsInvoiceViewDispField">Customer Name</span>
                <span className="tsInvoiceViewValField">{p_objCstValues.cstName}</span>
            </div>,
            <>{
                p_objCstValues.cstBalance === 0 ? <></> : <div className="tsHBoxForPrint">
                    <span className="tsInvoiceViewDispField">Balance</span>
                    <span className="tsInvoiceViewValField">{L_funGetBalance(p_objCstValues.cstBalance)}</span>
                </div>
            }</>,
            <div className="tsHBoxForPrint" key="tskey33a">
                <span className="tsInvoiceViewDispField" key="tskey11">GST No</span>
                <span className="tsInvoiceViewValField" key="tskey12">{p_objCstValues.cstGSTNo}</span>
            </div>
        ];

        //Getting custom fields
        if (isEmpty(p_arrCstFields) === false) {

            //Convert it into array
            p_arrCstFields = p_arrCstFields || [];

            p_arrCstFields.forEach(function (p_objRecord) {

                if (p_objRecord.isSystemField === true) {

                    return true;
                }//if..

                LObj = <div className="tsHBoxForPrint">
                    <span className="tsInvoiceViewDispField">{p_objRecord.fieldName}</span>
                    <span className="tsInvoiceViewValField">{p_objCstValues[p_objRecord.columnName]}</span>
                </div>;

                LArrColumn.push(LObj);
            });
        }//if..

        return LArrColumn;
    }

    pvtGetLicencesUI(p_liscenseNos) {

        p_liscenseNos = p_liscenseNos || '';

        var LUI = [];
        p_liscenseNos = p_liscenseNos.split(',');
        p_liscenseNos.forEach(function (p_licNo) {

            LUI.push(<span style={{ fontSize: 13 }}>{p_licNo}</span>);
        });

        return LUI;
    }

    render() {
        var LMe = this,
            LObjInvoice = LMe.props.PInvoice || {},
            LObjPrjData = LMe.props.PProjectData || {};

        return (
            <div className="">
                <div className="tsHBox" style={{
                    padding: '10px 0 0 0'
                }}>
                    <div className="tsVBox flex1" style={{
                        textAlign: 'start',
                        padding: '0 0 0 10px',
                    }}>
                        {LMe.pvtGetLicencesUI(LObjPrjData.liscenseNos)}
                    </div>
                    <span className="tsVBox" style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 20, fontWeight: 'bold' }}>{LObjPrjData.orgName}</span>
                        <span style={{ fontSize: 13 }}>{LObjPrjData.propName}</span>
                        <span style={{ fontSize: 13 }}> {LObjPrjData.propMobileNo}</span>
                    </span>
                    <div className="tsVBox flex1" style={{
                        textAlign: 'end',
                        margin: '0 10px 0 0'
                    }}>
                        <span style={{ fontSize: 13 }}>{LObjPrjData.orgAddress}</span>
                        <span style={{ fontSize: 13 }}>{LObjPrjData.orgCity}</span>
                        <span style={{ fontSize: 13 }}>{LObjPrjData.orgPincode}</span>
                    </div>
                </div>
                <div className="tsVBox">
                    <div className="tsHBoxForPrint tsInvoiceViewBorder">
                        {isEmpty(LObjInvoice.invoiceType) === false ? <><span className="tsInvoiceViewDispField">Invoice Type</span>
                            <span className="tsInvoiceViewValField">{tsGetInvoiceDispNameByActionCode(LObjInvoice.invoiceType)}</span></> : <></>}
                    </div>
                    <div className="tsHBoxForPrint">
                        <span className="tsInvoiceViewDispField">Invoice Number</span>
                        <span className="tsInvoiceViewValField">{tsGetInvoiceDispNoByInvoiceNo(LObjInvoice.invoiceNo, LObjInvoice.invoiceType)}</span>
                    </div>
                    <div className="tsHBoxForPrint">
                        <span className="tsInvoiceViewDispField">Invoice Date</span>
                        <span className="tsInvoiceViewValField">{tsGetDateFromServerDateForPrintField(LObjInvoice.invoiceDate)}</span>
                    </div>
                    {/* Seperator */}
                    {LMe.pvtGetCustomerFields(LObjInvoice.customerData)}
                    {/* Seperator */}
                    <div className="tsHBoxForPrint tsInvoiceViewBorder">
                        <span className="tsInvoiceViewDispField">Payment Mode</span>
                        <span className="tsInvoiceViewValField">{LObjInvoice.mode}</span>
                    </div>
                    <div className="tsHBoxForPrint">
                        <span className="tsInvoiceViewDispField">Credited Amount</span>
                        <span className="tsInvoiceViewValField">Rs. {LObjInvoice.creditedAmount}</span>
                    </div>
                    <div className="tsHBoxForPrint">
                        <span className="tsInvoiceViewDispField">Remark</span>
                        <span className="tsInvoiceViewValField"> {LObjInvoice.remark}</span>
                    </div>
                    {/* Seperator */}
                    <div className="tsHBoxForPrint tsInvoiceViewBorder">
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
                                PIsPrintMode={true}
                            />

                        </span>
                    </div>
                    <div className="tsHBoxForPrint tsInvoiceViewBorder">
                        <span className="tsInvoiceViewDispField">SGST Amount</span>
                        <span className="tsInvoiceViewValField">Rs. {tsGetGstAmount(LMe.state.SProducts, LObjInvoice.grandTotal)}</span>
                    </div>
                    <div className="tsHBoxForPrint">
                        <span className="tsInvoiceViewDispField">CGST Amount</span>
                        <span className="tsInvoiceViewValField">Rs. {tsGetGstAmount(LMe.state.SProducts, LObjInvoice.grandTotal)}</span>
                    </div>
                    <div className="tsHBoxForPrint">
                        <span className="tsInvoiceViewDispField">IGST Amount</span>
                        <span className="tsInvoiceViewValField">Rs. {tsGetIGSTAmount(LMe.state.SProducts, LObjInvoice.grandTotal)}</span>
                    </div>

                    <div className="tsHBoxForPrint">
                        <span className="tsInvoiceViewDispField">Total Inovice Amount</span>
                        <span className="tsInvoiceViewValField">Rs. {LObjInvoice.grandTotal}</span>
                    </div>
                    <div className="tsInvoiceViewBorder"></div>
                </div>

            </div>
        )
    }
}

export default tsfrmInvoiceViewer;