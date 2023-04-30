import React, { Component } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { GenConstants } from '../tsclsGenConstants';
import { tsGetInvoiceTypes, tsSaveInLocalStorage, tsGetFromLocalStorage, isEmpty, tsIsInvoiceByType } from '../tsclsGenUtils';

class tscmpInvoiceType extends Component {
    /**
     * @props: 
     *  OnDialogClose
     *  IsDialogOpen
     *  
     * @returns 
     */

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         * 
         */
        var LMe = this;

        var LInvoiceType = tsGetFromLocalStorage('tsLastSelectedInvoiceType');

        if (isEmpty(LInvoiceType) === false) {

            LMe.pvtHandleOnChange(LInvoiceType);
        }
        else {

            //Selecting first invoice type
            var LArrInvoiceTypes = tsGetInvoiceTypes(LMe.props.PCanShowSystemTypes || false) || [];

            if (LArrInvoiceTypes.length > 0) {

                LMe.pvtHandleOnChange(LArrInvoiceTypes[0].ACT_CODE);
            }
        }
    }

    pvtGetItems() {
        /**
         * @method pvtGetItems
         */

        var LMe = this,
            LArrMenuItem = [],
            LArrInvoiceTypes = tsGetInvoiceTypes(LMe.props.PCanShowSystemTypes || false) || [];

        LArrInvoiceTypes.forEach(function (p_objRecord, p_intIndex) {

            //Adding Psudo node 
            if (p_intIndex === 0 && LMe.props.CanAddPsudoNode === true) {

                LArrMenuItem.push(
                    <MenuItem key={p_objRecord.PSUDO_INVOICE_TYPE_ALL + '-key'} value={GenConstants().PSUDO_INVOICE_TYPE_ALL}>
                        All
                    </MenuItem>
                );
            }//if..

            LArrMenuItem.push(
                <MenuItem key={p_objRecord.ACT_CODE + '-key'} value={p_objRecord.ACT_CODE}>{p_objRecord.NAME}</MenuItem>
            );
        });

        return LArrMenuItem;
    }

    pvtHandleOnChange(p_value) {

        var LMe = this;

        LMe.props.OnChange(p_value);

        if (tsIsInvoiceByType(p_value)) {

            //Save in local storage
            tsSaveInLocalStorage('tsLastSelectedInvoiceType', p_value);
        }//if..
    }

    render() {

        var LMe = this;

        return (
            <FormControl style={{ margin: '-20px 0 0 0', width: '200px' }}>
                <InputLabel>{LMe.props.EmptyText}</InputLabel>
                <Select
                    value={LMe.props.Value}
                    onChange={(e) => {
                        LMe.pvtHandleOnChange(e.target.value);
                    }}
                >
                    {LMe.pvtGetItems()}
                </Select>
            </FormControl>
        );
    }
}

export default tscmpInvoiceType;