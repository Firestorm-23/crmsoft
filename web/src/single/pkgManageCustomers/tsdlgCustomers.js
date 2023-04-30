import React, { Component } from 'react';

import {
    Box,
    Button,
    TextField,
} from '@material-ui/core';

import TDialog from '../../reusable/tsclsDialog';
import SaveIcon from '@material-ui/icons/Save';
import { BaseUrl, isEmpty, tsGetProjectId, tsGetStates, tsSaveInLocalStorage, tsGetFromLocalStorage } from '../../tsclsGenUtils';
import { GenConstants } from '../../tsclsGenConstants';
import Autocomplete from '@material-ui/lab/Autocomplete';

class tsdlgCustomers extends Component {
    /**
     * @props: 
     *  OnDialogClose
     *  IsDialogOpen
     *  CustomerRecord
     * @returns 
     */

    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            ShowPassword: false,
            IsLoading: false,

            IsAlertDialogOpen: false,
            AlertDialog: {
                AlertDialogContent: <></>,
                AlertDialogHeader: 'Warning'
            },

            SFields: []
        };

        LMe.FIsInvokedFirstTime = true;
    }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         * 
         */
        var LMe = this;

        LMe.pvtDefineProperties();
    }

    pvtDefineProperties() {

        var LMe = this,
            LRecord = LMe.props.CustomerRecord,
            LColumnFields = LMe.props.ColumnFields || [],
            LObj = {},
            LStateFields = [];

        LColumnFields.forEach(function (p_objRecord) {

            if (p_objRecord.isField === false) {

                return true; //continue...
            }

            LObj = {};
            LObj[p_objRecord.field] = LRecord[p_objRecord.field];

            LObj['fieldName'] = p_objRecord.field;
            LObj['headerName'] = p_objRecord.headerName;
            LObj['fieldType'] = p_objRecord.fieldType;
            LObj['isRequired'] = p_objRecord.isRequired;

            LStateFields.push(LObj);
        });

        //Upate state here
        LMe.setState({
            SFields: LStateFields
        });
    }

    pvtResetFields() {
        /**
         * @method pvtResetFields
         * This method will reset all the fields
         */
        var LMe = this;

        //Reset the variables
        LMe.setState({
            SFields: []
        });
    }

    pvtHandleOnClose() {
        var LMe = this;

        LMe.props.OnDialogClose();
    }

    pvtGetDialogContent() {
        var LMe = this,
            LUI = [];

        var LArrFields = LMe.state.SFields || [];

        LArrFields.forEach(function (p_objRecord, p_intIndex) {

            if (p_objRecord['fieldType'] === GenConstants().FIELD_DATE) {

                LUI.push(
                    <TextField
                        label={p_objRecord['headerName']}
                        type="date"
                        fullWidth
                        margin="dense"
                        style={{ margin: '20px 0 0 0' }}
                        value={p_objRecord[p_objRecord.fieldName]}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        key={p_objRecord['headerName'].replaceAll(' ', '') + 'key' + p_intIndex}
                        required={p_objRecord['isRequired']}
                        onChange={(e) => {
                            p_objRecord[p_objRecord.fieldName] = e.currentTarget.value;
                            LMe.setState({ SFields: LArrFields })
                        }}
                    />
                );
            }
            else if (p_objRecord['fieldType'] === GenConstants().FIELD_NUMBER) {
                LUI.push(
                    <TextField label={p_objRecord['headerName']} placeholder={p_objRecord['headerName']}
                        required={p_objRecord['isRequired']}
                        fullWidth
                        onChange={(e) => {
                            p_objRecord[p_objRecord.fieldName] = e.currentTarget.value;
                            LMe.setState({ SFields: LArrFields })
                        }}
                        key={p_objRecord['headerName'].replaceAll(' ', '') + 'key' + p_intIndex}
                        value={p_objRecord[p_objRecord.fieldName]}
                        type="number"
                        margin="dense" style={{ margin: '15px 0 0 0' }} />
                );
            }
            else if (p_objRecord['fieldType'] === GenConstants().STATE_FIELD) {

                LUI.push(<Autocomplete
                    options={tsGetStates()}
                    getOptionLabel={(option) => {

                        return option || '';
                    }}
                    clearOnEscape
                    onChange={(e, p_value, p_reason) => {
                        p_objRecord[p_objRecord.fieldName] = p_value;
                        LMe.setState({ SFields: LArrFields });

                        //Save in local storage
                        tsSaveInLocalStorage('tsLastSelectedState', p_value);
                    }}
                    value={p_objRecord[p_objRecord.fieldName] || LMe.pvtGetLastSelectedState(p_objRecord, LArrFields)}
                    key={p_objRecord['headerName'].replaceAll(' ', '') + 'key' + p_intIndex}
                    // id="state"
                    renderInput={(params) => {

                        return <TextField
                            {...params}
                            label={'State'}
                            margin="dense"
                        />
                    }}
                />
                );
            }
            else {
                LUI.push(
                    <TextField label={p_objRecord['headerName']} placeholder={p_objRecord['headerName']}
                        required={p_objRecord['isRequired']}
                        fullWidth
                        key={p_objRecord['headerName'].replaceAll(' ', '') + 'key' + p_intIndex}
                        onChange={(e) => {
                            p_objRecord[p_objRecord.fieldName] = e.currentTarget.value;
                            LMe.setState({ SFields: LArrFields })
                        }}
                        value={p_objRecord[p_objRecord.fieldName]}
                        margin="dense" style={{ margin: '15px 0 0 0' }} />
                );
            }
        });

        return (
            <Box flex="1" pt={2} display="flex" flexDirection="column" className="tsDialogMinWidth">
                {LUI}
            </Box>
        );
    }

    pvtGetLastSelectedState(p_objRecord, p_arrFields) {

        var LMe = this,
            LastSelectedState = tsGetFromLocalStorage('tsLastSelectedState');

        if ((isEmpty(LastSelectedState) || LastSelectedState === "null")) {

            return '';
        }//if..

        p_objRecord[p_objRecord.fieldName] = LastSelectedState;
        LMe.setState({ SFields: p_arrFields });

        return LastSelectedState;
    }

    pvtGetDialogAction() {
        var LMe = this;

        return (<Button
            onClick={() => { LMe.pvtSaveCustomer() }}
            color="primary" variant="contained" size="small" startIcon={<SaveIcon />}>
            Save
        </Button>);
    }

    pvtValidate() {
        /**
         * @method pvtValidate
         * This method will validate the user dlg
         */
        var LMe = this,
            LAlertStateObj = {},
            LIsValid = true;

        var LArrFields = LMe.state.SFields || [];

        LArrFields.forEach(function (p_objRecord) {

            if (p_objRecord['isRequired'] === true && isEmpty(p_objRecord[p_objRecord.fieldName]) === true) {

                LIsValid = false;

                LAlertStateObj = {
                    AlertDialogContent: <span> {p_objRecord['headerName']} is required. </span>,
                    AlertDialogHeader: 'Warning'
                };
            }
        });

        if (LIsValid === false) {

            LMe.setState({
                IsAlertDialogOpen: true,
                AlertDialog: LAlertStateObj
            });
        }

        return LIsValid;
    }

    pvtSaveCustomer() {
        /**
        * @method pvtSaveCustomer
        * This function will fire the command and save the user data
        *
        */
        var LMe = this,
            LParamObj = {},
            LArrFieldNames = [],
            LRequestOptions,
            LUrl = BaseUrl() + 'customers',
            LIsValid = false,
            LIsEditMode = isEmpty(LMe.props.CustomerRecord.id) === false;

        LIsValid = LMe.pvtValidate();

        if (LIsValid === false) {

            return false;
        }//if..

        var LArrFields = LMe.state.SFields || [];
        LArrFields.forEach(function (p_objRecord) {

            LParamObj[p_objRecord.fieldName] = p_objRecord[p_objRecord.fieldName] || '';

            LArrFieldNames.push(p_objRecord.fieldName);
        });

        LParamObj.fieldsArr = LArrFieldNames;

        LRequestOptions = {
            method: LIsEditMode === true ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify(LParamObj)
        };

        if (LIsEditMode === true) {

            LUrl = BaseUrl() + 'customers/' + LMe.props.CustomerRecord.id;
        }

        LMe.setState({ IsLoading: true });

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    LMe.setState({
                        IsLoading: false
                    });

                    if (responseJson.success === false || isEmpty(responseJson)) {

                        var LAlertStateObj = {
                            AlertDialogContent: <span> {responseJson.message} </span>,
                            AlertDialogHeader: 'Error',
                        };

                        LMe.setState({
                            IsAlertDialogOpen: true,
                            AlertDialog: LAlertStateObj,
                        });

                        return;
                    } //if..

                    //If Not error
                    LMe.pvtHandleOnClose();
                    LMe.props.UpdateCustomerStore(responseJson);

                    if (LIsEditMode === false) {

                        LMe.pvtResetFields();
                    }
                },
                (error) => {
                    this.setState({
                        IsLoading: false
                    });

                }
            );
    }

    render() {
        var LMe = this;

        return (
            <>
                {/* Window */}
                <TDialog
                    IsDialogOpen={LMe.props.IsDialogOpen}
                    OnDialogClose={() => LMe.pvtHandleOnClose()}
                    DialogContent={LMe.pvtGetDialogContent()}
                    DialogActions={LMe.pvtGetDialogAction()}
                    DialogHeader={isEmpty(LMe.props.CustomerRecord.id) ? 'New Customer' : 'Edit Customer'}
                    DialogLoading={LMe.state.IsLoading}
                    IsWindow={true}
                />

                {/* Warning Dialog */}
                <TDialog
                    IsDialogOpen={LMe.state.IsAlertDialogOpen}
                    OnDialogClose={() => LMe.setState({ IsAlertDialogOpen: false })}
                    DialogContent={LMe.state.AlertDialog.AlertDialogContent}
                    DialogActions={<></>}
                    DialogHeader={LMe.state.AlertDialog.AlertDialogHeader}
                    IsWindow={false}
                />
            </>
        );
    }
}

export default tsdlgCustomers;