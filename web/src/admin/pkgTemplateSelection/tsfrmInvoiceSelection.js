import React, { Component } from 'react';

import {
    Box, Button, FormControl,
    // FormLabel,
    RadioGroup,
    Radio,
    FormControlLabel
} from '@material-ui/core';
import { BaseUrl, isEmpty, tsGetProjectId } from '../../tsclsGenUtils';
import { GenConstants } from '../../tsclsGenConstants';
// import TInvoiceViewer from '../../single/pkgInvoice/tsfrmInvoiceViewer';

import SaveIcon from '@material-ui/icons/Save';
import PermDataSettingIcon from '@material-ui/icons/PermDataSetting';
import CircularProgress from '@material-ui/core/CircularProgress';
import TSingleInvoice from '../../single/pkgInvoice/tsfrmSingleInvoice';

class tsfrmInvoiceSelection extends Component {
    /**
     * @props: moduleInfo,
     * @returns
     */

    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            SIsLoading: false,
            STemplate: '',
            SInvoiceNo: 1
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

        LMe.pvtLoadTemplates();
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

                    LMe.FTplActionCode = responseJson.defaultInvoice || LMe.FTemplatesArr[0].tplActionCode;

                    LMe.setState({
                        SIsLoading: false,
                        STemplate: LMe.FTplActionCode
                    });
                },
                (error) => {
                    LMe.setState({ SIsLoading: false });
                }
            );
    }

    pvtLoadTemplates() {
        /**
         * @method pvtLoadTemplates
         * This method will loads the template
         */
        var LMe = this;

        LMe.FTemplatesArr = [
            {
                tplTitle: 'GST Theme 1',
                tplActionCode: 'tpl1'
            },
            {
                tplTitle: 'Document Theme',
                tplActionCode: 'tpl2'
            },
            // {
            //     tplTitle: 'GST Theme 3',
            //     tplActionCode: 'tpl3'
            // }
        ];

    }

    pvtGetTemplates() {
        /**
         * @method pvtGetTemplates
         * This method will returns the templates
         */
        var LMe = this,
            LArrUITpl = [];

        LMe.FTemplatesArr = LMe.FTemplatesArr || [];

        LMe.FTemplatesArr.forEach(function (p_objRecord) {

            LArrUITpl.push(
                <FormControlLabel value={p_objRecord.tplActionCode} control={<Radio color="primary" />} label={p_objRecord.tplTitle} />
            );
        });

        return <>{LArrUITpl}</>;
    }

    pvtSave() {
        /**
         * @method pvtSave
         * This method will save/update the project details
         */
        var LMe = this,
            LRequestOptions,
            LUrl,
            LParamObj = {
                defaultInvoice: LMe.state.STemplate
            };

        LRequestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify(LParamObj)
        };

        LUrl = BaseUrl() + 'project/invoice/' + tsGetProjectId();

        if (LMe.state.SIsLoading === true) {
            return;
        }

        LMe.setState({ SIsLoading: true });

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {

                    if (responseJson.success === false || isEmpty(responseJson)) {
                        LMe.setState({
                            SIsLoading: false,
                        });
                        return;
                    } //if..

                    //If Not error
                    LMe.FTplActionCode = responseJson.defaultInvoice || LMe.state.STemplate;
                    LMe.setState({
                        SIsLoading: false,
                    });
                },
                (error) => {
                    this.setState({
                        SIsLoading: false
                    });

                }
            );
    }

    pvtGetInvoice() {
        var LMe = this;

        return <TSingleInvoice
            PInvoiceNoAndType={{
                invoiceNo: LMe.state.SInvoiceNo,
                invoiceType: GenConstants().PESTICIDE_ACT_CODE
            }}
            PTplActionCode={LMe.state.STemplate}
            PIsShowingInApp={true}
        />;
    }

    render() {
        var LMe = this;

        return (
            <div className="flex1 tsVBox tsOverFlowAuto">
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

                <div
                    style={{ margin: '5px 0px 20px 50px' }}
                    className="flex1 tsHBox tsOverFlowAuto"
                >

                    <div className="tsVBox" style={{ margin: '0 10px 0 0' }}>

                        {/* <div style={{ fontSize: '13px' }}>
                            Invoice No: <input type="number" onChange={(e) => {

                                LMe.setState({ SInvoiceNo: parseInt(e.currentTarget.value) })
                            }}
                                placeholder="Enter Invoice No" value={LMe.state.SInvoiceNo} />
                        </div> */}

                        {LMe.FTplActionCode === LMe.state.STemplate ? <></> :
                            <div><Button
                                size="small"
                                style={{ margin: '0 0 20px 0' }}
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
                            </Button></div>
                        }

                        <FormControl component="fieldset" style={{ margin: '0 0 0 0' }}>
                            {/* <FormLabel component="legend">Choose Invoice Template</FormLabel> */}

                            <RadioGroup style={{ margin: '5px 0 0 0' }} value={LMe.state.STemplate} onChange={(event) => LMe.setState({ STemplate: event.target.value })}>
                                {LMe.pvtGetTemplates()}
                            </RadioGroup>
                        </FormControl>
                    </div>

                    <div className="flex1 tsVBox" style={{ margin: '-0 0 0 0' }}>
                        <span style={{ fontWeight: 'bold', textAlign: 'right' }}>Theme Preview</span>
                        <div className="flex1 tsVBox tsOverFlowAuto" style={{
                            border: '1px solid #aaa'
                        }}>
                            {/* {isEmpty(LMe.FDummyInvoice) === true ? <></> :
                            <TInvoiceViewer
                                PSelectedRecord={LMe.FDummyInvoice}
                            />
                        } */}
                            {LMe.pvtGetInvoice()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default tsfrmInvoiceSelection;
