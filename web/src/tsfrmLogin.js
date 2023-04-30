import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import TDialog from './reusable/tsclsDialog';

import { BaseUrl, IsEmailValid, isEmpty, tsLogin } from './tsclsGenUtils';
// import TProjectComponent from './admin/pkgProjectDetails/tsfrmProjectForm';
import TUserDialog from './admin/pkgManageUserAccount/tsdlgUser';
import TLoading from './reusable/tsclsLoading';
import { Snackbar } from '@material-ui/core';

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            <Link color="inherit">
                CRM SOFT    
            </Link>
            {' ' + new Date().getFullYear()}
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    image: {
        backgroundImage: 'url(login.png)',
        backgroundRepeat: 'no-repeat',
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
    },
    paper: {
        margin: theme.spacing(8, 4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));


export default function SignInSide(props) {
    const classes = useStyles(),
        LBtnText = 'Sign in';

    const [FUsername, setUsername] = useState('');
    const [FPassword, setPassword] = useState('');

    const [FIsAlertDialogOpen, setOpenAlertDlg] = useState(false);
    const [FWarningText, setWarningText] = useState('');

    const [FButtonText, setButttonText] = useState(LBtnText);

    const [SIsDialogOpen, isDialogOpen] = useState(false);

    const [SIsForgotPasswordMode, isForgotPasswordMode] = useState(false);

    const [SLoading, setLoading] = useState(false);

    const [IsSnackOn, setSnackStatus] = useState(false);

    function pvtOnSuccess(p_username, p_password, p_responseJson) {

        tsLogin(p_username, p_password, p_responseJson);
        //Login successfull
        props.history.push('/');
    }

    function pvtForgotPassword() {
        if (isEmpty(FUsername) === true) {

            setWarningText('Email must be entered.');
            setOpenAlertDlg(true);
            return;
        }//if..

        if (IsEmailValid(FUsername) === false) {

            setWarningText('Entered Email is invalid.');
            setOpenAlertDlg(true);
            return;
        }//if..

        setLoading(true);

        var LUrl = BaseUrl() + 'logincmd/forgotpassword';

        var LParamObj = {
            email: FUsername
        };

        var LRequestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(LParamObj)
        };

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {

                    if (responseJson.success === false) {

                        setWarningText(responseJson.message);
                        setOpenAlertDlg(true);
                        setLoading(false);
                        return;
                    }

                    setSnackStatus(true);
                    setLoading(false);
                    isForgotPasswordMode(false);
                },
                (error) => {

                    setWarningText(error.message);
                    setOpenAlertDlg(true);
                    setLoading(false);
                    return;
                }
            );
    }

    function pvtLogin() {
        /**
         * @method pvtLogin
         * This method will validate and fire command for login
         */

        if (isEmpty(FUsername) === true) {

            setWarningText('Email must be entered.');
            setOpenAlertDlg(true);
            return;
        }//if..

        if (isEmpty(FPassword) === true) {

            setWarningText('Password must be entered.');
            setOpenAlertDlg(true);
            return;
        }//if..

        var LUrl = BaseUrl() + 'logincmd';

        var LParamObj = {
            username: FUsername,
            password: FPassword
        };

        var LRequestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(LParamObj)
        };

        setButttonText('Signing in, please wait...');

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.success === false) {

                        setWarningText(responseJson.message);
                        setOpenAlertDlg(true);

                        setButttonText(LBtnText);
                        return;
                    }

                    pvtOnSuccess(FUsername, FPassword, responseJson);
                },
                (error) => {

                    setButttonText(LBtnText);
                    setWarningText(error.message);
                    setOpenAlertDlg(true);
                    return;
                }
            );
    }

    return (
        <>
            <Grid container component="main" className={classes.root}>
                <CssBaseline />
                <Grid item xs={false} sm={4} md={7} className={classes.image} />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <div className={classes.paper}>
                        <Avatar className={classes.avatar}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <form className={classes.form} noValidate>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Email"
                                name="username"
                                autoComplete="Email"
                                autoFocus
                                value={FUsername}
                                onChange={(e) => { setUsername(e.currentTarget.value) }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={FPassword}
                                onChange={(e) => { setPassword(e.currentTarget.value) }}
                                style={{ display: SIsForgotPasswordMode ? 'none' : '' }}
                            />
                            {/* <FormControlLabel
                                control={<Checkbox value="remember" color="primary" />}
                                label="Remember me"
                            /> */}
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={() => pvtLogin()}
                                disabled={FButtonText === LBtnText ? false : true}
                                style={{ display: SIsForgotPasswordMode ? 'none' : '' }}
                            >
                                {FButtonText}
                            </Button>
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={() => pvtForgotPassword()}
                                style={{ display: SIsForgotPasswordMode === false ? 'none' : '' }}
                            >
                                Send Login Credentials to your Email
                            </Button>
                            <Grid container>
                                <Grid item xs>
                                    <Link variant="body2" style={{ cursor: 'pointer' }} onClick={() => {
                                        isForgotPasswordMode(!SIsForgotPasswordMode)
                                    }}>
                                        {SIsForgotPasswordMode === false ? 'Forgot password?' : 'Login'}
                                    </Link>
                                </Grid>
                                <Grid item>
                                    <Link variant="body2" style={{ cursor: 'pointer' }} onClick={() => {
                                        isDialogOpen(true)
                                    }}>
                                        {"Don't have an account? Sign Up"}
                                    </Link>
                                </Grid>
                            </Grid>
                            <Box mt={5}>
                                <Copyright />
                            </Box>
                        </form>
                    </div>
                </Grid>
            </Grid>
            <TDialog
                IsDialogOpen={FIsAlertDialogOpen}
                OnDialogClose={() => setOpenAlertDlg(false)}
                DialogContent={FWarningText || ''}
                DialogActions={<></>}
                DialogHeader={'Warning'}
                IsWindow={false}
            />

            {/* Window */}
            {/* <TDialog
                IsDialogOpen={SIsDialogOpen}
                OnDialogClose={() => isDialogOpen(false)}
                DialogContent={<></>}
                // DialogActions={LMe.pvtGetDialogAction()}
                DialogHeader={'Sign Up'}
                DialogLoading={false}
                IsWindow={true}
            /> */}
            <TUserDialog
                IsDialogOpen={SIsDialogOpen}
                OnDialogClose={() => isDialogOpen(false)}
                UpdateUserStore={(p_objUser) => { }}
                UserRecord={{}}
                PIsSignUpForm={true}
                PHandleOnSignUp={pvtOnSuccess}
            />

            <TLoading
                PLoadingText={'Sending Login Credentials on your Email...'}
                PIsLoading={SLoading}
            />

            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={IsSnackOn}
                onClose={() => setSnackStatus(false)}
                message={'Login credentials has been sent on your email.'}
                key={'verticalhorizontalSnack'}
                variant="success"
            />
        </>
    );
}