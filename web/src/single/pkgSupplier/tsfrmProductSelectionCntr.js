import React, { Component } from 'react';
import {
    Box,
    Button,
    Snackbar
} from '@material-ui/core';
import { isEmpty, BaseUrl, cloneVar, tsGetProjectId } from '../../tsclsGenUtils';
import TDialog from '../../reusable/tsclsDialog';
import SaveIcon from '@material-ui/icons/Save';
import TProductStockSelection from '../pkgManageProducts/tsfrmStocksShell';
import { GenConstants } from '../../tsclsGenConstants';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@material-ui/icons/Delete';

class tsfrmProductSelectionCntr extends Component {
    /**
     * @props: isVisible, 
     * @returns 
     */

    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            IsDialogOpen: false,
            IsAlertDialogOpen: false,
            SArrProducts: [],
            GridColumns: [],
            GridEditRowsModel: {},
            IsSnackOn: false
        };

        LMe.FDataGrid = React.createRef();
    }

    ResetFields() {
        var LMe = this;

        LMe.setState({
            SArrProducts: [],
            // GridColumns: [],
            GridEditRowsModel: {}
        });
    }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         * 
         */
        var LMe = this;

        LMe.pvtDefineProperties();

        LMe.FGrandTotal = 0;
        LMe.FIsEditMode = false;

        if (isEmpty(LMe.props.PProductsArr) === false) {

            LMe.FIsEditMode = true;

            LMe.props.PProductsArr.forEach(function (p_objRecord) {

                LMe.pvtFetchProductsStockById(BaseUrl() + 'products/' + p_objRecord.productId, function (p_objProductResponse) {

                    p_objRecord.product = p_objProductResponse || {};
                    LMe.pvtFetchProductsStockById(BaseUrl() + 'stocks/' + p_objRecord.stockId, function (p_objStockResponse) {

                        p_objStockResponse = p_objStockResponse || {};

                        p_objStockResponse.costPrice = p_objRecord.purchasedPrice;

                        p_objRecord.stock = p_objStockResponse;
                        LMe.HandleOnSelect(p_objRecord);
                    });
                });
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        /**
         * @method componentDidUpdate
         * 
         */
        var LMe = this;

        if (prevProps.PInvoiceType !== LMe.props.PInvoiceType) {

            LMe.pvtDefineProperties();
        }
    }

    pvtDefineProperties() {

        var LMe = this;

        LMe.FProductColumns = [];
        LMe.FStockColumns = [];

        LMe.setState({
            SArrProducts: [],
            GridColumns: [],
        });

        LMe.pvtFetchProductsFields(GenConstants().PRODUCT_CSTM_FIELDS);
        LMe.pvtFetchProductsFields(GenConstants().STOCK_CSTM_FIELDS);
    }

    pvtFetchProductsStockById(p_url, p_callBack) {
        /**
         * @method p_objRecord
         * First fetches the product details then stock details
         */

        var LMe = this,
            //Url
            LUrl = p_url;

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
                    if (responseJson.error === true) {
                        LMe.FWarningText = responseJson.message;
                        LMe.setState({ IsAlertDialogOpen: true });
                        return;
                    }//if..

                    if (isEmpty(p_callBack) === false) {
                        p_callBack(responseJson);
                    }
                },
                (error) => {

                    LMe.FWarningText = error.message;
                    LMe.setState({ IsAlertDialogOpen: true });
                    return;
                }
            );
    }

    pvtFetchProductsFields(p_strField) {
        /**
         * @method pvtFetchProductsFields
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var LMe = this,
            LUrl,
            LInvoiceType = LMe.props.PInvoiceType;

        if (isEmpty(LInvoiceType) === true) {

            return;
        }//if..

        //Url
        LUrl = BaseUrl() + 'customFields/type/' + p_strField + '/' + LInvoiceType;

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
                    if (responseJson.error === true) {
                        LMe.FWarningText = responseJson.message;
                        LMe.setState({ IsAlertDialogOpen: true });
                        return;
                    }//if..

                    if (p_strField === GenConstants().PRODUCT_CSTM_FIELDS) {

                        LMe.FProductColumns = responseJson || [];
                    }
                    else {

                        LMe.FStockColumns = responseJson || [];
                    }

                    LMe.pvtLoadGridColumns();
                },
                (error) => {

                    LMe.FWarningText = error.message;
                    LMe.setState({ IsAlertDialogOpen: true });
                    return;
                }
            );
    }

    pvtLoadGridColumns() {
        /**
         * @method pvtLoadGridColumns
         * This method will create the columns for invoice from stock columns and product columns
         */
        var LMe = this,
            LObj,
            LArrColumn = [],
            LArrConcated = LMe.FProductColumns.concat(LMe.FStockColumns);

        LArrColumn = [
            {
                field: 'productName',
                headerName: 'Particulars',
                headerClassName: 'tsGridHeader',
                minWidth: 150,
                flex: 1,
                color: 'primary'
            },
            {
                field: 'hsn',
                headerName: 'HSN',
                headerClassName: 'tsGridHeader',
                width: 110,
                color: 'primary'
            },
        ];

        LArrConcated.forEach(function (p_objRecord) {

            if (p_objRecord.isSystemField === true) {

                return true;
            }//if..

            LObj = {};

            LObj['headerName'] = p_objRecord.fieldName;

            //Setting column name
            LObj['field'] = p_objRecord.columnName;
            LObj['headerClassName'] = 'tsGridHeader';
            LObj['minWidth'] = 130;

            // LObj['fieldType'] = p_objRecord.fieldType;
            // LObj['isRequired'] = p_objRecord.isRequired === 1;

            LArrColumn.push(LObj);
        });

        LArrColumn.push(
            {
                field: 'gst',
                headerName: 'GST',
                headerClassName: 'tsGridHeader',
                width: 110,
                color: 'primary',
                type: 'number'
            },
            {
                field: 'qty',
                headerName: 'Quantity',
                headerClassName: 'tsGridHeader',
                width: 110,
                color: 'primary',
                type: 'number',
                // editable: true
            },
            {
                field: 'costPrice',
                headerName: 'Price',
                headerClassName: 'tsGridHeader',
                width: 110,
                color: 'primary',
                type: 'number',
                // editable: true
            },
            {
                field: 'total',
                headerName: 'Total',
                headerClassName: 'tsGridHeader',
                width: 110,
                type: 'number',
                color: 'primary',
                renderCell: (p_objParams) => {
                    // var LRecord = p_objParams.row;
                    // // return (LRecord.qty || 1) * LRecord.costPrice;

                    return (p_objParams.getValue(p_objParams.id, 'qty') || 1) * (p_objParams.getValue(p_objParams.id, 'costPrice'));
                }
            },
        );

        LMe.setState({ GridColumns: LArrColumn });
    }

    pvtGetDialogAction() {
        var LMe = this;

        return (<Button
            onClick={() => { LMe.HandleOnSelect() }}
            color="primary" variant="contained" size="small" startIcon={<SaveIcon />}>
            Select
        </Button>);
    }

    pvtGetDialogContent() {

        var LMe = this;

        return (
            <TProductStockSelection
                IsSelectMode={true}
                HandleOnSelect={(p_objRecord) => LMe.HandleOnSelect(p_objRecord)}
                SelectedRecord={(p_objRecord) => LMe.FSelectedRecord = p_objRecord}
                PInvoiceType={LMe.props.PInvoiceType}
            ></TProductStockSelection>
        );
    }

    HandleOnSelect(p_objSelectedRecord) {
        /**
         * @method HandleOnSelect
         * This method handle on select the record from pop up
         */
        var LMe = this,
            LSelectedRecord = cloneVar(p_objSelectedRecord) || LMe.FSelectedRecord;

        if (isEmpty(LSelectedRecord) === true) {
            LMe.FWarningText = 'Select a Purchased Product and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..

        // LSelectedRecord contains: product and stock

        var LArrProducts = LMe.state.SArrProducts || [],
            LArrSelectedProducts = [];

        //Getting stock id
        var LStockId = LSelectedRecord.stock.id;

        LArrProducts.forEach(function (p_objRecord) {

            if (p_objRecord.stockId === LStockId) {

                return true;
            }//if..

            LArrSelectedProducts.push(p_objRecord);
        });

        //Delete id field for avoiding conflict
        LSelectedRecord.stock.id = '';

        var LObj = { ...LSelectedRecord.product, ...LSelectedRecord.stock };

        //Setting Default quantity
        LObj.qty = LSelectedRecord.stock.tqty || 1;

        // LObj.rQty = LSelectedRecord.stock.qty;

        //Adding remeaining qty to orginal qty for edit mode
        // if (LMe.FIsEditMode === true) {

        //     LObj.rQty += LObj.qty;
        // }//if..

        // if (LObj.rQty < 1 && LMe.props.PIsReadOnlyMode !== true) {

        //     LMe.FWarningText = 'Selected Product is out of stock.';
        //     LMe.setState({ IsAlertDialogOpen: true });
        //     return;
        // }//if..

        LObj.stockId = LStockId;

        LObj.id = LStockId;

        LArrSelectedProducts.push(LObj);

        LMe.FGrandTotal += (LObj.costPrice * LObj.qty);
        LMe.props.SetGrandTotal(LMe.FGrandTotal);

        if (isEmpty(LMe.props.SetProducts) === false) {

            LMe.props.SetProducts(LArrSelectedProducts);
        }

        LMe.setState({
            IsDialogOpen: false,
            SArrProducts: LArrSelectedProducts || []
        });
    }

    pvtHandleOnDeleteButtonClick() {
        /**
         * @method pvtHandleOnDeleteButtonClick
         * This method will remove the selected item from invoice
         */
        var LMe = this;

        if (isEmpty(LMe.FSelectedRecordInvoice) === true) {
            LMe.FWarningText = 'Select a product and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..

        var LArrProducts = LMe.state.SArrProducts || [],
            LArrSelectedProducts = [];

        //Getting stock id
        var LStockId = LMe.FSelectedRecordInvoice.stockId,
            LGrandTotal = 0;

        LArrProducts.forEach(function (p_objRecord) {

            if (p_objRecord.stockId === LStockId) {

                return true;
            }//if..

            LGrandTotal += (p_objRecord.costPrice * p_objRecord.qty);

            LArrSelectedProducts.push(p_objRecord);
        });

        LMe.FGrandTotal = LGrandTotal;
        LMe.props.SetGrandTotal(LMe.FGrandTotal);

        LMe.FSelectedRecordInvoice = null;

        LMe.setState({
            SArrProducts: LArrSelectedProducts || []
        });
    }

    GetProductJson() {
        /**
         * @method GetProductJson
         * This method will return the product json
         * 
         * @public
         */
        var LMe = this,
            LResProducts = [],
            LObj = {},
            LArrProducts;

        LArrProducts = LMe.state.SArrProducts || [];

        LArrProducts.forEach(function (p_objRecord) {

            LObj = {};

            LObj.productId = p_objRecord.productId;
            LObj.stockId = p_objRecord.stockId;

            LObj.gst = p_objRecord.gst;

            LObj.price = p_objRecord.costPrice;
            LObj.qty = p_objRecord.qty;

            LResProducts.push(LObj);
        });

        return LResProducts;
    }

    pvtGetDialog() {
        var LMe = this;

        if (LMe.state.IsDialogOpen === false) {
            return <></>;
        }

        return (
            <TDialog
                IsDialogOpen={LMe.state.IsDialogOpen}
                OnDialogClose={() => LMe.setState({ IsDialogOpen: false })}
                DialogContent={LMe.pvtGetDialogContent()}
                DialogActions={LMe.pvtGetDialogAction()}
                DialogHeader={'Select Product'}
                DialogLoading={false}
                IsWindow={true}
            />
        );
    }

    pvtGetToolBar() {
        var LMe = this;

        return <div style={{ margin: '20px 20px 0 20px' }} className="tsHBox" >
            {/* <div className="flex1"></div> */}
            <Box variant="outline">

                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    disableElevation
                    onClick={() => {
                        LMe.setState({ IsDialogOpen: true });
                    }}
                >
                    Add Product
                </Button>
                <Button
                    size="small"
                    style={{ margin: '0 0 0 5px' }}
                    variant="outlined"
                    color="primary"
                    disableElevation
                    onClick={() => {
                        LMe.pvtHandleOnDeleteButtonClick();
                    }}
                    startIcon={<DeleteIcon />}
                >
                    Delete Product
                </Button>
            </Box>
        </div>;
    }

    pvtGetReadOnlyComponent() {
        /**
         * @method pvtGetReadOnlyComponent
         * This method will return the read only component
         */
        var LMe = this,
            LColumns = LMe.state.GridColumns || [],
            LRows = LMe.state.SArrProducts || [],
            LColumnUI = [],
            LRowUI = [],
            LRow;

        LColumns.forEach(function (p_objRecord, p_index) {

            LColumnUI.push(
                <th className="tsInvoiceViewTableTh" key={'col' + p_index}>
                    {p_objRecord.headerName}
                </th>
            );
        });

        LRows.forEach(function (p_objRecord, p_intRowIndex) {

            LRow = [];

            LColumns.forEach(function (p_objColRecord, p_intColIndex) {

                if (p_objColRecord.field === 'total') {
                    p_objRecord[p_objColRecord.field] = 'Rs.' + p_objRecord.qty * p_objRecord.costPrice;
                }

                LRow.push(
                    <td className="tsInvoiceViewTableTd" key={'coltd' + p_intColIndex}>
                        {p_objRecord[p_objColRecord.field]}
                    </td>
                );
            });

            LRowUI.push(
                <tr key={'tblrow' + p_intRowIndex}>
                    {LRow}
                </tr>
            );
        });

        return <div style={{
            overflowX: 'auto'
        }}>
            <table className="tsInvoiceViewTable">
                <thead>
                    <tr key={'throw'}>
                        {LColumnUI}
                    </tr>
                </thead>
                <tbody>
                    {LRowUI}
                </tbody>
            </table>
        </div>;
    }


    pvtHandleOnRowClick(p_objSelectedRecord) {
        /**
         * INTENT: This function will set the selected row record as a class level.
         *
         * @param: Selected Record
         * @return: Nothing
         */
        var LMe = this;

        LMe.FSelectedRecordInvoice = p_objSelectedRecord;
    }

    render() {
        var LMe = this;

        if (LMe.props.PIsReadOnlyMode === true) {
            return LMe.pvtGetReadOnlyComponent();
        }

        return (
            <>
                {LMe.pvtGetToolBar()}

                <DataGrid
                    columns={LMe.state.GridColumns || []}
                    rows={LMe.state.SArrProducts || []}
                    pagination
                    csvOptions={{ allColumns: true }}
                    hideFooter
                    ref={LMe.FDataGrid}
                    density={'compact'}
                    style={{ margin: '10px 20px 0 20px', minHeight: 200 }}
                    // onCellEditCommit={(p_objParams) => {

                    //     var LOldArrProducts = LMe.state.SArrProducts,
                    //         LUpdateProduct = [],
                    //         LGrandTotal = 0,
                    //         LObj;

                    //     LOldArrProducts.forEach(function (p_objRecord) {

                    //         LObj = { ...p_objRecord };

                    //         //If edited cell found then update in state
                    //         if (LObj.id === p_objParams.id) {

                    //             LObj[p_objParams.field] = p_objParams.value;
                    //         }//if..

                    //         //If qty is less than 0
                    //         if (LObj.qty <= 0) {
                    //             LObj.qty = 1;
                    //         }

                    //         //Check quantity
                    //         if (LObj.qty > LObj.rQty) {

                    //             LObj.qty = LObj.rQty;
                    //             LMe.FSnackMsg = 'You have only ' + LObj.qty + ' items left in stock.';
                    //             LMe.setState({ IsSnackOn: true });
                    //         }


                    //         //Adding sum
                    //         LGrandTotal += LObj.qty * LObj.costPrice;
                    //         LUpdateProduct.push(LObj);
                    //     });

                    //     LMe.FGrandTotal = LGrandTotal;
                    //     //Update prop
                    //     LMe.props.SetGrandTotal(LGrandTotal);

                    //     LMe.setState({ SArrProducts: LUpdateProduct });
                    // }}
                    onRowClick={(e) => LMe.pvtHandleOnRowClick(e.row)}
                />
                {/* Window */}
                {LMe.pvtGetDialog()}

                <TDialog
                    IsDialogOpen={LMe.state.IsAlertDialogOpen}
                    OnDialogClose={() => LMe.setState({ IsAlertDialogOpen: false })}
                    DialogContent={LMe.FWarningText || ''}
                    DialogActions={<></>}
                    DialogHeader={'Warning'}
                    IsWindow={false}
                />

                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    open={LMe.state.IsSnackOn}
                    onClose={() => LMe.setState({ IsSnackOn: false })}
                    message={LMe.FSnackMsg}
                    key={'verticalhorizontalSnack'}
                />
            </>
        );
    }
}

export default tsfrmProductSelectionCntr;