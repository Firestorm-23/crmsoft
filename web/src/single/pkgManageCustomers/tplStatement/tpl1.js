import React, { Component } from 'react';

import {
    tsGetInvoiceDispNameByActionCode,
    isEmpty, tsGetInvoiceDispNoByInvoiceNo, tsGetDateFromServerDateForPrintField
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
            LObj = {};
        // L_funGetBalance = function (p_value) {
        //     var LValue = p_value;

        //     if (LValue > 0) {

        //         return LValue + ' Cr';
        //     }
        //     else if (LValue < 0) {

        //         return Math.abs(LValue) + ' Dr';
        //     }

        //     return LValue;
        // };

        LArrColumn = [
            <tr key="statementCstName" className="">
                <td className="tsTdProperty">Customer Name: </td>
                <td className="tsTdVal">{p_objCstValues.cstName}</td>
            </tr>,

            // <tr className="">
            //     <td className="tsTdProperty">Balance: </td>
            //     <td className="tsTdVal">{p_objCstValues.cstBalance === 0 ? <i>Nil</i> : L_funGetBalance(p_objCstValues.cstBalance)}</td>
            // </tr>
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

            p_arrCstFields.forEach(function (p_objRecord, p_intIndex) {

                if (p_objRecord.isSystemField === true) {

                    return true;
                }//if..

                LObj = <tr key={'statementField' + p_intIndex} className="">
                    <td className="tsTdProperty">{p_objRecord.fieldName}: </td>
                    <td className="tsTdVal">{p_objCstValues[p_objRecord.columnName]}</td>
                </tr>;

                LArrColumn.push(LObj);
            });
        }//if..

        return <table className="tsTbl"><tbody>{LArrColumn}</tbody></table>;
    }

    pvtGetTableRows(p_arrPaymentRecords) {

        var LArrRows = [];

        p_arrPaymentRecords = p_arrPaymentRecords || [];

        p_arrPaymentRecords.forEach(function (p_objRecord) {


            LArrRows.push(
                <tr>
                    <td>
                        {tsGetDateFromServerDateForPrintField(p_objRecord.paymentDate)}
                    </td>
                    <td>
                        {tsGetInvoiceDispNameByActionCode(p_objRecord.invoiceType)}
                    </td>
                    <td>
                        {tsGetInvoiceDispNoByInvoiceNo(p_objRecord.invoiceNo || p_objRecord.id, p_objRecord.invoiceType, p_objRecord.isPurchaserInvoice)}
                    </td>
                    <td>
                        {p_objRecord.mode}
                    </td>
                    <td>
                        Rs. {p_objRecord.total}
                    </td>
                    <td>
                        Rs. {p_objRecord.credit}
                    </td>
                    <td>
                        Rs. {p_objRecord.debit}
                    </td>
                    <td>
                        {p_objRecord.balance}
                    </td>
                </tr>
            );
        });

        return LArrRows;
    }

    render() {
        var LMe = this,
            LObjInvoice = LMe.props.PInvoice || {},
            LObjPrjData = LMe.props.PProjectData || {};

        return (
            <div className="tsRootPg" style={{
                margin: '10px 0 10px 0'
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
                    borderTop: '0.5px solid #aaa',
                    // borderBottom: '0.5px solid #aaa',
                }}>
                    <div className="tsHBox">
                        <div className="tsVBox flex1">
                            <div>{LMe.pvtGetCustomerFields(LObjInvoice.customerData)}</div>
                        </div>

                        <div className="flex1" style={{ textAlign: 'center', margin: '15px 0 0 0', fontWeight: 'bold' }}>
                            Statement
                        </div>

                        <div className="tsHBox flex1">
                            <div className="flex1"></div>
                            <div><table className="tsTbl">
                                <tbody>
                                    <tr key="statementFromdate">
                                        <td className="tsTdProperty">From Date: </td>
                                        <td className="tsTdVal">{LMe.props.PReqParam && LMe.props.PReqParam.fromDate}</td>
                                    </tr>
                                    <tr key="statementTodate">
                                        <td className="tsTdProperty">To Date: </td>
                                        <td className="tsTdVal">{LMe.props.PReqParam && LMe.props.PReqParam.toDate}</td>
                                    </tr>
                                </tbody>
                            </table></div>
                        </div>
                    </div>

                    <table className="tsStatementTbl">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Invocie Type</th>
                                <th>Invocie No</th>
                                <th>Pay Mode</th>
                                <th>Total</th>
                                <th>Credit</th>
                                <th>Debit</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LMe.pvtGetTableRows(LObjInvoice.paymentRecords)}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default tpl1;