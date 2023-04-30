import React, { Component } from 'react';
import { tsSearchTree, isEmpty } from './tsclsGenUtils.js';
// import RestoreIcon from '@material-ui/icons/Restore';
import WarningIcon from '@material-ui/icons/Warning';

class tsfrmSinglePg extends Component {

    /**
     * @param {onLoadComplete} props : {function} - Call the function for stop loading
     * @param {Paramalink} props: {String} - link
     * @param {arrMenuItems} props: {Array} - Fetched menu items
     */

    constructor(props) {
        super(props);
        var LMe = this;

        LMe.state = {
        };
    }

    componentDidUpdate() {
        /**
         * @method componentDidUpdate
         * Called immediately after updating occurs. Not called for the initial render.
         */
        var LMe = this;

        LMe.props.onLoadComplete();
    }

    pvtGetContainer(p_strParamalink) {
        /**
         * @method pvtGetContainer
         * This method will returns the container on the basis of paramalink
         * 
         * @param {string}: paramalink
         * @returns {Component}: The container on the basis of paramalink
         */
        var LMe = this,
            LObjMenuItems = LMe.props.arrMenuItems || {},
            LArrMenuItems,
            LRecord,
            LComponent = null,
            LTree;

        //If error occured
        if (LObjMenuItems === -1) {

            return (
                <div key={'error-detail-editor'} className="tsMiddle">
                    <WarningIcon htmlColor="red" />
                    <p className="tsHelpText" style={{ margin: '0 0 0 5px' }}>Some error occurred on the server, you can contact with System Administrator! <br /> &nbsp;&nbsp;&nbsp;You can mail us at <i>placementprep20@gmail.com</i></p>
                </div>);
        }//if..

        //If expired
        if (LObjMenuItems === -2) {

            return (
                <div key={'error-detail-editor'} className="tsMiddle">
                    <WarningIcon htmlColor="red" />
                    <p className="tsHelpText" style={{ margin: '0 0 0 5px' }}>Your software is expired, kindly contact with System Administrator at <i>placementprep20@gmail.com</i></p>
                </div>);
        }//if..

        LArrMenuItems = LObjMenuItems.items || [];

        LTree = {
            id: 'main',
            children: LArrMenuItems
        }

        if (isEmpty(p_strParamalink) === true) {

            p_strParamalink = 'home';
        }//if..

        LRecord = tsSearchTree(LTree, 'id', p_strParamalink);

        if (isEmpty(LRecord) === true) {

            return LComponent;
        }//if..

        // switch (LRecord.moduleType) {

        //     case "invoice": 
        //         const TInvoice = require('./single/tsfrmInvoice').default;

        //         LComponent = <TInvoice invoiceRecord={LRecord}></TInvoice>;
        //     break;
        // }

        if (isEmpty(LRecord.moduleClass) === true) {

            return <><p>Page not found.</p></>;
        }//if..

        const TModule = require('./' + LRecord.moduleClass).default;

        LComponent = <TModule
            moduleInfo={LRecord}
            historyProp={LMe.props.history}
        ></TModule>;

        return LComponent;
    }

    render() {
        var LMe = this;
        return (
            <div className="flex1 tsVBox tsDetailEditor">
                {LMe.pvtGetContainer(LMe.props.Paramalink)}
            </div>
        );
    }
}

export default tsfrmSinglePg;