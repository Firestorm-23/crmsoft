import React, { Component } from 'react';
import {
    // FormControl, InputLabel, Select,
    TextField, MenuItem
} from '@material-ui/core';
// import { GenConstants } from '../tsclsGenConstants';
import {
    BaseUrl, isEmpty, tsGetProjectId,
    //  isEmpty 
} from '../tsclsGenUtils';
import Autocomplete from '@material-ui/lab/Autocomplete';

class tscmpProductSelection extends Component {
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
            FetchedData: []
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

        LMe.pvtFetchProducts();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        var LMe = this;

        if (prevProps.InvoiceType !== LMe.props.InvoiceType) {

            LMe.pvtFetchProducts();
        }
    }

    pvtFetchProducts() {
        /**
         * @method pvtFetchProducts
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var LMe = this,
            LUrl;

        if (isEmpty(LMe.props.InvoiceType) === true) {

            return;
        }//if..

        LUrl = BaseUrl() + 'products/type/' + LMe.props.InvoiceType;

        var LRequestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            }
        };

        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.status === 'error') {
                        LMe.setState({
                            FetchedData: [],
                        });
                        return;
                    }//if..

                    var LState = {
                        FetchedData: responseJson
                    };

                    if (isEmpty(LMe.props.Value.id) === false && LMe.props.Value.hasOwnProperty('productName') === false) {

                        responseJson.forEach(function (p_objRecord) {

                            if (p_objRecord.id === LMe.props.Value.id) {

                                LMe.props.OnChange(p_objRecord);
                            }//if..
                        });
                    }//if..

                    LMe.setState(LState);
                },
                (error) => {
                    this.setState({
                        FetchedData: [],
                    });
                }
            );
    }

    pvtGetItems() {
        /**
         * @method pvtGetItems
         */

        var LMe = this,
            LArrMenuItem = [],
            LArrProducts;

        LArrProducts = LMe.state.FetchedData || [];

        LArrProducts.forEach(function (p_objRecord, p_intIndex) {

            LArrMenuItem.push(
                <MenuItem key={p_objRecord.productName + 'key' + p_intIndex} value={p_objRecord}>{p_objRecord.productName}</MenuItem>
            );
        });

        return LArrMenuItem;
    }

    render() {

        var LMe = this;

        return (
            // <FormControl style={{ margin: '-20px 0 0 0', width: '200px' }}>
            //     <InputLabel>{LMe.props.EmptyText}</InputLabel>
            //     <Select
            //         value={LMe.props.Value}
            //         onChange={(e) => {
            //             LMe.props.OnChange(e.target.value);
            //         }}
            //     >
            //         {LMe.pvtGetItems()}
            //     </Select>
            // </FormControl>
            <Autocomplete
                options={LMe.state.FetchedData}
                getOptionLabel={(option) => {

                    return option.productName || '';
                }}
                clearOnEscape
                style={{ margin: '-20px 0 0 0', width: '200px' }}
                value={LMe.props.Value}
                onChange={(e, p_value, p_reason) => {

                    LMe.props.OnChange(p_value || {});
                }}
                id="product"
                renderInput={(params) => {

                    return <TextField
                        {...params}
                        label={LMe.props.EmptyText}
                        margin="dense"
                    // value={LMe.props.Value}
                    // onChange={(e) => {
                    //     debugger
                    //     LMe.props.OnChange(e.target.value);
                    // }}
                    />
                }}
            />
        );
    }
}

export default tscmpProductSelection;