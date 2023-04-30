import React, { Component } from 'react';

import {
    Box,
    Button,
    IconButton,
    Input,
    TextField,
    Checkbox,
    InputAdornment,
    FormControlLabel
} from '@material-ui/core';

import TDialog from '../../reusable/tsclsDialog';
import SaveIcon from '@material-ui/icons/Save';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';

import { BaseUrl, IsEmailValid, isEmpty, tsGetProjectId } from '../../tsclsGenUtils';
import TLoading from '../../reusable/tsclsLoading';

class tsfrmUserDialog extends Component {
    /**
     * @props: 
     *  OnDialogClose
     *  IsDialogOpen
     *  
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

            SDisplayName: '',
            SUsername: '',
            SPassword: '',

            SIsActive: true,
            SOrgName: '',

            IsOTPDialogOpen: false,
            SOTPValue: ''
        };

        LMe.FIsEmailSent = false;
    }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         * 
         */
        var LMe = this;
        var LRecord = LMe.props.UserRecord;

        //Upate state here
        LMe.setState({
            SDisplayName: LRecord.displayName,
            SUsername: LRecord.username,
            SPassword: LRecord.password,
            SIsActive: isEmpty(LRecord.isActive) ? true : LRecord.isActive === 1
        });
    }

    pvtHandleOnClose() {
        var LMe = this;

        LMe.FIsEmailSent = false;
        LMe.props.OnDialogClose();
    }

    pvtGetOTPDialogContent() {

        const LMe = this;

        return <Box flex="1" pt={2} display="flex" flexDirection="column" className="tsDialogMinWidth">

            <h4 style={{ color: 'green' }}>The OTP has been sent on your Email Address: <i>{LMe.state.SUsername}</i></h4>

            <TextField label="Enter OTP" placeholder="Enter OTP" required
                fullWidth
                onChange={(e) => LMe.setState({ SOTPValue: e.currentTarget.value })}
                value={LMe.state.SOTPValue}
                margin="dense" />
        </Box>
    }

    pvtGetDialogContent() {
        var LMe = this,
            LIsEditMode = isEmpty(LMe.props.UserRecord.id) === false;

        return (
            <Box flex="1" pt={2} display="flex" flexDirection="column" className="tsDialogMinWidth">
                <TextField label="Name" placeholder="Name" required
                    fullWidth
                    onChange={(e) => LMe.setState({ SDisplayName: e.currentTarget.value })}
                    value={LMe.state.SDisplayName}
                    margin="dense" />

                <TextField label="Email" placeholder="Email" type="email"
                    InputProps={{
                        readOnly: LIsEditMode,
                    }}
                    onChange={(e) => LMe.setState({ SUsername: e.currentTarget.value })}
                    required
                    value={LMe.state.SUsername}
                    error={isEmpty(LMe.state.SUsername) === false && LMe.pvtIsEmailValid(LMe.state.SUsername) === false}
                    helperText={LMe.pvtIsEmailValid(LMe.state.SUsername) ? '' : 'Email-Id is invalid.'}
                    fullWidth
                    margin="dense" />

                <Input label="Password" required helperText="Password is case sensitive" placeholder="Set Password"
                    fullWidth
                    onChange={(e) => LMe.setState({ SPassword: e.currentTarget.value })}
                    type={LMe.state.ShowPassword ? 'text' : 'password'}
                    margin="dense"
                    style={{ margin: '20px 0 0 0' }}
                    value={LMe.state.SPassword }
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => LMe.setState({ ShowPassword: !LMe.state.ShowPassword })}
                            >
                                {LMe.state.ShowPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
               
              
                {LMe.props.PIsSignUpForm === true ?

                    <TextField label="Organisation Name" placeholder="Organisation Name"
                        style={{ margin: '10px 0 0 0' }}
                        onChange={(e) => LMe.setState({ SOrgName: e.currentTarget.value })}
                        required
                        helperText="You can add more details about Organisation after signup."
                        value={LMe.state.SOrgName}
                        fullWidth
                        margin="dense" />
                    :
                    <FormControlLabel
                        style={{ margin: '20px 0 0 0' }}
                        control={
                            <Checkbox
                                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                checkedIcon={<CheckBoxIcon fontSize="small" />}
                                onChange={(e) => LMe.setState({ SIsActive: e.target.checked })}
                                checked={LMe.state.SIsActive}
                            />
                        }
                        label="Active"
                    />}
            </Box>
        );
    }

    pvtGetDialogAction() {
        var LMe = this;

        return (<Button
            onClick={() => { LMe.pvtSaveUser() }}
            color="primary" variant="contained" size="small" startIcon={<SaveIcon />}>
            {LMe.props.PIsSignUpForm === true ? 'SignUp' : 'Save'}
        </Button>);
    }

    pvtValidate() {
        /**
         * @method pvtValidate
         * This method will validate the user dlg
         */
        var LMe = this,
            LAlertStateObj = {},
            LIsValid = true,
            password = new RegExp ('^(?=.*?[A-Za-z])(?=.*?[0-9]).{8,}$');

        if (isEmpty(LMe.state.SDisplayName) === true) {

            LIsValid = false;

            LAlertStateObj = {
                AlertDialogContent: <span> Display Name is required. </span>,
                AlertDialogHeader: 'Warning'
            }

        }//if..
        else if (isEmpty(LMe.state.SUsername) === true) {

            LIsValid = false;

            LAlertStateObj = {
                AlertDialogContent: <span> Email is required. </span>,
                AlertDialogHeader: 'Warning'
            }
        }
        else if (LMe.pvtIsEmailValid(LMe.state.SUsername) === false) {

            LIsValid = false;

            LAlertStateObj = {
                AlertDialogContent: <span> Email-Id is invalid, enter correct Email-Id. </span>,
                AlertDialogHeader: 'Warning'
            }
        }
        else if (isEmpty(LMe.state.SPassword) === true) {

            LIsValid = false;

            LAlertStateObj = {
                AlertDialogContent: <span> Password is required. </span>,
                AlertDialogHeader: 'Warning'
            }
        }
        else if (!password.test(LMe.state.SPassword) ) {

            LIsValid = false;
            
                   
            LAlertStateObj = {
                AlertDialogContent: <span> Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters </span>,
                AlertDialogHeader: 'Warning'
            }
        }
        else if (LMe.props.PIsSignUpForm === true && isEmpty(LMe.state.SOrgName) === true) {

            LIsValid = false;

            LAlertStateObj = {
                AlertDialogContent: <span> Organisation Name is required. </span>,
                AlertDialogHeader: 'Warning'
            }
        }//else if..
        else if (isEmpty(LMe.props.PAllUsers) === false && LMe.state.SIsActive === false) {

            var LAllUsers = LMe.props.PAllUsers || [],
                LIsActiveElementFound = false;

            LAllUsers.forEach(function (p_objRecord) {

                //Biz Rule: At least one user should be "Active User".
                //Checking at least one users is active or not
                if (p_objRecord.isActive === 1 && LMe.props.UserRecord.id !== p_objRecord.id) {

                    //Here means user is active, so update the flag & break
                    LIsActiveElementFound = true;
                    return false;
                }//if..
            });

            if (LIsActiveElementFound === false) {

                LIsValid = false;

                LAlertStateObj = {
                    AlertDialogContent: <span> At least one user must be <b>"Active User"</b>.</span>,
                    AlertDialogHeader: 'Warning'
                }
            }//if..

        }//else if..

        if (LIsValid === false) {

            LMe.setState({
                IsAlertDialogOpen: true,
                AlertDialog: LAlertStateObj
            });
        }

        return LIsValid;
    }

    pvtIsEmailValid(p_strEmail) {
        return IsEmailValid(p_strEmail);
    }

    pvtSendOTP() {
        /**
         * @method pvtSendOTP
         * This method will verify the EMAIL address
         */
        const LMe = this,
            LEmailId = LMe.state.SUsername,
            LParamObj = {
                displayName: LMe.state.SDisplayName,
                email: LMe.state.SUsername,
                password: LMe.state.SPassword,
                isActive: LMe.state.SIsActive
            };

        // Email is valid
        if (LMe.pvtIsEmailValid(LEmailId) === false) {
            return;
        }//if..

        const LUrl = BaseUrl() + 'users/send/otp',
            LRequestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(LParamObj)
            };

        LMe.FLoadingText = 'Sending OTP to your Email...';
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

                    //If Success

                    LMe.FIsEmailSent = true;

                    LMe.setState({
                        IsOTPDialogOpen: true
                    });
                },
                (error) => {

                    LMe.setState({
                        IsLoading: false
                    });

                }
            );
    }

    pvtSaveUser() {
        /**
        * @method pvtSaveUser
        * This function will fire the command and save the user data
        *
        */
        const LMe = this;

        // First validate
        if (LMe.pvtValidate() === false) {
            return false;
        }//if..

        // If dialog is opened for new orginstion registration and email is not verified then verify the email
        if (LMe.props.PIsSignUpForm === true && LMe.FIsEmailSent === false) {
            LMe.pvtSendOTP();
            return;
        }//if..

        let LParamObj = {},
            LRequestOptions,
            LUrl = BaseUrl() + 'users',
            LIsEditMode = isEmpty(LMe.props.UserRecord.id) === false;

        LParamObj = {
            displayName: LMe.state.SDisplayName,
            username: LMe.state.SUsername,
            password: LMe.state.SPassword,
            isActive: LMe.state.SIsActive
        };

        if (LIsEditMode === true) {
            LUrl = BaseUrl() + 'users/' + LMe.props.UserRecord.id;
        }
        else {
            LParamObj.canCreateNewProject = LMe.props.PIsSignUpForm;
            LParamObj.orgName = LMe.state.SOrgName;
            LParamObj.otp = LMe.state.SOTPValue;
        }

        LRequestOptions = {
            method: LIsEditMode === true ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify(LParamObj)
        };

        LMe.FLoadingText = '';
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
                    LMe.props.UpdateUserStore(responseJson);

                    if (LMe.props.PIsSignUpForm === true) {

                        LMe.props.PHandleOnSignUp(LParamObj.username, LParamObj.password, responseJson);
                    }//if..

                    if (LIsEditMode === false) {

                        LMe.setState({
                            SDisplayName: '',
                            SUsername: '',
                            SPassword: '',
                            SIsActive: 1
                        });
                    }
                },
                (error) => {

                    LMe.setState({
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
                    DialogHeader={LMe.props.PIsSignUpForm === true ? ('Sign Up Form') : (isEmpty(LMe.props.UserRecord.id) ? 'New User' : 'Edit User')}
                    DialogLoading={false}
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

                <TLoading
                    PLoadingText={LMe.FLoadingText}
                    PIsLoading={LMe.state.IsLoading}
                />

                {/* OTP dialog */}
                <TDialog
                    IsDialogOpen={LMe.state.IsOTPDialogOpen}
                    OnDialogClose={() => {
                        LMe.setState({ IsOTPDialogOpen: false });
                        LMe.FIsEmailSent = false;
                    }}
                    DialogContent={LMe.pvtGetOTPDialogContent()}
                    DialogActions={LMe.pvtGetDialogAction()}
                    DialogHeader={'Verify Email'}
                    DialogLoading={false}
                    IsWindow={true}
                />
            </>
        );
    }
}

export default tsfrmUserDialog;