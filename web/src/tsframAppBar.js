import React, { Component } from 'react';

import { AppBar, Snackbar, Popover, Toolbar, Typography, IconButton, Backdrop, CircularProgress, Tooltip, List, ListItem, ListItemText } from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AccountCircle from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

import { BaseUrl, LogOut, tsClearCache, tsGetLoggedInUser, tsGetProjectId, IsDesktopApp } from './tsclsGenUtils.js';
import { isEmpty } from './tsclsGenUtils';
import CachedIcon from '@material-ui/icons/Cached';
import TLoading from './reusable/tsclsLoading.js';

class tsframAppBar extends Component {

    /**
     * @param {*} props: 
     *  onClose - Hide the side bar
     *  historyProp - It contain the history prop (LMe.props.history)
     *  GetUserDetails(): This function will call on admin user details fetch
     *  CanShowBackButton- Sets the visibility of back button
     */

    constructor(props) {
        super(props);
        var LMe = this;

        LMe.state = {
            IsOpenAccountPopOver: false,
            FetchedObj: null,
            IsLoading: false,
            SLoading: false,
            IsSnackOn: false
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

        // Fetch the user details
        LMe.pvtFetchUserDetails();
    }

    pvtFetchUserDetails() {
        /**
         * @method pvtFetchUserDetails
         * This function will fetch the logged in user details and sets the state
         * 
         */
        var LMe = this,
            LLocalStorageResponse,
            LUrl;

        // Check for local data
        LLocalStorageResponse = localStorage.getItem('userDetailsForAppBar');

        if (isEmpty(LLocalStorageResponse) === false && LLocalStorageResponse !== 'null') {

            LLocalStorageResponse = atob(LLocalStorageResponse);
            LLocalStorageResponse = JSON.parse(LLocalStorageResponse);
            LMe.pvtHandleOnSuccessUserDetails(LLocalStorageResponse);
            return;
        }

        if (isEmpty(tsGetProjectId())) {
            return;
        }

        var LRequestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            }
        };

        LUrl = BaseUrl() + 'users/' + tsGetLoggedInUser().tsLoggenUserId;

