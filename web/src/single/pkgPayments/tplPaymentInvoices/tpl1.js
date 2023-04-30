import React, { Component } from 'react';

import {
    tsGetInvoiceDispNameByActionCode, tsConvertNumInToWords,
    isEmpty, tsGetInvoiceDispNoByInvoiceNo, tsGetDateFromServerDateForPrintField, tsIsInvoiceByType
} from '../../../tsclsGenUtils';

import './tpl.css';

class tpl1 extends Component {

    componentDidMount() {

        var LMe = this,
            LCstData = LMe.props.PInvoice.customerData || {};

        if (isEmpty(LCstData) === false && isEmpty(LCstData.cstFieldValues) === false) {

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
            // Here we always show balance
            <tr className="">
                <td className="tsTdProperty">Balance: </td>
                <td className="tsTdVal">{p_objCstValues.cstBalance === 0 ? <i>Nil</i> : L_funGetBalance(p_objCstValues.cstBalance)}</td>
            </tr>,
            <tr className="">
                <td className="tsTdProperty">GST No: </td>
                <td className="tsTdVal">{p_objCstValues.cstGSTNo}</td>
            </tr>,
            // <>{
            //     p_objCstValues.cstBalance === 0 ? <></> : <tr className="">
            //         <td className="tsTdProperty">Balance: </td>
            //         <td className="tsTdVal">{L_funGetBalance(p_objCstValues.cstBalance)}</td>
            //     </tr>
            // }</>
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

    render() {
        var LMe = this,
            LObjInvoice = LMe.props.PInvoice || {},
            LObjPrjData = LMe.props.PProjectData || {},
            LIsCreditMode = LObjInvoice.paymentRecord.debit === 0;

        return (
            <div className="tsRootPg" style={{
                margin: '10px 0 0 0'
            }}>
                <div className="tsHBox" style={{
                    padding: '10px 0 5px 0'
                }}>

                    <div className="tsVBox flex1" style={{
                        textAlign: 'start',
                        padding: '0 0 0 10px',
                    }}>
                        {/* {LMe.pvtGetLicencesUI(LObjPrjData.liscenseNos)} */}
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

                        <div style={{ textAlign: 'center', margin: '15px 0 0 0', fontWeight: 'bold' }}>
                            {LIsCreditMode ? 'Credit Note' : 'Debit Note'}
                        </div>

                        <div className="tsHBox flex1" >
                            <div className="flex1"></div>
                            <div>
                                <table className="tsTbl">
                                    <tr>
                                        <td className="tsTdProperty">Payment Receipt No: </td>
                                        <td className="tsTdVal">{tsGetInvoiceDispNoByInvoiceNo(LObjInvoice.paymentRecord.id, LObjInvoice.paymentRecord.invoiceType, null)}</td>
                                    </tr>
                                    <tr>
                                        {isEmpty(LObjInvoice.paymentRecord.invoiceType) === false ? <><td className="tsTdProperty">Invoice Type: </td>
                                            <td className="tsTdVal">{tsGetInvoiceDispNameByActionCode(LObjInvoice.paymentRecord.invoiceType)}</td></> : <></>}
                                    </tr>
                                    {tsIsInvoiceByType(LObjInvoice.paymentRecord.invoiceType) ? <tr>
                                        <td className="tsTdProperty">Invoice Number: </td>
                                        <td className="tsTdVal">{tsGetInvoiceDispNoByInvoiceNo(LObjInvoice.paymentRecord.invoiceNo, LObjInvoice.paymentRecord.invoiceType, LObjInvoice.paymentRecord.isPurchaserInvoice)}</td>
                                    </tr> : <></>}
                                    <tr>
                                        <td className="tsTdProperty">Invoice Date: </td>
                                        <td className="tsTdVal">{tsGetDateFromServerDateForPrintField(LObjInvoice.paymentRecord.paymentDate)}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="tsHBox" style={{ padding: '20px', borderBottom: '0.5px solid #aaa', borderTop: '0.5px solid #aaa' }}>

                        <div className="flex1" >
                        </div>
                        <table className="tsTbl">
                            <tr>
                                <td className="tsTdProperty">Payment Mode: </td>
                                <td className="tsTdVal">{LObjInvoice.paymentRecord.mode}</td>
                            </tr>
                            {tsIsInvoiceByType(LObjInvoice.paymentRecord.invoiceType) ? <tr>
                                <td className="tsTdProperty">Invoice Total: </td>
                                <td className="tsTdVal">Rs.{LObjInvoice.paymentRecord.total}</td>
                            </tr> : <></>}
                            <tr>
                                <td className="tsTdProperty" style={{
                                    fontWeight: 'bold'
                                }}>{LIsCreditMode ? 'Credited Amount' : 'Debited Amount'}: </td>
                                <td className="tsTdVal" style={{
                                    fontWeight: 'bold',
                                    fontSize: 15
                                }}>Rs.{LIsCreditMode ? LObjInvoice.paymentRecord.credit : LObjInvoice.paymentRecord.debit}</td>
                            </tr>
                            <tr>
                                <td className="tsTdProperty">In words:</td>
                                <td className="tsTdVal">
                                    {tsConvertNumInToWords(LIsCreditMode ? LObjInvoice.paymentRecord.credit : LObjInvoice.paymentRecord.debit)}
                                </td>
                            </tr>
                            {
                                isEmpty(LObjInvoice.paymentRecord.remark) === false ? <tr>
                                    <td className="tsTdProperty">Remark:</td>
                                    <td className="tsTdVal">
                                        {LObjInvoice.paymentRecord.remark}
                                    </td> </tr> : <></>
                            }
                        </table>
                        <div className="flex1" >
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className="tsHBox" style={{
                    borderBottom: '1px solid #aaa',
                    fontSize: 12,
                    paddingTop: 30
                }}>
                    <div className="flex1" style={{ textAlign: 'left', marginLeft: 10 }}>Authorised Signature</div>
                    <div className="flex1" style={{ textAlign: 'right', marginRight: 10 }}>Customer's Signature</div>
                </div>
            </div>
        )
    }
}

export default tpl1;