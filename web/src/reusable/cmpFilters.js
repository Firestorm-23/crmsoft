import { Button, Paper, TextField } from '@material-ui/core'
import React, { Component } from 'react'
import { GenConstants } from '../tsclsGenConstants';
import { cloneVar, tsGetDefaultFromDate, tsGetDefaultToDate } from '../tsclsGenUtils';
import TInvoiceType from './tscmpInvoiceType';

class cmpFilters extends Component {

    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            fromDate: tsGetDefaultFromDate(),
            toDate: tsGetDefaultToDate(),
            SInvoiceType: GenConstants().PESTICIDE_ACT_CODE
        };
    }

    componentDidMount() {
        var LMe = this;
        LMe.props.onFilterApplied(cloneVar(LMe.state))
    }

    pvtGetInvoiceTypeContainer() {

        var LMe = this;

        if (LMe.props.PCanAddShowInvoiceType === false) {

            return;
        }

        return <div style={{ margin: '45px 0 0 20px' }}>
            <TInvoiceType
                Value={LMe.state.SInvoiceType}
                OnChange={p_value => LMe.setState({ SInvoiceType: p_value })}
                CanAddPsudoNode={LMe.props.PCanAddPsudoNodeInInvoiceType || false}
            >
            </TInvoiceType>
        </div>;
    }

    render() {

        var LMe = this;

        return (
            <Paper style={{ margin: '0 20px 0 20px' }} className="tsHBox" variant="outlined">

                {LMe.pvtGetInvoiceTypeContainer()}

                <TextField
                    label={'From Date'}
                    type="date"
                    margin="dense"
                    style={{ margin: '29px 0 0 20px' }}
                    value={LMe.state.fromDate}
                    InputLabelProps={{
                        shrink: true
                    }}
                    required={true}
                    onChange={(e) => {

                        LMe.setState({ fromDate: e.currentTarget.value })
                    }}
                />

                <TextField
                    label={'To Date'}
                    type="date"
                    margin="dense"
                    style={{ margin: '29px 0 0 20px' }}
                    value={LMe.state.toDate}
                    InputLabelProps={{
                        shrink: true
                    }}
                    required={true}
                    onChange={(e) => {

                        LMe.setState({ toDate: e.currentTarget.value })
                    }}
                />
                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    disableElevation
                    style={{ margin: '40px 0 30px 30px' }}
                    onClick={() => {
                        LMe.props.onFilterApplied(cloneVar(LMe.state))
                    }}
                >
                    Generate
                </Button>
            </Paper>
        )
    }
}

export default cmpFilters;