        LMe.setState({ IsLoading: true, FetchedObj: null });

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.error === true) {
                        LMe.setState({
                            IsLoading: false
                        });
                        return;
                    }//if..

                    LMe.pvtHandleOnSuccessUserDetails(responseJson);
                },
                (error) => {
                    this.setState({
                        IsLoading: false
                    });

                }
            );
    }

    pvtHandleOnSuccessUserDetails(p_response) {
        /**
         * INTENT: This function will call after successfully fetech user data from server
         */
        var LMe = this;

        if (isEmpty(p_response) === true) {
            return;
        }

        LMe.setState({
            FetchedObj: p_response,
            IsLoading: false
        });

        // Calling base function
        if (LMe.props.GetUserDetails !== undefined) {

            LMe.props.GetUserDetails(p_response);
        }

        var LLocalStorageResponse = btoa(JSON.stringify(p_response));
        localStorage.setItem('userDetailsForAppBar', LLocalStorageResponse);
    }

    pvtLogout() {
        /**
         * INTENT: This function will logout the user and go to home page
         */
        var LMe = this;

        LogOut(LMe.props.historyProp);
    }

    pvtHandleOnAdminClick() {
        /**
         * INTENT: This function will open the Account Page
         */
        var LMe = this,
            LHistoryProp = LMe.props.historyProp;

        LHistoryProp.push('/admin');
    }

    pvtHandleOnBackupClick() {
        /**
         * INTENT: This function will open the Account Page
         */
        var LMe = this,
            LHistoryProp = LMe.props.historyProp;

        LHistoryProp.push('/admin/Backup');
    }

    pvtGetBackupButton() {

        if (IsDesktopApp() === false) {
            return null;
        }//if..

        const LMe = this;

        return <Tooltip title={'Backup'}>
            <IconButton
                // aria-label="account of current user"
                // aria-controls="menu-appbar"
                // aria-haspopup="true"
                onClick={(e) => LMe.pvtHandleOnBackupClick()}
                color="inherit"
            >
                <CloudDownloadIcon />
            </IconButton>
        </Tooltip>
    }

    pvtGetSideIcon() {
        var LMe = this,
            LSideIcon,
            LIsPopOverOpen = false;

        if (LMe.state.IsOpenAccountPopOver !== false) {
            LIsPopOverOpen = true;
        };

        LSideIcon = (
            <>
                <Tooltip title={'Settings'}>
                    <IconButton
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={(e) => LMe.pvtHandleOnAdminClick()}
                        color="inherit"
                    >
                        <SettingsIcon />
                    </IconButton>
                </Tooltip>
                {LMe.pvtGetBackupButton()}
                <Tooltip title={isEmpty(LMe.state.FetchedObj) === true ? '' : LMe.state.FetchedObj.displayName || ''}>
                    <IconButton
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={(e) => LMe.setState({ IsOpenAccountPopOver: e.currentTarget })}
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>
                </Tooltip>
                <Popover
                    open={LIsPopOverOpen}
                    anchorEl={LMe.state.IsOpenAccountPopOver}
                    onClose={() => LMe.setState({ IsOpenAccountPopOver: false })}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <List>
                        {/* <ListItem button onClick={() => LMe.pvtHandleOnAdminClick()}>
                                <ListItemText primary="Administrator" />
                            </ListItem> */}
                        <ListItem dense={true} button onClick={() => LMe.pvtOnClearCache()}>
                            <CachedIcon className="tsMenuIcon" />
                            <ListItemText primary="Clear Cache" />
                        </ListItem>
                        <ListItem dense={true} button onClick={() => LMe.pvtLogout()}>
                            <ExitToAppIcon className="tsMenuIcon" />
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </List>
                </Popover>
            </>);

        return LSideIcon;
    }

    pvtOnClearCache() {

        var LMe = this;

        LMe.setState({
            IsOpenAccountPopOver: false,
            SLoading: true,
        });

        LMe.FLoadingText = 'Clearing cache, please wait...';

        setTimeout(() => {

            tsClearCache();

            LMe.FSnackMsg = 'Cache is cleared successfully.';

            LMe.setState({
                SLoading: false,
                IsSnackOn: true
            });
        }, 2000);
    }

    pvtBackBtnOnClick() {
        var LMe = this,
            LHistoryProp = LMe.props.historyProp;

        if (isEmpty(LHistoryProp) === false) {

            if (LHistoryProp.location.pathname === '/admin') {

                LHistoryProp.push('/');
            }
            else {

                LHistoryProp.goBack();
            }
        }
    }

    render() {
        var LMe = this;

        return (
            <div>
                <AppBar className="tsAppBar" position="static">
                    <Toolbar>

                        {/* Showing back icon  or Menu Icon */}

                        <span className="tsNonDragable">
                            {LMe.props.CanShowBackButton === true ?
                                <IconButton edge="start" onClick={(e) => LMe.pvtBackBtnOnClick()} color="inherit" aria-label="menu">
                                    <ArrowBackIcon />
                                </IconButton>
                                :
                                <IconButton edge="start" onClick={LMe.props.onClose} color="inherit" aria-label="menu">
                                    <MenuIcon />
                                </IconButton>
                            }
                        </span>

                        <Typography style={{ flexGrow: 1 }} variant="h6" >
                            {/* <Tooltip title="Click here to open homepage" placement="bottom"> */}
                            {/* <Link to="/" className="tsLink"> */}
                            {/* { IsMobileView() === true ? LMe.props.Title.substr(0, 21) : LMe.props.Title} */}
                            {LMe.props.Title || 'CRM SOFT'}
                            {/* </Link> */}
                            {/* </Tooltip> */}
                        </Typography>
                        {/* { LMe.state.FetchedObj === null ? '' : LMe.pvtGetSideIcon()} */}
                        <span className="tsNonDragable" style={{
                            // margin: '17px 0 0 0'
                        }}>{LMe.pvtGetSideIcon()}</span>
                    </Toolbar>
                </AppBar>

                <Backdrop open={LMe.state.IsLoading} style={{
                    zIndex: 1,
                    color: '#fff',
                }}>
                    <CircularProgress color="inherit" />
                </Backdrop>

                <TLoading
                    PLoadingText={LMe.FLoadingText}
                    PIsLoading={LMe.state.SLoading}
                />
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    open={LMe.state.IsSnackOn}
                    onClose={() => LMe.setState({ IsSnackOn: false })}
                    message={LMe.FSnackMsg}
                    key={'verticalhorizontalSnack'}
                    variant="success"
                />
            </div>
        );
    }
}

export default tsframAppBar;