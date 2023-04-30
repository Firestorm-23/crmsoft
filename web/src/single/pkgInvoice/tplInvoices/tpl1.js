import React, { Component } from 'react';
import { GenConstants } from '../../../tsclsGenConstants';
// import { GenConstants } from '../../tsclsGenConstants';
import {
    tsGetInvoiceDispNameByActionCode, tsConvertNumInToWords,
    isEmpty, tsGetInvoiceDispNoByInvoiceNo, tsGetDateFromServerDateForPrintField, tsGetGstAmount, tsGetIGSTAmount
} from '../../../tsclsGenUtils';
import TProductSelectionCntr from '../tsfrmProductSelectionCntr';
import './tpl.css';

class tsfrmInvoiceViewer extends Component {
    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            SProducts: []
        };
    }

    componentDidMount() {

        var LMe = this,
            LCstData = LMe.props.PInvoice.customerData || {};

        if (isEmpty(LCstData) === false && isEmpty(LCstData.cstFieldValues) === false && LMe.props.PIsShowingInApp === false) {

            document.title = LCstData.cstFieldValues.cstName;
        }
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
            <tr className="">
                <td className="tsTdProperty">Customer Name: </td>
                <td className="tsTdVal">{p_objCstValues.cstName}</td>
            </tr>,
            <>{
                p_objCstValues.cstBalance === 0 ? <></> : <tr className="">
                    <td className="tsTdProperty">Balance: </td>
                    <td className="tsTdVal">{L_funGetBalance(p_objCstValues.cstBalance)}</td>
                </tr>
            }</>,
            <tr className="">
                <td className="tsTdProperty">GST No: </td>
                <td className="tsTdVal">{p_objCstValues.cstGSTNo}</td>
            </tr>
        ];

        //Getting custom fields
        if (isEmpty(p_arrCstFields) === false) {

            //Convert it into array
            p_arrCstFields = p_arrCstFields || [];

            p_arrCstFields.forEach(function (p_objRecord) {

                if (p_objRecord.isSystemField === true) {

                    return true;
                }//if..

                LObj = <tr className="">
                    <td className="tsTdProperty">{p_objRecord.fieldName}: </td>
                    <td className="tsTdVal">{p_objCstValues[p_objRecord.columnName]}</td>
                </tr>;

                LArrColumn.push(LObj);
            });
        }//if..

        return <table className="tsTbl">{LArrColumn}</table>;
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

    pvtGetGSTContainer(p_arrProducts, p_intGrandTotal, p_strPropertyText) {

        var LGstAmount;

        if (p_strPropertyText === GenConstants().IGST) {
            LGstAmount = tsGetIGSTAmount(p_arrProducts, p_intGrandTotal);
        }
        else {
            LGstAmount = tsGetGstAmount(p_arrProducts, p_intGrandTotal);
        }

        if (LGstAmount < 1) {
            return null;
        }

        return <tr>
            <td className="tsTdProperty">{p_strPropertyText}: </td>
            <td className="tsTdVal">Rs. {LGstAmount}</td>
        </tr>;
    }

    render() {
        var LMe = this,
            LObjInvoice = LMe.props.PInvoice || {},
            LObjPrjData = LMe.props.PProjectData || {};

        return (
            <div className="tsRootPg">
                <div className="tsHBox" style={{
                    padding: '10px 0 5px 0'
                }}>

                    <div className="tsVBox flex1" style={{
                        textAlign: 'start',
                        padding: '0 0 0 10px',
                    }}>
                        {LMe.pvtGetLicencesUI(LObjPrjData.liscenseNos)}
                    </div>
                    <span className="tsVBox" style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 20, fontWeight: 'bold', }}>{LObjPrjData.orgName}</span>
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
                <div className="tsVBox flex1" style={{
                    borderTop: '1px solid #aaa'
                }}>
                    <div className="tsHBox">
                        <div className="tsVBox flex1">
                            <div>{LMe.pvtGetCustomerFields(LObjInvoice.customerData)}</div>
                        </div>

                        <div style={{ textAlign: 'center', margin: '15px 0 0 0', fontWeight: 'bold' }}>Tax Invoice</div>

                        <div className="tsHBox flex1" >
                            <div className="flex1"></div>
                            <div>
                                <table className="tsTbl">
                                    <tr>
                                        {isEmpty(LObjInvoice.invoiceType) === false ? <><td className="tsTdProperty">Invoice Type: </td>
                                            <td className="tsTdVal">{tsGetInvoiceDispNameByActionCode(LObjInvoice.invoiceType)}</td></> : <></>}
                                    </tr>
                                    <tr>
                                        <td className="tsTdProperty">Invoice Number: </td>
                                        <td className="tsTdVal">{tsGetInvoiceDispNoByInvoiceNo(LObjInvoice.invoiceNo, LObjInvoice.invoiceType)}</td>
                                    </tr>
                                    <tr>
                                        <td className="tsTdProperty">Invoice Date: </td>
                                        <td className="tsTdVal">{tsGetDateFromServerDateForPrintField(LObjInvoice.invoiceDate)}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="tsVBox flex1" style={{
                        borderTop: '1px solid #aaa',
                        borderBottom: '1px solid #aaa'
                    }}>
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
                    </div>
                    {/* Footer */}
                    <div className="tsHBox" style={{ borderBottom: '0.5px solid #aaa' }}>

                        <div className="flex1" >
                            <table className="tsTbl" style={{}}>
                                <tr>
                                    <td className="tsTdProperty">Payment Mode: </td>
                                    <td className="tsTdVal">{LObjInvoice.mode}</td>
                                </tr>
                                <tr>
                                    <td className="tsTdProperty">Credited Amount: </td>
                                    <td className="tsTdVal">Rs. {LObjInvoice.creditedAmount}</td>
                                </tr>
                                <tr>
                                    <td className="tsTdProperty">Invoice Amount In Word: </td>
                                    <td className="tsTdVal" style={{ fontSize: 12 }}>{tsConvertNumInToWords(LObjInvoice.grandTotal)}</td>
                                </tr>
                            </table>
                        </div>
                        <div style={{ borderLeft: '0.5px solid #aaa' }}>
                            <table className="tsTbl" style={{}}>
                                {LMe.pvtGetGSTContainer(LMe.state.SProducts, LObjInvoice.grandTotal, GenConstants().CGST)}
                                {LMe.pvtGetGSTContainer(LMe.state.SProducts, LObjInvoice.grandTotal, GenConstants().SGST)}
                                {LMe.pvtGetGSTContainer(LMe.state.SProducts, LObjInvoice.grandTotal, GenConstants().IGST)}
                                <tr>
                                    <td className="tsTdProperty">Total Inovice Amount: </td>
                                    <td className="tsTdVal">Rs. <b>{LObjInvoice.grandTotal}</b></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="tsHBox" style={{
                    borderBottom: '1px solid #aaa',
                    fontSize: 12,
                    paddingTop: 15
                }}>
                    <div className="flex1" style={{ textAlign: 'left', marginLeft: 10 }}>Authorised Signature</div>
                    <div className="flex1" style={{ textAlign: 'right', marginRight: 10 }}>Customer's Signature</div>
                </div>
            </div>
        )
    }
}

export default tsfrmInvoiceViewer;