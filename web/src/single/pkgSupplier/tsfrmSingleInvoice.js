import React, { Component } from 'react';

import {
    Button
} from '@material-ui/core';

import TDialog from '../../reusable/tsclsDialog';
import SaveIcon from '@material-ui/icons/Save';
import { BaseUrl, isEmpty, tsGetInvoiceDispNameByActionCode, tsGetInvoiceDispNoByInvoiceNo, isObjEmpty, tsGetProjectId } from '../../tsclsGenUtils';
import { GenConstants } from '../../tsclsGenConstants';
import TInvoice from './tsfrmInvoice';
import TInvoiceViewer from './tsfrmInvoiceViewer';

class tsfrmSingleInvoice extends Component {
    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            IsAlertDialogOpen: false,
            SIsDialogLoading: false,
            SProductsArr: [],
            SPaymentFields: {},
            SCustomerData: {},
            SInvoiceTpl: <></>
        };

        LMe.FWarningText = '';
        LMe.FInvoiceRef = React.createRef();

        LMe.FProjectDataFetchedForActCode = '';
    }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         * 
         */
        var LMe = this,
            LRecord = LMe.props.PSelectedRecord || {};

        LMe.FIsReadOnly = LMe.props.PIsReadOnlyMode;
        LMe.FInvoiceRecord = LRecord;

        if (isEmpty(LMe.FIsReadOnly) === true) {
            LMe.FIsReadOnly = true;
        }

        if (isEmpty(LRecord.invoiceType) === false && isEmpty(LRecord.invoiceNo) === false) {

            LMe.pvtFetchPaymentDetails(LRecord.invoiceType, LRecord.invoiceNo);
            LMe.pvtFetchInvoicesProductByTypeAndId(LRecord.invoiceType, LRecord.invoiceNo);
            return;
        }
        //For print Mode
        LMe.pvtFetchInvoice();
    }

    pvtFetchInvoice() {

        var LMe = this,
            LParam = (LMe.props.match && LMe.props.match.params) || LMe.props.PInvoiceNoAndType || {},
            LUrl = BaseUrl() + 'supplierinvoices/singleInvoice/type/' + LParam.invoiceType + '/invoiceNo/' + LParam.invoiceNo;

        var LRequestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            }
        };
        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.status === false) {

                        LMe.FWarningText = responseJson.message;
                        LMe.setState({ IsAlertDialogOpen: true });
                        return;
                    }//if..

                    LMe.FInvoiceRecord = responseJson || {};

                    LMe.pvtFetchPaymentDetails(responseJson.invoiceType, responseJson.invoiceNo);
                },
                (error) => {

                    LMe.FWarningText = error.message;
                    LMe.setState({ IsAlertDialogOpen: true });
                    return;
                }
            );
    }

    pvtFetchPaymentDetails(p_strInvoiceType, p_intInvoiceNo) {

        var LMe = this,
            LUrl;

        p_strInvoiceType = p_strInvoiceType || LMe.state.SInvoiceType;

        if (isEmpty(p_strInvoiceType) === false && p_strInvoiceType !== GenConstants().PSUDO_INVOICE_TYPE_ALL) {

            LUrl = BaseUrl() + 'payments/type/' + p_strInvoiceType + '/invoiceNo/' + p_intInvoiceNo + '/isPurchaserInvoice/1';
        }//if..

        LMe.setState({ SIsDialogLoading: true });

        var LRequestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            }
        };
        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.status === false) {

                        LMe.FWarningText = responseJson.message;
                        LMe.setState({ IsAlertDialogOpen: true });
                        return;
                    }//if..


                    LMe.pvtFetchCustomersFields();
                    LMe.setState({ SPaymentFields: responseJson || {}, SIsDialogLoading: false });
                },
                (error) => {

                    LMe.FWarningText = error.message;
                    LMe.setState({ IsAlertDialogOpen: true });
                    return;
                }
            );
    }

    pvtFetchInvoicesProductByTypeAndId(p_strInvoiceType, p_intInvoiceNo) {
        /**
         * @method pvtFetchInvoicesProductByTypeAndId
         * This function will fetch the list of sold products
         *
         * @returns: Nothing
         */
        var LMe = this,
            LUrl = BaseUrl() + 'supplierinvoices';

        p_strInvoiceType = p_strInvoiceType || LMe.state.SInvoiceType;

        if (isEmpty(p_strInvoiceType) === false && p_strInvoiceType !== GenConstants().PSUDO_INVOICE_TYPE_ALL) {

            LUrl = BaseUrl() + 'supplierinvoices/type/' + p_strInvoiceType + '/invoiceNo/' + p_intInvoiceNo;
        }//if..

        LMe.setState({ SIsDialogLoading: true });

        var LRequestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            }
        };

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.status === false) {

                        LMe.FWarningText = responseJson.message;
                        LMe.setState({ IsAlertDialogOpen: true });
                        return;
                    }//if..

                    LMe.setState({ SProductsArr: responseJson || [], SIsDialogLoading: false });
                },
                (error) => {

                    LMe.FWarningText = error.message;
                    LMe.setState({ IsAlertDialogOpen: true });
                    return;
                }
            );
    }

    pvtFetchCustomersFields() {
        /**
         * @method pvtFetchCustomersFields
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var LMe = this,
            LUrl;

        LUrl = BaseUrl() + 'customFields/type/' + GenConstants().CUSTOMER_CSTM_FIELDS;

        var LRequestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            }
        };

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.status === 'error') {
                        LMe.setState({
                            FetchedData: [],
                        });
                        return;
                    }

                    LMe.pvtFetchCustomers(responseJson);
                },
                (error) => {
                    this.setState({
                        FetchedData: [],
                    });
                }
            );
    }

    pvtFetchCustomers(p_arrCstFields) {
        /**
         * @method pvtFetchCustomers
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var LMe = this,
            LUrl,
            LCstId = LMe.FInvoiceRecord.cstId;

        LUrl = BaseUrl() + 'customers/' + LCstId;

        var LRequestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            }
        };

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.status === 'error') {
                        LMe.setState({
                            FetchedData: [],
                        });
                        return;
                    }

                    var LObj = {
                        cstFields: p_arrCstFields,
                        cstFieldValues: responseJson
                    };

                    LMe.setState({ SCustomerData: LObj });
                },
                (error) => {
                    this.setState({
                        FetchedData: [],
                    });
                }
            );
    }

    pvtHandleOnClose() {
        var LMe = this;

        LMe.props.OnDialogClose();
    }

    pvtGetDialogContent() {
        var LMe = this,
            LInvoice = { ...LMe.FInvoiceRecord };

        LInvoice.products = LInvoice.products || LMe.state.SProductsArr || [];

        LInvoice.customerData = LMe.state.SCustomerData || {};

        if (isEmpty(LInvoice.products) || LInvoice.products.length === 0 ||
            isObjEmpty(LMe.state.SPaymentFields) || isObjEmpty(LInvoice.customerData)) {
            return <></>;
        }

        LInvoice.creditedAmount = LMe.state.SPaymentFields.total - LMe.state.SPaymentFields.credit;

        if (LMe.state.SPaymentFields.credit === 0) {
            LInvoice.creditedAmount = LMe.state.SPaymentFields.total + LMe.state.SPaymentFields.debit;
        }

        LInvoice.mode = LMe.state.SPaymentFields.mode;
        LInvoice.remark = LMe.state.SPaymentFields.remark;

        //Setting invoice Type
        LInvoice.strInvoiceNo = LInvoice.products[0].strInvoiceNo;

        //For read only mode
        if (LMe.FIsReadOnly === true) {

            // return <TInvoiceViewer
            //     PSelectedRecord={LInvoice}
            // />;
            if (LMe.props.PIsDetailedView === true) {

                return <TInvoiceViewer
                    PSelectedRecord={LInvoice}
                />;
            }
            else {

                LMe.pvtLoadTemplate(LInvoice);
                return LMe.state.SInvoiceTpl;
            }
        }
        //For Edit mode
        return <TInvoice
            PIsOpenInDialog={true}
            ref={LMe.FInvoiceRef}
            PSelectedRecord={LInvoice}
        />;
    }

    pvtFetchProjectDetails(p_callback) {
        /**
         * @method pvtFetchProjectDetails
         * This function will fetch the project details from server
         *
         * @returns: Project Objects 
         */
        var //LMe = this,
            LUrl;

        LUrl = BaseUrl() + 'project';

        var LRequestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            }
        };

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.status === false) {
                        return;
                    }//if..

                    if (isEmpty(p_callback) === false) {

                        p_callback(responseJson);
                    }//if..
                },
                (error) => {
                }
            );
    }

    pvtLoadTemplate(p_objInvoice) {
        /**
         * @method pvtLoadTemplate
         * This method will do following taks
         * 1. Check PTemplateCode prop if got then go to  step 2
         * 2. Fetch projectdata and default template from project tbl
         * 3. import that template and return
         */

        var LMe = this,
            LTplActionCode = LMe.props.PTplActionCode || LMe.FProjectDataFetchedForActCode;

        if (isEmpty(LTplActionCode) === false && LMe.FProjectDataFetchedForActCode === LTplActionCode) {

            return;
        }

        // return <>{JSON.stringify(p_objInvoice)}</>;
        var L_callBack = function (p_objProjectData) {

            if (isEmpty(LTplActionCode) === true) {

                //if tpl action code not found then fetch default tpl
                LTplActionCode = p_objProjectData.defaultInvoice;
            }//if..

            LMe.FProjectDataFetchedForActCode = LTplActionCode;

            const TModule = require('./tplInvoices/' + (LTplActionCode)).default;

            LMe.setState({
                SInvoiceTpl: <TModule
                    PInvoice={p_objInvoice}
                    PProjectData={p_objProjectData}
                ></TModule>
            });
        };

        LMe.pvtFetchProjectDetails(L_callBack);
    }

    pvtGetDialogAction() {
        var LMe = this;

        //For read only mode
        if (LMe.FIsReadOnly === true) {

            return;
        }

        //For Edit mode
        return <Button
            style={{ margin: '0 0 0 10px' }}
            size="small"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disableElevation
            onClick={() => { LMe.FInvoiceRef.current.EditInvoice(LMe.props.OnDialogClose) }}
        >
            Save and Print Invoice
        </Button>;
    }

    render() {
        var LMe = this,
            LParam = (LMe.props.match && LMe.props.match.params) || LMe.props.PInvoiceNoAndType || {},
            LRecord = LMe.FInvoiceRecord || {};

        if (isEmpty(LParam.invoiceType) === false && isEmpty(LParam.invoiceNo) === false && isEmpty(LRecord) === false) {

            return LMe.pvtGetDialogContent();
        }

        return (
            <>
                {/* Window */}
                <TDialog
                    IsDialogOpen={LMe.props.IsDialogOpen}
                    OnDialogClose={() => LMe.pvtHandleOnClose()}
                    DialogContent={LMe.pvtGetDialogContent()}
                    DialogActions={LMe.pvtGetDialogAction()}
                    DialogHeader={tsGetInvoiceDispNameByActionCode(LRecord.invoiceType) + ' - Inovice No ' + tsGetInvoiceDispNoByInvoiceNo(LRecord.invoiceNo, LRecord.invoiceType, 1)}
                    DialogLoading={LMe.state.SIsDialogLoading}
                    IsWindow={true}
                />

                {/* Warning Dialog */}
                <TDialog
                    IsDialogOpen={LMe.state.IsAlertDialogOpen}
                    OnDialogClose={() => LMe.setState({ IsAlertDialogOpen: false })}
                    DialogContent={LMe.FWarningText || ''}
                    DialogActions={<></>}
                    DialogHeader={'Warning'}
                    IsWindow={false}
                />
            </>
        );
    }
}

export default tsfrmSingleInvoice;