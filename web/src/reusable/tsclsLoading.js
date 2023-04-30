import React, { Component } from 'react';

import {
    Dialog,
    DialogContent,
    DialogTitle,
    LinearProgress
} from '@material-ui/core';

// import CircularProgress from '@material-ui/core/CircularProgress';

class tsclsLoading extends Component {
    /**
     * @props: 
     *  POnStopLoading: method
     *  PIsLoading: boolean
     *  PLoadingText: text
     *  
     */

    pvtGetLoadingCmp() {
        // var LMe = this;

        return (
            // <div key={'loading-dialog'} className="tsMiddle">
            //     <CircularProgress key="loading-dialog-cir" />
            // </div>
            <LinearProgress />
        );
    }

    render() {
        var LMe = this;

        return (
            <Dialog
                open={LMe.props.PIsLoading}
            // maxWidth="md"
            >
                {/* Header */}
                <DialogTitle><span style={{
                    fontSize: 15
                }}>{LMe.props.PLoadingText || 'Loading, please wait...'}</span></DialogTitle>

                {/* Dialog Content */}
                <DialogContent className="tsVBox" style={{ margin: '0 0 20px 0', minWidth: '400px' }}>
                    {LMe.pvtGetLoadingCmp()}
                </DialogContent>
            </Dialog>
        );
    }
}

export default tsclsLoading;