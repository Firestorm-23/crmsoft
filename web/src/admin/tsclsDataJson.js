import React, { Component } from 'react';

import { Box, Breadcrumbs, Typography, Link } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import SettingsTwoToneIcon from '@material-ui/icons/SettingsTwoTone';
import { IsDesktopApp, isEmpty, tsSearchTree } from '../tsclsGenUtils';
import PeopleSharpIcon from '@material-ui/icons/PeopleSharp';
import DashboardSharpIcon from '@material-ui/icons/DashboardSharp';
import BallotIcon from '@material-ui/icons/Ballot';
import PermDataSettingIcon from '@material-ui/icons/PermDataSetting';
import PrintIcon from '@material-ui/icons/Print';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import RestoreIcon from '@material-ui/icons/Restore';

class tsclsDataJson extends Component {

    // constructor(props) {
    //     super(props);

    //     var LMe = this;
    // }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         * 
         */
        var LMe = this;

        LMe.props.onLoadComplete();
        LMe.pvtDefineProperties();
    }

    pvtDefineProperties() {
        /**
         * @method pvtDefineProperties
         * This method will define the data json
         */
        // var LMe = this;
    }

    pvtGetParamalink() {
        /**
         * INTENT: This method will return the first paramalink from parameter
         */

        var LMe = this,
            LHistoryProp = LMe.props.historyProp,
            LPathName = '';

        if (isEmpty(LHistoryProp) === false) {

            LPathName = LHistoryProp.location.pathname;
        }//if..

        return LPathName;
    }

    pvtGetDataJson() {
        /**
         * @method pvtGetDataJson
         * This method will return the data json
         */
        var //LMe = this,
            LDataJson;

        LDataJson = {
            children: [
                {
                    moduleTitle: 'Manage User Accounts',
                    moduleDescription: 'Add, Modify, Activate/Deactivate users.',
                    moduleType: 'ManageUserAccount',
                    moduleClass: 'pkgManageUserAccount/tsfrmUserAccount',
                    hidden: false,
                    iconCmp: <PeopleSharpIcon />
                },
                {
                    moduleTitle: 'Manage Project Details',
                    moduleDescription: 'Setup project details for showing info on invoices, statement, etc.',
                    moduleType: 'ConfigureProjectDetails',
                    moduleClass: 'pkgProjectDetails/tsfrmProjectForm',
                    hidden: false,
                    iconCmp: <PermDataSettingIcon />
                },
                {
                    moduleTitle: 'Backup and Restore',
                    moduleDescription: 'The most effective way to prevent business data loss is to back up your files.',
                    moduleType: 'BackupRestore87885236',
                    isFeatureAvailableInWeb: IsDesktopApp(),
                    hidden: false,
                    iconCmp: <CloudDownloadIcon />,
                    children: [
                        {
                            moduleTitle: 'Backup',
                            moduleDescription: 'This option will allow you to generate and download the backup file of your data.',
                            moduleType: 'Backup87885236',
                            moduleClass: 'pkgBackupAndRestore/frmBackup',
                            // Made it available in web producation
                            isFeatureAvailableInWeb: true,
                            hidden: false,
                            parentModuleType: 'BackupRestore87885236',
                            iconCmp: <CloudDownloadIcon />
                        },
                        {
                            moduleTitle: 'Restore',
                            moduleDescription: 'This option will allow you to restore your data from the backup file.',
                            moduleType: 'Restore',
                            moduleClass: 'pkgBackupAndRestore/frmRestore',
                            isFeatureAvailableInWeb: IsDesktopApp(),
                            hidden: false,
                            parentModuleType: 'BackupRestore',
                            iconCmp: <RestoreIcon />
                        },
                    ]
                },
                {
                    moduleTitle: 'Choose Invoice Template',
                    moduleDescription: 'Select default template of invoice for printing.',
                    moduleType: 'InvoiceTemplate',
                    moduleClass: 'pkgTemplateSelection/tsfrmInvoiceSelection',
                    hidden: false,
                    iconCmp: <PrintIcon />
                },
                {
                    moduleTitle: 'Configure Customer Fields',
                    moduleDescription: 'Add, Modify, Delete fields for Customers.',
                    moduleType: 'ConfigureCustomerFields',
                    moduleClass: 'pkgCustomCustomersFields/tsfrmCstFieldsShell',
                    hidden: false,
                    iconCmp: <DashboardSharpIcon />
                },
                {
                    moduleTitle: 'Configure Product Fields',
                    moduleDescription: 'Add, Modify, Delete custom fields for Products, Stocks.',
                    moduleType: 'ConfigureCustomFields',
                    hidden: false,
                    iconCmp: <BallotIcon />,
                    children: [
                        {
                            moduleTitle: 'Configure Product Fields',
                            moduleDescription: 'Add, Modify, Delete fields for Products.',
                            moduleType: 'ConfigureProductFields',
                            moduleClass: 'pkgCustomProductFields/tsfrmProductFieldsShell',
                            hidden: false,
                            parentModuleType: 'ConfigureCustomFields',
                            iconCmp: <DashboardSharpIcon />
                        },
                        {
                            moduleTitle: 'Configure Stock Fields',
                            moduleDescription: 'Add, Modify, Delete fields for Stock.',
                            moduleType: 'ConfigureStockFields',
                            moduleClass: 'pkgCustomStockFields/tsfrmStockFieldsShell',
                            hidden: false,
                            parentModuleType: 'ConfigureCustomFields',
                            iconCmp: <BallotIcon />
                        }
                    ]
                },
                {
                    moduleTitle: 'Configure Invoice Types',
                    moduleDescription: 'Add, Modify, Delete invoice types.',
                    moduleType: 'ConfigureInvoiceTypes',
                    moduleClass: 'pkgInvoiceTypes/tsfrmInvoiceTypeShell',
                    hidden: false,
                    iconCmp: <DashboardSharpIcon />
                }
            ]
        };

        return LDataJson;
    }

    pvtHandleOnLinkClick(p_moduleType) {
        /**
         * @method pvtHandleOnLinkClick
         * This method will open module for moduleType
         */
        var LMe = this,
            LHistoryProp = LMe.props.historyProp;

        if (isEmpty(LHistoryProp) === true) {

            return;
        }//if..

        LHistoryProp.push('/admin' + p_moduleType || '');
    }

    pvtGetUIComponent(p_objRecord) {
        /**
         * @method pvtGetUIComponent
         * This function will return the UI component for parent object
         */
        var LMe = this,
            LComponent = null;

        if (isEmpty(p_objRecord) === true) {

            return LComponent;
        }

        if (p_objRecord.hidden === true) {

            return LComponent;
        }

        LComponent = (
            <Box component="div" className="tsVBox" mt={4} ml={7} key={p_objRecord.moduleType}>
                <div className="tsHBox">
                    <div style={{ margin: '5px 10px 0 0' }}>
                        {p_objRecord.iconCmp}
                    </div>
                    <div>
                        <Link
                            style={{ cursor: 'pointer', fontSize: '20px' }}
                            color="primary"
                            onClick={() => LMe.pvtHandleOnLinkClick('/' + p_objRecord.moduleType)}
                            title={p_objRecord.moduleTitle}
                        >
                            {p_objRecord.moduleTitle}
                        </Link>
                        <Box component="div" style={{ fontSize: '13px', margin: '5px 0 0 0' }}>{p_objRecord.moduleDescription}</Box>
                    </div>
                </div>
            </Box>
        );

        return LComponent;
    }

    pvtGetJsonFilesComponent(p_arrDataJson) {
        /**
         * @method pvtGetJsonFilesComponent
         * This function will return the component from JSON object
         */
        var LMe = this,
            LDataJson = p_arrDataJson || LMe.pvtGetDataJson().children || [],
            LComponent = [];

        if (isEmpty(LDataJson) === true) {

            return LComponent;
        }//if..

        LDataJson.forEach(function (p_objRecord) {

            if (LMe.pvtIsFeatureAvailableInWeb(p_objRecord.isFeatureAvailableInWeb) === false) {
                // Here means the feature is not available in web
                return true;
            }

            LComponent.push(LMe.pvtGetUIComponent(p_objRecord));
        });//for..

        return <div style={{ margin: '0 0 30px 0' }}>{LComponent}</div>;
    }

    pvtGetBreadcrumbs(p_moduleType) {
        /**
         * @method pvtGetBreadcrumbs
         * This function will return the UI for breadcrumb
         */
        var LMe = this,
            LModuleType = p_moduleType || LMe.props.moduleType,
            LRecord,
            LComponent = [];

        if (isEmpty(LModuleType) === true) {

            return null;
        }//if..

        LRecord = tsSearchTree(LMe.pvtGetDataJson() || {}, 'moduleType', LModuleType);

        if (isEmpty(LRecord) === true) {

            return LComponent;
        }//if..

        if (isEmpty(LRecord.parentModuleType) === false) {

            LComponent.push(LMe.pvtGetBreadcrumbs(LRecord.parentModuleType));
        }//if..

        if (isEmpty(p_moduleType) === true) {
            // Last node

            LComponent.push(<Typography key={LModuleType + 'breadcrum'} color="textPrimary">{LRecord.moduleTitle}</Typography>);
        }
        else {
            // Buttons
            LComponent.push(<Link color="inherit" key={LModuleType + 'breadcrum'} style={{ cursor: 'pointer' }} onClick={() => LMe.pvtHandleOnLinkClick('/' + LRecord.moduleType)}>{LRecord.moduleTitle}</Link>);
        }

        return LComponent;
    }

    pvtGetSingleModule() {
        /**
         * @method pvtGetSingleModule
         * This function will return the UI for single module
         */
        var LMe = this,
            LModuleType = LMe.props.moduleType,
            LRecord,
            LComponent = null;

        if (isEmpty(LModuleType) === true) {

            return LComponent;
        }//if..

        LRecord = tsSearchTree(LMe.pvtGetDataJson() || {}, 'moduleType', LModuleType);

        if (isEmpty(LRecord) === true) {

            return LComponent;
        }//if..

        // if (LMe.pvtIsFeatureAvailableInWeb(LRecord.isFeatureAvailableInWeb) === false) {
        //     // Here means the feature is not available in web
        //     return LComponent;
        // }

        if (isEmpty(LRecord.children) === false) {

            LComponent = LMe.pvtGetJsonFilesComponent(LRecord.children);
            return LComponent;
        }

        const TModule = require('./' + LRecord.moduleClass).default;

        LComponent = <TModule
            moduleInfo={LRecord}
            historyProp={LMe.props.history}
        ></TModule>;

        return LComponent;
    }

    pvtIsFeatureAvailableInWeb(p_boolIsFeatureAvailableInWeb) {
        /**
         * @method pvtIsFeatureAvailableInWeb
         */

        if (p_boolIsFeatureAvailableInWeb !== false) {
            return true;
        }//if..

        return IsDesktopApp() === true;
    }

    render() {
        var LMe = this;

        return (
            <div className="flex1 tsVBox tsOverFlowAuto">
                <Box component="div" display="flex" px={6} pb={2} style={{ background: '#f5f5f5' }}>
                    {/* Admin Setting Icon */}
                    <div style={{ margin: '25px 6px 0 0' }}><SettingsTwoToneIcon /></div>
                    <div style={{ margin: '18px 6px 0 0' }}>
                        {/* Admin Title */}
                        <div style={{ fontSize: '25px' }}> Settings </div>

                        {/* Admin Description */}
                        <Box component="div" style={{ fontSize: '13px' }} mt={0.1}>
                            {/* {'Here you can configure settings.'} */}
                        </Box>

                        {/* Admin Breadcrumbs */}
                        <Box component="div" mt={2}>
                            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                                <Link key="adminBread" color="inherit" style={{ cursor: 'pointer' }} onClick={() => LMe.pvtHandleOnLinkClick('')}>
                                    Admin
                                </Link>
                                {LMe.pvtGetBreadcrumbs()}
                            </Breadcrumbs>
                        </Box>
                    </div>
                </Box>
                <Box component="div" px={5} className="flex1 tsVBox tsOverFlowAuto" bgcolor="background.paper">
                    {LMe.pvtGetParamalink() === '/admin' ? LMe.pvtGetJsonFilesComponent() : LMe.pvtGetSingleModule()}
                </Box>
            </div>
        );
    }
}

export default tsclsDataJson;