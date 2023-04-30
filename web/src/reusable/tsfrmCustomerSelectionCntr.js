import React, { Component } from 'react';
import {
    Box,
    Button,
    TextField
} from '@material-ui/core';
import { isEmpty, BaseUrl, tsGetProjectId } from '../tsclsGenUtils';
import TDialog from './tsclsDialog';
import SaveIcon from '@material-ui/icons/Save';
import TGridCustomer from '../single/pkgManageCustomers/tsfrmCustomersGrid';

class tsfrmCustomerSelectionCntr extends Component {
    /**
     * @props 
     * SetCstId function: This is called when customer is selected or selection is changed.
     * cstId: If this class got the cstId prop then this class will fetch the customer for that id
     */

    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            FetchedData: [],
            IsDialogOpen: false,
            IsAlertDialogOpen: false,
            SCstObj: {
                cstName: ''
            }
        };
    }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         * 
         */
        var LMe = this;

        if (isEmpty(LMe.FSelectedRecord) === true && isEmpty(LMe.props.cstId) === false && LMe.props.cstId !== -1) {

            LMe.pvtFetchCustomerById(LMe.props.cstId);
        }
    }

    pvtFetchCustomerById(p_intCustomerId) {
        /**
         * @method pvtFetchCustomerById
         * This function will fetch the customer
         *
         * @returns: Nothing
         */
        var LMe = this,
            LUrl;

        LUrl = BaseUrl() + 'customers/' + p_intCustomerId;

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

                        return;
                    }//if..

                    LMe.HandleOnSelect(responseJson);
                },
                (error) => { }
            );
    }

    pvtGetDialogAction() {
        var LMe = this;

        return (
            <Button
                onClick={() => { LMe.HandleOnSelect() }}
                color="primary" variant="contained" size="small" startIcon={<SaveIcon />}>
                Select
            </Button>
        );
    }

    pvtGetDialogContent() {

        var LMe = this;

        return (
            <TGridCustomer
                IsSelectMode={true}
                HandleOnSelect={(p_objRecord) => LMe.HandleOnSelect(p_objRecord)}
                SelectedRecord={(p_objRecord) => LMe.FSelectedRecord = p_objRecord}
            ></TGridCustomer>
        );
    }

    HandleOnSelect(p_objSelectedRecord) {
        /**
         * @method HandleOnSelect
         * This method handle on select the record from pop up
         */
        var LMe = this,
            LSelectedRecord = p_objSelectedRecord || LMe.FSelectedRecord;

        if (isEmpty(LSelectedRecord) === true) {
            LMe.FWarningText = 'Select a Customer and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..

        LMe.props.SetCstId(LSelectedRecord.id || -1);
        LMe.setState({ IsDialogOpen: false, SCstObj: LSelectedRecord });
    }

    pvtGetDialog() {
        var LMe = this;

        if (LMe.state.IsDialogOpen === false) {
            return <></>;
        }

        return (
            <TDialog
                IsDialogOpen={LMe.state.IsDialogOpen}
                OnDialogClose={() => LMe.setState({ IsDialogOpen: false })}
                DialogContent={LMe.pvtGetDialogContent()}
                DialogActions={LMe.pvtGetDialogAction()}
                DialogHeader={LMe.props.PFieldLbl || 'Select Customer'}
                DialogLoading={false}
                IsWindow={true}
            />
        );
    }

    render() {
        var LMe = this;

        return (
            <>
                <Box style={{ padding: '5px 5px 30px 20px', margin: '0px 20px 0 0' }} variant="outline">
                    <h4>{LMe.props.PCanShowHeaderLabel !== false && (LMe.props.PFieldLbl || 'Select Customer')}</h4>

                    <TextField
                        // label={isEmpty(LMe.state.SCstObj.cstName) ? 'Select Customer' : ''}
                        label={LMe.props.PFieldLbl || 'Select Customer'}
                        required={true}
                        onChange={(e) => {
                            var LObj = LMe.state.SCstObj || {};

                            LObj.cstName = e.currentTarget.value;
                            LMe.setState({ SCstObj: LObj });
                        }}
                        value={LMe.state.SCstObj.cstName}
                        InputProps={{
                            readOnly: true,
                        }}
                        onClick={() => {
                            LMe.setState({ IsDialogOpen: true });
                        }}
                        margin="dense" style={{ margin: '-10px 0 0 0' }} />
                </Box>

                {/* Window */}
                {LMe.pvtGetDialog()}

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

export default tsfrmCustomerSelectionCntr;