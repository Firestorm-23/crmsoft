import React, { Component } from 'react';
import {
    Box, Paper, Tooltip
} from '@material-ui/core';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import TCmpFilters from '../../reusable/cmpFilters';
import CircularProgress from '@material-ui/core/CircularProgress';
import { BaseUrl, isEmpty, tsGetInvoiceDispNameByActionCode, tsGetProjectId } from '../../tsclsGenUtils';
import { TreeView, TreeItem } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { GenConstants } from '../../tsclsGenConstants';

class frmCashflowReport extends Component {

    constructor(props) {

        super(props);

        var LMe = this;

        LMe.state = {
            SDataOnUI: null
        };
    }

    componentDidMount() {
        var LMe = this;

        LMe.FTotalAmount = {
            totalSale: 0,
            totalCredit: 0,
            totalDebit: 0
        };

        LMe.FDefaultExpandedNodeIds = ['gtotal'];

        LMe.setState({ SDataOnUI: LMe.pvtGetLoadingCntr() });
    }

    pvtOnFilterApplied(p_objSelectedFilterConditions) {

        var LMe = this,
            LRequestOptions,
            LUrl = BaseUrl() + 'statement/cashflow';

        LMe.FTotalAmount = {
            totalSale: 0,
            totalCredit: 0,
            totalDebit: 0
        };

        LRequestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify(p_objSelectedFilterConditions)
        };

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {

                    if (isEmpty(responseJson) || responseJson.success === false) {
                        return false;
                    } //if..

                    LMe.pvtLoadDataOnUI(responseJson);
                },
                (error) => {

                }
            );
    }

    pvtLoadDataOnUI(p_responseJson) {
        var LMe = this,
            LResult;

        LResult = <>
            <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpanded={LMe.FDefaultExpandedNodeIds}
                defaultExpandIcon={<ChevronRightIcon />}
            >
                <TreeItem nodeId={'sale'} label={'Sale'}>{LMe.pvtLoadSaleOnUI(p_responseJson.sale)}</TreeItem>
                <TreeItem nodeId={'purchaser'} label={'Supplier'}>{LMe.pvtLoadPurchaseOnUI(p_responseJson.purshare)}</TreeItem>

                <TreeItem nodeId={'gtotal'} label={'Total'}>
                    <TreeItem nodeId={'gtotalCredit'} label={<>
                        <span className="tsHelpText">Total Credited: Rs.{LMe.FTotalAmount.totalCredit}</span>
                    </>}></TreeItem>
                    <TreeItem nodeId={'gtotalDebit'} label={<>
                        <span className="tsHelpText">Total Debited: Rs.{LMe.FTotalAmount.totalDebit}</span>
                    </>}></TreeItem>
                    <TreeItem nodeId={'gtotalAmt'} label={<>
                        <span className="tsHelpText">Total Amount: Rs.{LMe.FTotalAmount.totalSale}</span>
                    </>}></TreeItem>
                </TreeItem>
            </TreeView></>;

        LMe.setState({ SDataOnUI: LResult });
    }

    pvtGetHintWithStyle(p_strHint) {

        return <span className="tsGrayColor" style={{
            margin: '0 0 0 10px',
            fontSize: 10
        }}>{p_strHint}</span>;
    }

    pvtLoadSaleOnUI(p_responseJson) {

        //Here, we are calculating Sale: Pest, Fert, Seed, PayIn, PayOut

        var LMe = this,
            LTreeItems = [],
            LRecord = {},
            LHintCredit = 'The amount which is paid by customers',
            LPendingAmount,
            LCreditAmount, LDebitAmount, LPayingAmountText, LIsCreditDebitMode = false;

        for (let p_key in p_responseJson) {

            LRecord = p_responseJson[p_key] || {};

            //Defining this text in loop, reason: we need to clear in some cases
            LPayingAmountText = 'Pending Amount';
            LPendingAmount = 'The amount which customers need to pay you (unpaid amount)';
            LIsCreditDebitMode = false;
            LDebitAmount = LRecord.debit;
            LCreditAmount = (LRecord.total - LDebitAmount) + LRecord.credit;

            switch (p_key) {

                case GenConstants().PAYMENT_IN_ACT_CODE:
                    LCreditAmount = LRecord.credit;

                    //This is for UI purpose
                    LDebitAmount = LRecord.credit;

                    LIsCreditDebitMode = true;
                    LPayingAmountText = 'Payment Credited';
                    LPendingAmount = 'Here you can see the payment-credited amount from payment reciept';
                    break;

                case GenConstants().PAYMENT_OUT_ACT_CODE:
                    LDebitAmount = LRecord.debit;
                    LCreditAmount = 0;
                    LPayingAmountText = 'Payment Debited';
                    LPendingAmount = 'Here you can see the payment-debited amount from payment reciept';
                    LIsCreditDebitMode = true;

                    LMe.FTotalAmount.totalDebit += LDebitAmount;
                    break;

                default:
            }

            LMe.FTotalAmount.totalSale += LRecord.total;
            LMe.FTotalAmount.totalCredit += LCreditAmount;

            LTreeItems.push(
                <TreeItem nodeId={p_key} label={tsGetInvoiceDispNameByActionCode(p_key)} key={p_key + 'cashflowsale'}>
                    {LIsCreditDebitMode === false ? <>
                        <TreeItem nodeId={p_key + 'total'} key={p_key + 'total'} label={<span className="tsHelpText">Total Amount: Rs.{LRecord.total}</span>} />
                        <TreeItem nodeId={p_key + 'credit'} key={p_key + 'credit'} label={
                            <Tooltip title={LHintCredit} placement="right" key={p_key + 'tooltipmenukey'}>
                                <span className="tsHelpText">Total Credited: Rs.{LCreditAmount} {LMe.pvtGetHintWithStyle(LHintCredit)}</span>
                            </Tooltip>
                        } />
                    </> : null}
                    <TreeItem nodeId={p_key + 'debit'} key={p_key + 'debit'} label={
                        <Tooltip title={LPendingAmount} placement="right" key={p_key + 'tooltipmenukey'}>
                            <span className="tsHelpText">
                                {LPayingAmountText}: Rs.{LDebitAmount}
                                {LMe.pvtGetHintWithStyle(LPendingAmount)}
                            </span>
                        </Tooltip>} />
                </TreeItem>
            );

            LMe.FDefaultExpandedNodeIds.push(p_key);
        }//for..

        return LTreeItems;
    }

    pvtLoadPurchaseOnUI(p_responseJson) {

        var LMe = this,
            LTreeItems = [],
            LRecord = {},
            LHintDebit = 'Amount paid to suppliers',
            LHintPending = 'The amount which you will need to pay to suppliers',
            LDebitAmount = 0;

        for (let p_key in p_responseJson) {

            LRecord = p_responseJson[p_key] || {};

            LDebitAmount = (LRecord.total - LRecord.credit) + LRecord.debit;

            LMe.FTotalAmount.totalDebit += LDebitAmount;

            LTreeItems.push(
                <TreeItem nodeId={p_key + 'cashflowpurshase'} label={tsGetInvoiceDispNameByActionCode(p_key)} key={p_key + 'cashflowpurshase'}>
                    <TreeItem nodeId={p_key + 'totalpurshase'} key={p_key + 'totalpurshase'} label={<span className="tsHelpText">Total Amount: Rs.{LRecord.total}</span>} />
                    <TreeItem nodeId={p_key + 'creditpurshase'} key={p_key + 'creditpurshase'} label={
                        <Tooltip title={LHintDebit} placement="right" key={p_key + 'tooltipmenukeypurshase'}>
                            <span className="tsHelpText">Total Debited: Rs.{LDebitAmount} {LMe.pvtGetHintWithStyle(LHintDebit)} </span>
                        </Tooltip>
                    } />
                    <TreeItem nodeId={p_key + 'debitpurshase'} key={p_key + 'debitpurshase'} label={
                        <Tooltip title={LHintPending} placement="right" key={p_key + 'tooltipmenukeypurshase'}>
                            <span className="tsHelpText">
                                Pending Amount: Rs.{LRecord.credit}
                                {LMe.pvtGetHintWithStyle(LHintPending)}
                            </span>
                        </Tooltip>} />
                </TreeItem>
            );

            LMe.FDefaultExpandedNodeIds.push(p_key + 'cashflowpurshase');
        }//for..

        return LTreeItems;
    }

    pvtGetLoadingCntr() {

        return (
            <div className="tsMiddle">
                <CircularProgress />
            </div>
        );
    }

    render() {
        var LMe = this;

        return (
            <div
                className="flex1 tsVBox tsOverFlowAuto"
                style={{
                    margin: '10px 0 10px 0',
                }}
            >
                <Box component="div" display="flex" px={3} pb={2}>
                    {/* Module Icon */}
                    <div style={{ margin: '20px 6px 0 0' }}>
                        <AccountBalanceIcon />
                    </div>
                    <div style={{ margin: '18px 6px 0 0' }}>
                        {/* Module Title */}
                        <div style={{ fontSize: '20px' }}> {LMe.props.moduleInfo.displayTxt} </div>

                        {/* Module Description */}
                        <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
                            Check invoices complete cash flow.
                        </Box>
                    </div>
                </Box>
                <TCmpFilters
                    onFilterApplied={LMe.pvtOnFilterApplied.bind(LMe)}
                    PCanAddShowInvoiceType={false}
                ></TCmpFilters>

                <Paper style={{ margin: 20, padding: 20 }} className="flex1 tsVBox tsOverFlowAuto" variant="outlined">

                    {LMe.state.SDataOnUI}
                </Paper>
            </div>
        );
    }
}

export default frmCashflowReport;