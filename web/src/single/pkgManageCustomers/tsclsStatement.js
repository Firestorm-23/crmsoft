import React, { Component } from 'react';

import { BaseUrl, isEmpty, tsGetProjectId } from '../../tsclsGenUtils';
import { GenConstants } from '../../tsclsGenConstants';
import TDialog from '../../reusable/tsclsDialog';

class tsclsStatement extends Component {

    constructor(props) {

        super(props);

        var LMe = this;

        LMe.state = {
            SIsDialogLoading: false,
            IsAlertDialogOpen: false,
            SInvoiceTpl: <></>
        };
    }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         * 
         */

        var LMe = this,
            LParams = (LMe.props.match && LMe.props.match.params) || {};

        LMe.pvtFetchProjectDetails((p_objPrjDetails) => {

            LMe.pvtFetchPaymentDetails(LParams, (p_arrPaymentRecords) => {

                LMe.pvtFetchCustomersFields(LParams.cstId, (p_objCustomerData) => {

                    var LInvoice = {
                        customerData: p_objCustomerData || {},
                        paymentRecords: p_arrPaymentRecords || []
                    };

                    LMe.pvtLoadTemplate(p_objPrjDetails, LInvoice, LParams);
                });
            });
        });
    }

    pvtLoadTemplate(p_objPrjDetails, p_objInvoice, p_reqParams) {
        /**
         * @method pvtLoadTemplate
         * This method will load the template
         * This will first check for template code in prop other wise load default template
         */
        var LMe = this,
            LTplActionCode = LMe.props.PTplActionCode || p_objPrjDetails.defaultStatement;

        const TModule = require('./tplStatement/' + (LTplActionCode)).default;

        LMe.setState({
            SInvoiceTpl: <TModule
                PInvoice={p_objInvoice}
                PProjectData={p_objPrjDetails}
                PReqParam={p_reqParams}
            ></TModule>
        });
    }

    pvtFetchCustomersFields(p_intCstId, p_callback) {
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
        // No need to check for session
        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.status === 'error') {

                        LMe.FWarningText = responseJson.message;
                        LMe.setState({ IsAlertDialogOpen: true });
                        return;
                    }

                    LMe.pvtFetchCustomers(p_intCstId, responseJson, p_callback);
                },
                (error) => {

                    LMe.FWarningText = error.message;
                    LMe.setState({ IsAlertDialogOpen: true });
                    return;
                }
            );
    }

    pvtFetchCustomers(p_intCstId, p_arrCstFields, p_callback) {
        /**
         * @method pvtFetchCustomers
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var LMe = this,
            LUrl,
            LCstId = p_intCstId;

        if (isEmpty(LCstId) === true) {
            LMe.FWarningText = 'Customer id is mandatory';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        }

        LUrl = BaseUrl() + 'customers/' + LCstId;

        var LRequestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            }
        };

        // No need to check for session
        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {

                    if (responseJson.status === false) {

                        LMe.FWarningText = responseJson.message;
                        LMe.setState({ IsAlertDialogOpen: true });
                        return;
                    }

                    var LObj = {
                        cstFields: p_arrCstFields,
                        cstFieldValues: responseJson
                    };

                    if (isEmpty(p_callback) === false) {

                        p_callback(LObj);
                    }//if..
                },
                (error) => {
                    LMe.FWarningText = error.message;
                    LMe.setState({ IsAlertDialogOpen: true });
                }
            );
    }

    pvtFetchProjectDetails(p_callback) {
        /**
         * @method pvtFetchProjectDetails
         * This function will fetch the project details from server
         *
         * @returns: Project Objects 
         */
        var LMe = this,
            LUrl;

        LUrl = BaseUrl() + 'project';

        var LRequestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            }
        };

        // No need to check for session
        fetch(LUrl, LRequestOptions).then((response) => response.json()).then(
            (responseJson) => {
                if (responseJson.status === false) {

                    LMe.FWarningText = responseJson.message;
                    LMe.setState({ IsAlertDialogOpen: true });
                    return;
                }//if..

                if (isEmpty(p_callback) === false) {

                    p_callback(responseJson);
                }//if..
            },
            (error) => {
                LMe.FWarningText = error.message;
                LMe.setState({ IsAlertDialogOpen: true });
            }
        );
    }

    pvtFetchPaymentDetails(p_paramObj, p_callback) {
        /**
         * @method pvtFetchProducts
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var LMe = this,
            LParamObj = p_paramObj,
            LRequestOptions,
            LUrl;

        LUrl = BaseUrl() + 'statement/customers';

        LRequestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify(LParamObj),
        };

        // No need to check for session
        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.success === false) {
                        LMe.FWarningText = responseJson.message;
                        LMe.setState({ IsAlertDialogOpen: true });
                        return;
                    }//if..


                    if (isEmpty(p_callback) === false) {

                        p_callback(responseJson);
                    }//if..
                },
                (error) => {
                    LMe.FWarningText = error.message;
                    LMe.setState({ IsAlertDialogOpen: true });
                    return;
                }
            );
    }

    render() {
        var LMe = this;

        return <>
            {LMe.state.SInvoiceTpl}
            {/* Warning Dialog */}
            <TDialog
                IsDialogOpen={LMe.state.IsAlertDialogOpen}
                OnDialogClose={() => LMe.setState({ IsAlertDialogOpen: false })}
                DialogContent={LMe.FWarningText || <></>}
                DialogActions={<></>}
                DialogHeader={'Warning'}
                IsWindow={false}
            />
        </>;
    }
}

export default tsclsStatement;