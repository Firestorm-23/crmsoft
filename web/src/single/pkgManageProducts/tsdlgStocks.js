import React, { Component } from 'react';

import {
    Box,
    Button,
    TextField,
} from '@material-ui/core';

import TDialog from '../../reusable/tsclsDialog';
import SaveIcon from '@material-ui/icons/Save';
import { BaseUrl, isEmpty, tsGetProjectId } from '../../tsclsGenUtils';
import { GenConstants } from '../../tsclsGenConstants';

class tsdlgStocks extends Component {
    /**
     * @props: 
     *  OnDialogClose
     *  IsDialogOpen
     *  StockRecord
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

        LMe.FIsInvokedFirstTime = GenConstants().PESTICIDE_ACT_CODE;
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

    componentDidUpdate(prevProps, prevState, snapshot) {
        /**
         * @method componentDidUpdate
         * 
         */
        // var LMe = this;

        // if (LMe.FIsInvokedFirstTime === true || prevProps.StockRecord.id !== LMe.props.StockRecord.id) {

        //     LMe.pvtDefineProperties();
        //     LMe.FIsInvokedFirstTime = false;
        // }
    }

    pvtDefineProperties() {
        var LMe = this,
            LRecord = LMe.props.StockRecord,
            LColumnFields = LMe.props.ColumnFields || [],
            LObj = {},
            LStateFields = [];

        LColumnFields.forEach(function (p_objRecord) {

            if (p_objRecord.isField === false) {

                return true;//continue
            }

            LObj = {};
            LObj[p_objRecord.field] = LRecord[p_objRecord.field];

            LObj['fieldName'] = p_objRecord.field;
            LObj['headerName'] = p_objRecord.headerName;
            LObj['fieldType'] = p_objRecord.fieldType;
            LObj['isRequired'] = p_objRecord.isRequired;
            // LObj['isField'] = p_objRecord.isField;

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

        LArrFields.forEach(function (p_objRecord) {

            if (p_objRecord.isField === false) {

                return true;
            }//if..

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
                            shrink: true
                        }}
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
                        value={p_objRecord[p_objRecord.fieldName]}
                        type="number"
                        inputProps={{
                            min: 1
                        }}
                        margin="dense" style={{ margin: '15px 0 0 0' }} />
                );
            }
            else {
                LUI.push(
                    <TextField label={p_objRecord['headerName']} placeholder={p_objRecord['headerName']}
                        required={p_objRecord['isRequired']}
                        fullWidth
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

    pvtGetDialogAction() {
        var LMe = this;

        return (<Button
            onClick={() => { LMe.pvtSaveProduct() }}
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

        //Todo - Need to reverse the loop
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

    pvtSaveProduct() {
        /**
        * @method pvtSaveProduct
        * This function will fire the command and save the user data
        *
        */
        var LMe = this,
            LParamObj = {},
            LArrFieldNames = [],
            LRequestOptions,
            LUrl = BaseUrl() + 'stocks',
            LIsValid = false,
            LIsEditMode = isEmpty(LMe.props.StockRecord.id) === false;

        LIsValid = LMe.pvtValidate();

        if (LIsValid === false) {

            return false;
        }//if..

        var LArrFields = LMe.state.SFields || [];
        LArrFields.forEach(function (p_objRecord) {

            LParamObj[p_objRecord.fieldName] = p_objRecord[p_objRecord.fieldName] || '';

            LArrFieldNames.push(p_objRecord.fieldName);
        });

        LArrFieldNames.push('productId');

        LParamObj.fieldsArr = LArrFieldNames;
        LParamObj.productId = LMe.props.ProductId;

        LRequestOptions = {
            method: LIsEditMode === true ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify(LParamObj)
        };

        if (LIsEditMode === true) {

            LUrl = BaseUrl() + 'stocks/' + LMe.props.StockRecord.id;
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
                    LMe.props.UpdateStockStore(responseJson);

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
                    DialogHeader={isEmpty(LMe.props.StockRecord.id) ? `Add stock for ${LMe.props.ProductDispName}` : 'Edit stock'}
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

export default tsdlgStocks;