import React, { Component } from 'react';
import {
    Box,
    Link,
} from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import TDialog from '../reusable/tsclsDialog';

class tsfrmHome extends Component {
    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            IsAlertDialogOpen: false
        };
    }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         */
        // var LMe = this;   
    }

    render() {
        var LMe = this;

        return (
            <div
                className="flex1 tsVBox"
                style={{
                    margin: '10px 0 10px 0',
                }}
            >
                <Box component="div" display="flex" px={3} pb={2}>
                    {/* Module Icon */}
                    <div style={{ margin: '20px 6px 0 0' }}>
                        <HomeIcon />
                    </div>
                    <div style={{ margin: '18px 6px 0 0' }}>
                        {/* Module Title */}
                        <div style={{ fontSize: '20px' }}> {LMe.props.moduleInfo.displayTxt} </div>

                        {/* Module Description */}
                        {/* <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
                            Here you can see the payment history.
                        </Box> */}
                    </div>
                </Box>

                <div style={{ margin: '20px 6px 0 60px' }}>
                    <b>Quick useful links</b>
                    <ul style={{ lineHeight: 2 }}>
                        <li><Link href="#/invoice">Create a new Invoice</Link></li>
                        <li><Link href="#/stock-report">Add Stock</Link></li>
                        <li><Link href="#/customer-statement">Generate Customer Statement</Link></li>
                        <li><Link href="#/admin/ManageUserAccount">Manage User Accounts</Link></li>
                        <li><Link href="#/admin">Configure Settings</Link></li>
                    </ul>
                </div>
                <TDialog
                    IsDialogOpen={LMe.state.IsAlertDialogOpen}
                    OnDialogClose={() => LMe.setState({ IsAlertDialogOpen: false })}
                    DialogContent={LMe.FWarningText || ''}
                    DialogActions={<></>}
                    DialogHeader={'Warning'}
                    IsWindow={false}
                />
            </div>
        );
    }
}

export default tsfrmHome;
