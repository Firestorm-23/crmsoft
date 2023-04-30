import React, { Component } from 'react';

import {
    Box,
    Toolbar,
    Button,
    IconButton,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    Paper,
    AppBar
} from '@material-ui/core';

import Draggable from 'react-draggable';

import CloseIcon from '@material-ui/icons/Close';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';

import CircularProgress from '@material-ui/core/CircularProgress';

function PaperComponent(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}

class tsclsDialog extends Component {
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
            IsFullScreen: false
        };

        // LMe.pvtHandleOnESC = LMe.pvtHandleOnESC.bind(LMe);
    }

    // pvtHandleOnESC(event) {
    //     // console.log(event.keyCode);

    //     //ESC
    //     // if (event.keyCode === 27) {

    //     //     console.log('ESC');
    //     // }

    //     //q
    //     // if (event.keyCode === 81) {

    //     //     console.log('ESC1');
    //     // }
    // }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         * 
         */
        // var LMe = this;
    }

    // componentWillUnmount() {
    //     var LMe = this;
    // }

    pvtHandleOnClose() {
        var LMe = this;

        LMe.props.OnDialogClose();
    }

    pvtGetLoadingCmp() {
        // var LMe = this;

        return (
            <div key={'loading-dialog'} className="tsMiddle">
                <CircularProgress key="loading-dialog-cir" />
            </div>
        );
    }

    pvtGetAppHeader() {
        var LMe = this;

        if (LMe.props.IsWindow === false) {
            return (<DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">{LMe.props.DialogHeader}</DialogTitle>);
        }

        return (<AppBar
            id="draggable-dialog-title"
            style={{ cursor: 'move' }}>
            <Toolbar>
                <Typography variant="h6">
                    {LMe.props.DialogHeader}
                </Typography>
                <Box component="span" flex="1"></Box>

                <IconButton
                    color="inherit"
                    size="small"
                    edge="start"
                    disableRipple={true}
                    onClick={() => LMe.setState({ IsFullScreen: !LMe.state.IsFullScreen })}>
                    <Tooltip title={LMe.state.IsFullScreen === true ? 'Exit Full Screen' : 'Full Screen'}>
                        {LMe.state.IsFullScreen === true ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </Tooltip>
                </IconButton>

                <IconButton
                    color="inherit"
                    size="small"
                    disableRipple={true}
                    onClick={() => LMe.pvtHandleOnClose()}>
                    <Tooltip title={'Close Window'}>
                        <CloseIcon />
                    </Tooltip>
                </IconButton>
            </Toolbar>
        </AppBar>);
    }

    pvtGetDialogContent() {
        var LMe = this;

        if (LMe.props.IsWindow === false) {
            return (
                <DialogContent className="tsVBox">
                    {LMe.props.DialogContent}
                </DialogContent>
            );
        }

        return (<DialogContent className="tsDialogInnerContent tsVBox tsDialogMinWidth">
            {LMe.props.DialogLoading === true ? LMe.pvtGetLoadingCmp() : LMe.props.DialogContent}
        </DialogContent>);
    }

    render() {
        var LMe = this;

        return (
            <Dialog
                open={LMe.props.IsDialogOpen}
                maxWidth={LMe.props.IsWindow ? 'md' : 'xs'}
                PaperComponent={PaperComponent}
                aria-labelledby="draggable-dialog-title"
                fullScreen={LMe.state.IsFullScreen}
            >
                {/* Header */}
                {LMe.pvtGetAppHeader()}

                {/* Dialog Content */}
                {LMe.pvtGetDialogContent()}

                {/* Footer */}
                {/* <Box borderColor="primary.main"></Box> */}
                <DialogActions>
                    <Button onClick={() => LMe.pvtHandleOnClose()} color="primary">
                        Cancel
                    </Button>
                    {LMe.props.DialogActions}
                </DialogActions>
            </Dialog>
        );
    }
}

export default tsclsDialog;