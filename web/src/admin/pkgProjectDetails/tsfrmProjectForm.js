import React, { Component } from 'react';

import { Box, Button } from '@material-ui/core';
import { BaseUrl, isEmpty, tsGetProjectId, tsGetStates } from '../../tsclsGenUtils';
import Autocomplete from '@material-ui/lab/Autocomplete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import PermDataSettingIcon from '@material-ui/icons/PermDataSetting';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
    TextField,
} from '@material-ui/core';

class tsfrmProjectForm extends Component {
    /**
     * @props: moduleInfo,
     * @returns
     */

    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            SIsEditMode: false,
            SFetchedData: {},
            SIsLoading: false
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

        // var LObj = {
        //     orgName: 'Achal Krushi Kendra',
        //     orgAddress: 'Old Bus stand, Government Hospital Road',
        //     orgCity: 'Anjangaon Surji',
        //     orgPincode: 444705,

        //     cstName: 'Nandishor Lokhande',
        //     cstMobile: '8275395543, 9921487399',
        //     cstState: 'Maharashtra',

        //     liscense: 'LASD132465, LAID123456'
        // };
        // LMe.FServerData = {};

        LMe.pvtFetchProjectDetails();
    }

    pvtFetchProjectDetails() {
        /**
         * @method pvtFetchProjectDetails
         * This function will fetch the project details from server
         *
         * @returns: Project Objects 
         */
        var LMe = this,
            LUrl;

        LUrl = BaseUrl() + 'project';

        LMe.setState({ SIsLoading: true });

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
                        LMe.setState({ SIsLoading: false });
                        return;
                    }//if..

                    // LMe.FServerData = cloneVar(responseJson);

                    LMe.setState({
                        SFetchedData: responseJson,
                        SIsLoading: false
                    });
                },
                (error) => {
                    LMe.setState({ SIsLoading: false });
                }
            );
    }

    pvtSave() {
        /**
         * @method pvtSave
         * This method will save/update the project details
         */
        var LMe = this,
            LRequestOptions,
            LUrl,
            LParamObj = LMe.state.SFetchedData || {};

        LRequestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify(LParamObj)
        };

        LUrl = BaseUrl() + 'project/' + tsGetProjectId();

        if (LMe.state.SIsLoading === true) {
            return;
        }

        LMe.setState({ SIsLoading: true });

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    LMe.setState({
                        SIsLoading: false,
                        SIsEditMode: false
                    });

                    if (responseJson.success === false || isEmpty(responseJson)) {

                        return;
                    } //if..

                    //If Not error

                },
                (error) => {
                    this.setState({
                        SIsLoading: false
                    });

                }
            );
    }

    pvtGetLiscenseDispName(p_strLic) {

        p_strLic = p_strLic || '';

        return p_strLic.replaceAll(',', ',');
    }

    pvtGetHeaderBox() {

        var LMe = this;

        // if (LMe.props.POpenedInSignUpWindow === true) {

        //     return <></>;
        // }

        return (
            <Box component="div" display="flex" px={4} pb={2}>
                {/* Admin Setting Icon */}
                <div style={{ margin: '20px 6px 0 0' }}>
                    <PermDataSettingIcon />
                </div>
                <div style={{ margin: '18px 6px 0 0' }}>
                    {/* Admin Title */}
                    <div style={{ fontSize: '20px' }}>
                        {' '}
                        {LMe.props.moduleInfo.moduleTitle}{' '}
                    </div>

                    {/* Admin Description */}
                    <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
                        {LMe.props.moduleInfo.moduleDescription}
                    </Box>
                </div>
            </Box>
        );
    }

    render() {
        var LMe = this,
            LProjectDetails = LMe.state.SFetchedData || {},
            LIsEditMode = LMe.state.SIsEditMode;

        return (
            <div className="flex1 tsVBox">

                {LMe.pvtGetHeaderBox()}

                <div
                    style={{ margin: '5px 10px 20px 50px', maxWidth: 700 }}
                    className="flex1 tsVBox"
                >
                    <div className="tsHBox">
                        {LIsEditMode === false ?
                            <Button
                                size="small"
                                style={{ margin: '0 0 5px 0' }}
                                variant="contained"
                                color="primary"
                                disableElevation
                                onClick={() => {

                                    LMe.setState({ SIsEditMode: true });
                                }}
                                startIcon={<EditIcon />}
                            >
                                Edit Details
                            </Button> :
                            <>
                                <Button
                                    size="small"
                                    style={{ margin: '0 0 5px 0' }}
                                    variant="contained"
                                    color="primary"
                                    disableElevation
                                    onClick={() => {

                                        LMe.pvtSave();
                                    }}
                                    startIcon={LMe.state.SIsLoading ? '' : <SaveIcon />}
                                >
                                    {LMe.state.SIsLoading ? <><CircularProgress size={20} color="inherit" /> <span style={{ margin: '0 0 0 10px' }}>Loading...</span></>
                                        : 'Save Details'}

                                </Button>
                                {/* <Button
                                    size="small"
                                    style={{ margin: '0 0 5px 7px' }}
                                    variant="outlined"
                                    color="primary"
                                    disableElevation
                                    onClick={() => {

                                        LMe.setState({
                                            SIsEditMode: false,
                                            SFetchedData: LMe.FServerData
                                        });
                                    }}
                                >
                                    Cancel
                                </Button> */}
                            </>

                        }

                    </div>
                    <div className="flex1 tsVBox tsOverFlowAuto">
                        <div className="tsHBox tsInvoiceViewBorder">
                            <span className="tsInvoiceViewDispField"><b>Organisation Details</b></span>
                        </div>
                        <div className="tsHBox">
                            <span className="tsInvoiceViewDispField">Name</span>
                            <span className="tsInvoiceViewValField flex1">
                                {LIsEditMode === false ?
                                    LProjectDetails.orgName
                                    :
                                    <input
                                        type="text"
                                        value={LProjectDetails.orgName}
                                        onChange={(e) => {
                                            LProjectDetails.orgName = e.currentTarget.value;
                                            LMe.setState({ SFetchedData: LProjectDetails });
                                        }}
                                        className="tsDetailEditorEditField"
                                    />
                                }
                            </span>
                        </div>
                        <div className="tsHBox">
                            <span className="tsInvoiceViewDispField">Address</span>
                            <span className="tsInvoiceViewValField flex1">
                                {LIsEditMode === false ?
                                    LProjectDetails.orgAddress
                                    :
                                    <textarea
                                        value={LProjectDetails.orgAddress}
                                        onChange={(e) => {
                                            LProjectDetails.orgAddress = e.currentTarget.value;
                                            LMe.setState({ SFetchedData: LProjectDetails });
                                        }}
                                        className="tsDetailEditorEditField"
                                    />
                                }
                            </span>
                        </div>
                        <div className="tsHBox">
                            <span className="tsInvoiceViewDispField">City</span>
                            <span className="tsInvoiceViewValField flex1">
                                {LIsEditMode === false ?
                                    LProjectDetails.orgCity
                                    :
                                    <input
                                        type="text"
                                        value={LProjectDetails.orgCity}
                                        onChange={(e) => {
                                            LProjectDetails.orgCity = e.currentTarget.value;
                                            LMe.setState({ SFetchedData: LProjectDetails });
                                        }}
                                        className="tsDetailEditorEditField"
                                    />
                                }
                            </span>
                        </div>
                        <div className="tsHBox">
                            <span className="tsInvoiceViewDispField">Pin Code</span>
                            <span className="tsInvoiceViewValField flex1">
                                {LIsEditMode === false ?
                                    LProjectDetails.orgPincode
                                    :
                                    <input
                                        type="number"
                                        value={LProjectDetails.orgPincode}
                                        onChange={(e) => {
                                            LProjectDetails.orgPincode = e.currentTarget.value;
                                            LMe.setState({ SFetchedData: LProjectDetails });
                                        }}
                                        className="tsDetailEditorEditField"
                                    />
                                }
                            </span>
                        </div>
                        <div className="tsHBox tsInvoiceViewBorder">
                            <span className="tsInvoiceViewDispField"><b>Proprietor Details</b></span>
                            {/* <span className="tsInvoiceViewValField"></span> */}
                        </div>
                        <div className="tsHBox">
                            <span className="tsInvoiceViewDispField">Name</span>
                            <span className="tsInvoiceViewValField flex1">
                                {LIsEditMode === false ?
                                    LProjectDetails.propName
                                    :
                                    <input
                                        type="text"
                                        value={LProjectDetails.propName}
                                        onChange={(e) => {
                                            LProjectDetails.propName = e.currentTarget.value;
                                            LMe.setState({ SFetchedData: LProjectDetails });
                                        }}
                                        className="tsDetailEditorEditField"
                                    />
                                }
                            </span>
                        </div>
                        <div className="tsHBox">
                            <span className="tsInvoiceViewDispField">Mobile Number</span>
                            <span className="tsInvoiceViewValField flex1">
                                {LIsEditMode === false ?
                                    LProjectDetails.propMobileNo
                                    :
                                    <input
                                        type="text"
                                        value={LProjectDetails.propMobileNo}
                                        onChange={(e) => {
                                            LProjectDetails.propMobileNo = e.currentTarget.value;
                                            LMe.setState({ SFetchedData: LProjectDetails });
                                        }}
                                        className="tsDetailEditorEditField"
                                    />
                                }
                            </span>
                        </div>
                        <div className="tsHBox">
                            <span className="tsInvoiceViewDispField">State</span>
                            <span className="tsInvoiceViewValField flex1">
                                {LIsEditMode === false ?
                                    LProjectDetails.propState
                                    :
                                    // <input
                                    //     type="text"
                                    //     value={LProjectDetails.propState}
                                    //     onChange={(e) => {
                                    //         LProjectDetails.propState = e.currentTarget.value;
                                    //         LMe.setState({ SFetchedData: LProjectDetails });
                                    //     }}
                                    //     className="tsDetailEditorEditField"
                                    // />

                                    <Autocomplete
                                        options={tsGetStates()}
                                        getOptionLabel={(option) => {

                                            return option || '';
                                        }}
                                        clearOnEscape
                                        value={LProjectDetails.propState}
                                        onChange={(e, p_value, p_reason) => {
                                            LProjectDetails.propState = p_value;
                                            LMe.setState({ SFetchedData: LProjectDetails });
                                        }}
                                        // id="state"
                                        renderInput={(params) => {

                                            return <TextField
                                                {...params}
                                                label={'State'}
                                                margin="dense"
                                            />
                                        }}
                                    />
                                }
                            </span>
                        </div>
                        <div className="tsHBox tsInvoiceViewBorder">
                            <span className="tsInvoiceViewDispField"><b>Liscense/GST Numbers</b></span>
                            {/* <span className="tsInvoiceViewValField"></span> */}
                        </div>
                        <div className="tsHBox">
                            <span className="tsInvoiceViewDispField"></span>
                            <span className="tsInvoiceViewValField flex1">
                                {LIsEditMode === false ?
                                    LMe.pvtGetLiscenseDispName(LProjectDetails.liscenseNos)
                                    :
                                    <><textarea
                                        value={LProjectDetails.liscenseNos}
                                        onChange={(e) => {
                                            LProjectDetails.liscenseNos = e.currentTarget.value;
                                            LMe.setState({ SFetchedData: LProjectDetails });
                                        }}
                                        className="tsDetailEditorEditField"
                                    />
                                        <span className="tsHelpText tsGrayColor">Comma seperated liscense numbers and GST number will print on seperate line on Invoices.</span>
                                    </>
                                }
                            </span>
                        </div>
                        <div className="tsHBox tsInvoiceViewBorder">
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

export default tsfrmProjectForm;
