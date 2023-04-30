import React, { Component } from 'react';

import TAppBar from './tsframAppBar';
import TMenu from "./tsframMenu";

import LinearProgress from '@material-ui/core/LinearProgress';
import { BaseUrl, LogOut, tsIsUserLoggedIn, tsIsMobileView, tsGetProjectId, isEmpty, tsSetInvoiceType } from './tsclsGenUtils.js';

import SinglePg from './tsfrmSinglePg.js';



class tsclsHome extends Component {

    constructor(props) {
        super(props);

        var LMe = this,
            LIsSideMenuVisible = true;

        if (tsIsMobileView() === true) {
            LIsSideMenuVisible = false;
        }

        LMe.state = {
            IsSideMenuVisible: LIsSideMenuVisible,
            FMenuList: 0,
            IsShowLoading: true
        };

        LMe.pvtDefineProperties();
    }

    pvtDefineProperties() {
        var LMe = this;

        LMe.FUserDetails = {};
    }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         * 
         */
        var LMe = this;

        LMe.pvtFetchInvoiceTypes(function () {

            LMe.pvtFetchMenuJson();
        });

        // Check for session
        if (tsIsUserLoggedIn() === false) {
            LogOut(LMe.props.history);
        }
    }

    pvtFetchInvoiceTypes(p_callback) {
        /**
         * @method pvtFetchInvoiceTypes
         * This function will fetch the invoice types
         * and sets in genutils cache
         */
        var LMe = this,
            LRequestOptions,
            LUrl;

        LUrl = BaseUrl() + 'invoicetypes';

        LRequestOptions = {
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

                    LMe.setState({
                        SIsLoading: false
                    });

                    if (responseJson.status === false) {
                        return;
                    }

                    //Updating cache
                    tsSetInvoiceType(responseJson);

                    if (isEmpty(p_callback) === false) {
                        p_callback();
                    }
                },
                (error) => {
                    LMe.setState({
                        SIsLoading: false
                    });
                }
            );
    }

    pvtFetchMenuJson() {
        /**
         * @method pvtFetchMenuJson
         * This function will fetch the list which will visible in side panel
         * 
         * @returns: Array of objects of list items with tooltips
         */
        var LMe = this,
            LRequestOptions,
            LUrl;

        if (LMe.state.FMenuList !== 0 && LMe.state.FMenuList !== -1) {

            return;
        }

        LUrl = BaseUrl() + 'menujson';

        LRequestOptions = {
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
                        LMe.setState({
                            FMenuList: -1
                        });
                        return;
                    }

                    if (new Date(responseJson.expDate) < new Date()) {

                        responseJson = -2;
                    }//if..

                    LMe.setState({
                        FMenuList: responseJson
                    });
                },
                (error) => {
                    this.setState({
                        FMenuList: -1
                    });
                }
            );
    }

    HandleOnNodeSelect(p_event, p_value) {
        /**
         * INTENT: This function will call on node select
         */

        var LMe = this;

        // Check if same node is clicked by user
        if (LMe.pvtGetParamalink() === p_value) {
            return;
        }//if..

        // Identifying is parent node or not, If parent node then no need to change URL
        //Parent node means Parent Node in Menu Tree
        var LArr = p_value.split("-");
        if (LArr[0] === 'tsparent') {
            return;
        }//if..

        LMe.setState({ IsShowLoading: true });

        LMe.props.history.push("/" + p_value);
    }

    pvtShowLoading() {

        var LMe = this;

        if (LMe.state.IsShowLoading) {

            return <LinearProgress color="secondary" />;
        }

        return null;
    }

    HideLoading() {

        var LMe = this;

        if (LMe.state.IsShowLoading === false) {
            return;
        }

        if (tsIsMobileView() === true) {
            LMe.setState({ IsShowLoading: false, IsSideMenuVisible: false });
        }
        else {
            LMe.setState({ IsShowLoading: false });
        }
    }

    pvtGetSingleCmp() {
        /**
         * INENT: This function will return the single cmp
         */

        var LMe = this;

        // Mobile View
        if (LMe.state.IsSideMenuVisible === true && tsIsMobileView() === true && LMe.state.IsShowLoading === false) {
            return null;
        }

        return <SinglePg
            onLoadComplete={() => LMe.HideLoading()}
            Paramalink={LMe.pvtGetParamalink()}
            arrMenuItems={LMe.state.FMenuList} />;
    }

    pvtGetAppBody() {
        /**
         * @method pvtGetAppBody
         * This method will return the UI component for Application
         */
        var LMe = this;

        return (
            <div className="tsAfterHeader">
                <TMenu arrMenuItems={LMe.state.FMenuList} isVisible={LMe.state.IsSideMenuVisible}
                    OnNodeSelect={(p_event, p_value) => LMe.HandleOnNodeSelect(p_event, p_value)}
                    Paramalink={LMe.pvtGetParamalink()}
                />

                <div className="tsMain">
                    {LMe.pvtGetSingleCmp()}
                </div>
            </div>
        );
    }

    pvtGetAdminBody() {
        /**
         * @method pvtGetAdminBody
         * This method will return the UI component for Admin Panel
         */
        var LMe = this,
            LComponent;

        const TDataJson = require('./admin/tsclsDataJson').default;

        LComponent = <TDataJson
            moduleType={LMe.pvtGetModuleType()}
            historyProp={LMe.props.history}
            onLoadComplete={() => LMe.HideLoading()}
        ></TDataJson>;

        return LComponent;
    }

    pvtGetParamalink() {
        /**
         * INTENT: This method will return the first paramalink from parameter
         */

        var LMe = this,
            LPramalink = LMe.props.match.params.paramalink;

        return LPramalink;
    }

    pvtGetModuleType() {
        /**
         * INTENT: This method will return the id from parameter
         */

        var LMe = this,
            LModuleType = LMe.props.match.params.moduleType;

        return LModuleType;
    }

    render() {
        var LMe = this;

        return (
            <div className="tsHomePg">
                <div>
                    <TAppBar
                        onClose={() => LMe.setState({ IsSideMenuVisible: !LMe.state.IsSideMenuVisible })}
                        historyProp={LMe.props.history}
                        Title={LMe.pvtGetParamalink() === 'admin' ? 'Settings' : 'CRM SOFT'}
                        GetUserDetails={(p_response) => LMe.FUserDetails = p_response || {}}
                        CanShowBackButton={LMe.pvtGetParamalink() === 'admin' ? true : false}
                    />
                </div>
                {LMe.pvtShowLoading()}

                {LMe.pvtGetParamalink() === 'admin' ? LMe.pvtGetAdminBody() : LMe.pvtGetAppBody()}
            </div>
        );
    }
}

export default tsclsHome;