import React, { Component } from 'react'
// import BackupIcon from '@material-ui/icons/Backup';
import { Box, Button } from '@material-ui/core';
import RestoreIcon from '@material-ui/icons/Restore';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import TLoading from '../../reusable/tsclsLoading';
import { BaseUrl, isEmpty, tsDownlodByLink } from '../../tsclsGenUtils';
import TDialog from '../../reusable/tsclsDialog';

class frmBackup extends Component {

    constructor(props) {

        super(props);

        var LMe = this;

        LMe.state = {
            SLoading: false,
            IsAlertDialogOpen: false
        };

        LMe.FForm = React.createRef();
        LMe.FFileField = React.createRef();
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

    pvtOnFormSubmit(e) {

        // var LMe = this;

        return false;
    }

    pvtOnBtnClick() {

        var LMe = this,
            LSelectedFileName = LMe.FFileField.current.value;

        if (isEmpty(LSelectedFileName) === true) {

            LMe.FWarningText = 'Select the backup file which you want to restore and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        }//if..

        LMe.FForm.current.submit();
    }

    render() {
        var LMe = this;

        return (
            <div className="flex1 tsVBox">
                <Box component="div" display="flex" px={4} pb={2}>
                    {/* Admin Setting Icon */}
                    <div style={{ margin: '20px 6px 0 0' }}>
                        <RestoreIcon />
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
                        <form
                            enctype="multipart/form-data"
                            action={BaseUrl() + 'backup-restores/uploadfile'}
                            method="post"
                            ref={LMe.FForm}
                        >
                            <div>
                                <input
                                    accept=".tnl"
                                    id="contained-button-file"
                                    multiple={false}
                                    type="file"
                                    name="tsFileField"
                                    ref={LMe.FFileField}
                                />
                                {/* <input type="submit" value="Submit" /> */}
                                <div style={{ marginTop: 25 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<CloudUploadIcon />}
                                        size="small"
                                        onClick={LMe.pvtOnBtnClick.bind(LMe)}
                                    >
                                        Upload File and Restore data
                                    </Button>
                                </div>
                                <div style={{ margin: '20px 0 0 0' }}>
                                    <span className="tsHelpText">
                                        <b>Note</b>: Make sure you take a backup before restoring the data because once a new file is uploaded then there is no way to go with existing data.
                                    </span>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <TLoading
                    PLoadingText={LMe.FLoadingText}
                    PIsLoading={LMe.state.SLoading}
                />
                <TDialog
                    IsDialogOpen={LMe.state.IsAlertDialogOpen}
                    OnDialogClose={() => LMe.setState({ IsAlertDialogOpen: false })}
                    DialogContent={LMe.FWarningText || ''}
                    DialogActions={<></>}
                    DialogHeader={'Warning'}
                    IsWindow={false}
                />
            </div>
        )
    }
}

export default frmBackup;