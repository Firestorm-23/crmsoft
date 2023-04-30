import React, { Component } from 'react'
// import BackupIcon from '@material-ui/icons/Backup';
import { Box, Button } from '@material-ui/core';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import TurnedInIcon from '@material-ui/icons/TurnedIn';
import TLoading from '../../reusable/tsclsLoading';
import { BaseUrl, isEmpty, tsDownlodByLink } from '../../tsclsGenUtils';
import { Link } from 'react-router-dom';

class frmBackup extends Component {

    constructor(props) {

        super(props);

        var LMe = this;

        LMe.state = {
            SLoading: false
        };
    }

    pvtOnDownloadBtnClick(p_boolCanDownload, p_callBack) {
        /**
         * @method pvtOnDownloadBtnClick
         * This method will fire the command
         */

        var LMe = this,
            LUrl;

        LMe.FLoadingText = 'Generating backup file, please wait...';
        LMe.setState({ SLoading: true });

        setTimeout(() => {

            LMe.setState({ SLoading: false });

            LUrl = BaseUrl() + 'backup-restores/backup';

            if (p_boolCanDownload === true) {

                tsDownlodByLink(LUrl);
            }
            else {

                fetch(LUrl);
            }

            if (isEmpty(p_callBack) === false) {

                p_callBack();
            }
        }, 2000);
    }

    pvtOpenFolder() {

        var LMe = this,
            LUrl;

        LUrl = BaseUrl() + 'backup-restores/openfolder';

        LMe.FLoadingText = 'Opening the folder, please wait...';
        LMe.setState({ SLoading: true });

        fetch(LUrl)
            .then((response) => response.json())
            .then(
                (responseJson) => {

                    LMe.setState({
                        SLoading: false
                    });

                    //This will handle at rest side, 
                    //Nothing here
                },
                (error) => {
                    LMe.setState({
                        SLoading: false
                    });
                }
            );
    }

    render() {
        var LMe = this;

        return (
            <div className="flex1 tsVBox">
                <Box component="div" display="flex" px={4} pb={2}>
                    {/* Admin Setting Icon */}
                    <div style={{ margin: '20px 6px 0 0' }}>
                        <CloudDownloadIcon />
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
                <div className="flex1">
                    <div className="tsVBox" style={{ margin: '30px 0 0 70px' }}>

                        <div>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<TurnedInIcon />}
                                size="small"
                                onClick={() => {
                                    LMe.pvtOnDownloadBtnClick(false, () => LMe.pvtOpenFolder());
                                }}
                            >
                                Save backup file in Users folder
                            </Button>
                        </div>

                        <div style={{ margin: '20px 0 0 130px' }}>
                            <span className="">OR</span>
                        </div>
                        <div>
                            <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<CloudDownloadIcon />}
                                style={{ margin: '20px 0 0 0' }}
                                size="small"
                                onClick={() => LMe.pvtOnDownloadBtnClick(true)}
                            >
                                Generate and download the backup file
                            </Button>
                        </div>
                        <span style={{ marginTop: 15 }} className="tsHelpText">
                            If the file has not downloaded automatically, <Link onClick={() => LMe.pvtOpenFolder()}>click here</Link> to open file path manually.
                        </span>
                    </div>
                </div>
                <TLoading
                    PLoadingText={LMe.FLoadingText}
                    PIsLoading={LMe.state.SLoading}
                />
            </div>
        )
    }
}

export default frmBackup;