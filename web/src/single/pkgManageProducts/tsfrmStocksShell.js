import React, { Component } from 'react';
import {
    Box,
    Toolbar,
    Button,
    IconButton,
    Tooltip
} from '@material-ui/core';
import { BaseUrl, isEmpty, isObjEmpty, tsGetProjectId } from '../../tsclsGenUtils';
import BallotIcon from '@material-ui/icons/Ballot';
import RefreshIcon from '@material-ui/icons/Refresh';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import TStockDialog from './tsdlgStocks';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import TDialog from '../../reusable/tsclsDialog';
import { GenConstants } from '../../tsclsGenConstants';
import TInvoiceType from '../../reusable/tscmpInvoiceType';
import TProductSelection from '../../reusable/tscmpProductSelection';

class tsfrmStocksShell extends Component {
    /**
     * @props: moduleInfo,
     * @returns
     */

    constructor(props) {
        super(props);

        var LMe = this;

        LMe.state = {
            FetchedData: null,
            CanInvokeDialogOpen: false,
            StockRecord: {},
            IsAlertDialogOpen: false,
            IsCnfrmDialogOpen: false,
            ColumnFields: LMe.pvtGetGridColumn(),
            SInvoiceType: '',
            SProduct: {}
        };

        LMe.F_callBackOnCnfrmTrue = null;

        LMe.FDataGrid = React.createRef();
    }

    componentDidMount() {
        /**
         * @method componentDidMount
         * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
         * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
         *
         */
        var LMe = this;

        LMe.pvtRefresh();
    }

    pvtRefresh() {
        /**
         * @method pvtRefresh
         * This function will refresh the grid
         *
         * @returns: Nothing
         */
        var LMe = this,
            LStateObj = {
                FetchedData: null
            };

        LMe.FSelectedRecord = null;

        if (LMe.props.IsSelectMode === true) {

            LStateObj = {
                FetchedData: null,
                //PInvoiceType: is for when editor opens in dialog in Invoice: Product Selection
                SInvoiceType: LMe.props.PInvoiceType || GenConstants().PESTICIDE_ACT_CODE
            };
        }//if..

        if (isEmpty(LMe.props.PProductId) === false) {

            isObjEmpty(LMe.state.SProduct) === true ? LStateObj.SProduct = { id: LMe.props.PProductId } : LStateObj.SProduct = LMe.state.SProduct;

            LStateObj.SInvoiceType = LMe.props.PInvoiceType;
        }//if..

        LMe.setState(LStateObj);

        LMe.pvtFetchStocksFields(LMe.props.PInvoiceType);
    }

    pvtFetchStocksFields(p_actCodeInvoiceType) {
        /**
         * @method pvtFetchStocksFields
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var LMe = this,
            LUrl,
            LInvoiceType = p_actCodeInvoiceType || LMe.state.SInvoiceType;

        if (isEmpty(LInvoiceType) === true) {

            return;
        }//if..

        LUrl = BaseUrl() + 'customFields/type/' + GenConstants().STOCK_CSTM_FIELDS + '/' + LInvoiceType;

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
                    if (responseJson.status === 'error') {
                        LMe.setState({
                            ColumnFields: [],
                        });
                        return;
                    }

                    LMe.setState({
                        ColumnFields: LMe.pvtGetGridColumn(responseJson)
                    })
                    LMe.pvtFetchStocks(LMe.state.SProduct.id);
                },
                (error) => {
                    LMe.setState({
                        ColumnFields: [],
                    });
                }
            );
    }

    pvtFetchStocks(p_intProductId) {
        /**
         * @method pvtFetchStocks
         * This function will fetch the list which will visible in side panel
         *
         * @returns: Array of objects of list items with tooltips
         */
        var LMe = this,
            LUrl,
            // LProductId = p_intProductId || LMe.state.SProduct.id,
            LProductId = p_intProductId,
            LStateObj;

        if (isEmpty(LProductId)) {

            LStateObj = {
                FetchedData: []
            };

            LMe.setState(LStateObj);
            return;
        }//if..

        LUrl = BaseUrl() + 'stocks/byproductids/' + LProductId;

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
                    if (responseJson.success === false) {
                        LMe.setState({
                            FetchedData: [],
                        });
                        return;
                    }

                    LMe.setState({
                        FetchedData: responseJson
                    });
                },
                (error) => {
                    LMe.setState({
                        FetchedData: [],
                    });
                }
            );
    }

    pvtGetGridColumn(p_arrFields) {
        /**
         * @method pvtGetGridColumn
         * This method will return the grid column json
         */

        var //LMe = this,
            LArrColumn = [],
            LObj = {};

        LArrColumn = [
            // {
            //     field: 'stockName',
            //     headerName: 'Particulars',
            //     headerClassName: 'tsGridHeader',
            //     flex: 1,
            //     color: 'primary',
            //     sort: 'asc',
            //     fieldType: GenConstants().SYSTEM_FIELD,
            //     // isRequired: true,
            //     isField: false,
            //     hide: true
            // },
            {
                field: 'qty',//Remaining Qty
                headerName: 'Remaining Quantity',
                headerClassName: 'tsGridHeader',
                minWidth: 210,
                flex: 1,
                color: 'primary',
                fieldType: GenConstants().SYSTEM_FIELD,
                isRequired: true,
                isField: false
            },
            {
                field: 'tqty',//Total Qty
                headerName: 'Total Purshased Quantity',
                headerClassName: 'tsGridHeader',
                minWidth: 240,
                flex: 1,
                color: 'primary',
                fieldType: GenConstants().FIELD_NUMBER,
                isRequired: true,
            },
            {
                field: 'costPrice',
                headerName: 'Cost Price',
                headerClassName: 'tsGridHeader',
                minWidth: 200,
                color: 'primary',
                fieldType: GenConstants().FIELD_NUMBER,
                isRequired: true,
                hide: true
            },
            {
                field: 'sellingPrice',
                headerName: 'Selling Price',
                headerClassName: 'tsGridHeader',
                minWidth: 200,
                color: 'primary',
                fieldType: GenConstants().FIELD_NUMBER,
                isRequired: true
            }
        ];

        //Getting custom fields
        if (isEmpty(p_arrFields) === false) {

            //Convert it into array
            p_arrFields = p_arrFields || [];

            p_arrFields.forEach(function (p_objRecord) {

                if (p_objRecord.isSystemField === true) {

                    return true;
                }//if..

                LObj = {};

                LObj['headerName'] = p_objRecord.fieldName;

                //Setting column name
                LObj['field'] = p_objRecord.columnName;
                LObj['headerClassName'] = 'tsGridHeader';
                LObj['minWidth'] = 200;

                LObj['fieldType'] = p_objRecord.fieldType;
                LObj['isRequired'] = p_objRecord.isRequired === 1;

                LArrColumn.push(LObj);
            });

        }//if..

        return LArrColumn;
    }

    pvtLoadDialog() {
        /**
         * @method pvtLoadDialog
         * This method will loads the Dialog
         */
        var LMe = this;

        if (LMe.state.CanInvokeDialogOpen === true) {

            return (
                <TStockDialog
                    IsDialogOpen={LMe.state.CanInvokeDialogOpen}
                    OnDialogClose={() => LMe.setState({ CanInvokeDialogOpen: false })}
                    UpdateStockStore={(p_objUser) =>
                        LMe.UpdateStockStore(p_objUser)
                    }
                    StockRecord={LMe.state.StockRecord || {}}
                    ColumnFields={LMe.state.ColumnFields || []}
                    InvoiceType={LMe.state.SInvoiceType}
                    ProductId={LMe.state.SProduct.id}
                    ProductDispName={LMe.state.SProduct.productName}
                />
            );
        }

        return (<></>);
    }

    pvtEditStock(p_objParam) {
        /**
         * @method pvtEditStock
         * This method will invoke the dialog for edit mode edit the user
         */

        if (isEmpty(p_objParam) === true) {
            return;
        } ///if..

        var LMe = this,
            LRecord = p_objParam;

        LMe.setState({
            CanInvokeDialogOpen: true,
            StockRecord: LRecord
        });
    }

    UpdateStockStore(p_objResponseUser) {
        /**
         * @method UpdateStockStore
         * This method will update store
         *
         * @public
         * @param p_objResponseUser: Response User object
         */
        var LMe = this,
            LArrFetchedData,
            LArrResponse = [],
            LIsNewRecord = true;

        if (isEmpty(p_objResponseUser) === true) {
            return;
        } //if..

        LArrFetchedData = LMe.state.FetchedData || [];

        LArrFetchedData.forEach(function (p_objRecord) {
            //Update Record if exists
            if (p_objRecord.id === p_objResponseUser.id) {
                // p_objResponseUser.id = p_objResponseUser.id;
                LArrResponse.push(p_objResponseUser);
                LIsNewRecord = false;
                return true; //continue
            } //if..

            LArrResponse.push(p_objRecord);
        }); //forEach...

        if (LIsNewRecord === true) {
            // p_objResponseUser.id = p_objResponseUser.id;
            LArrResponse.push(p_objResponseUser);
        } //if..

        //Directly select that stock
        if (LMe.props.IsSelectMode === true) {

            var LObj = {
                stock: p_objResponseUser,
                product: LMe.state.SProduct,
                stockColumns: LMe.state.ColumnFields
            };
            LMe.props.HandleOnSelect(LObj);
        }

        // Update state.
        LMe.setState({ FetchedData: LArrResponse });
    }

    pvtHandleOnEditButtonClick() {
        var LMe = this;

        if (isEmpty(LMe.FSelectedRecord) === true) {
            LMe.FWarningText = 'Select a Stock record and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..

        LMe.pvtEditStock(LMe.FSelectedRecord);
    }

    pvtHandleOnDeleteButtonClick() {
        var LMe = this;

        if (isEmpty(LMe.FSelectedRecord) === true) {
            LMe.FWarningText = 'Select a record and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..

        LMe.FCnfrmText = "Are you sure want to delete this stock?";
        LMe.F_callBackOnCnfrmTrue = LMe.pvtDelete;
        LMe.setState({ IsCnfrmDialogOpen: true });
    }

    pvtDelete() {
        /**
         *@method pvtDelete
         * This method will delete
         */
        var LMe = this,
            LRequestOptions,
            LArrFetchedData = [],
            LArrResponse = [],
            LUrl;

        if (isEmpty(LMe.FSelectedRecord) === true) {
            LMe.FWarningText = 'Select a Stock and try again.';
            LMe.setState({ IsAlertDialogOpen: true });
            return;
        } //if..

        // eslint-disable-next-line no-useless-concat
        LUrl = BaseUrl() + 'stocks' + '/' + LMe.FSelectedRecord.id;

        LArrFetchedData = LMe.state.FetchedData || [];
        // This will start the loading
        LMe.setState({ FetchedData: [] });

        LRequestOptions = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'projectid': tsGetProjectId()
            },
            body: JSON.stringify({}),
        };

        // fire command
        fetch(LUrl, LRequestOptions)
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    if (responseJson.success === false) {
                        LMe.FWarningText = responseJson.message;

                        LMe.setState({
                            FetchedData: LArrFetchedData,
                            IsCnfrmDialogOpen: false,
                            IsAlertDialogOpen: true
                        });

                        return;
                    }
                    LMe.FSelectedRecord = null;

                    LArrFetchedData.forEach(function (p_objRecord) {
                        //Record if exists
                        if (p_objRecord.id === responseJson.id) {
                            //remove deleted record
                            return true; //continue
                        } //if..

                        LArrResponse.push(p_objRecord);
                    }); //forEach...

                    // Update state.
                    LMe.setState({ FetchedData: LArrResponse, IsCnfrmDialogOpen: false });
                },
                (error) => {
                    this.setState({
                        FetchedData: [],
                        IsCnfrmDialogOpen: false
                    });
                }
            );
    }

    pvtHandleOnRowClick(p_objSelectedRecord) {
        /**
         * INTENT: This function will set the selected row record as a class level.
         *
         * @param: Selected Record
         * @return: Nothing
         */
        var LMe = this;

        LMe.FSelectedRecord = p_objSelectedRecord;

        if (LMe.props.IsSelectMode === true) {

            var LObj = {
                stock: p_objSelectedRecord,
                product: LMe.state.SProduct,
                stockColumns: LMe.state.ColumnFields
            };

            LMe.props.SelectedRecord(LObj);
        }//if..
    }

    pvtGetWarningDlgAction(p_canShowWarningIcon) {
        var LMe = this;
        if (p_canShowWarningIcon === true) {
            return (
                <>
                    <Button
                        onClick={() => {

                            if (isEmpty(LMe.F_callBackOnCnfrmTrue) === false) {

                                LMe.F_callBackOnCnfrmTrue();
                            }//if..
                        }}
                        color="primary"
                        variant="contained"
                        size="small"
                    >
                        Confirm
                    </Button>
                </>
            );
        }

        return <></>;
    }

    pvtHandleOnInvoiceTypeChange(p_actCodeInvoiceType) {
        /**
         * @method pvtHandleOnInvoiceTypeChange
         * 
         * @param {p_actCodeInvoiceType}: Action code for invoice type
         */
        var LMe = this;

        LMe.setState({
            SInvoiceType: p_actCodeInvoiceType,
            SProduct: {},
            FetchedData: [],
            ColumnFields: []
        });

        LMe.FSelectedRecord = null;
        LMe.pvtFetchStocksFields(p_actCodeInvoiceType);
    }

    pvtHandleOnProductChange(p_objRecord) {
        /**
         * @method pvtHandleOnProductChange
         * 
         * @param {p_actCodeInvoiceType}: Action code for invoice type
         */
        var LMe = this;

        LMe.setState({ SProduct: p_objRecord });

        LMe.FSelectedRecord = null;
        LMe.pvtFetchStocks(p_objRecord.id);
    }

    pvtGetHeader() {
        var LMe = this;

        if (LMe.props.IsSelectMode === true) {
            return <></>;
        }//if..

        return (<Box component="div" display="flex" px={3} pb={2}>
            {/* Module Icon */}
            <div style={{ margin: '20px 6px 0 0' }}>
                <BallotIcon />
            </div>
            <div style={{ margin: '18px 6px 0 0' }}>
                {/* Module Title */}
                <div style={{ fontSize: '20px' }}> Manage Stocks </div>

                {/* Module Description */}
                <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
                    Create new stock, edit stock details, remove
                    stock, etc.
                </Box>
            </div>
        </Box>);
    }

    pvtGetInvoiceType() {
        var LMe = this;

        if (LMe.props.IsSelectMode === true) {
            return <></>;
        }

        return (
            <TInvoiceType
                Value={LMe.state.SInvoiceType}
                OnChange={p_value => LMe.pvtHandleOnInvoiceTypeChange(p_value)}
                EmptyText={'Stock Type'}
            ></TInvoiceType>);
    }

    render() {
        var LMe = this;

        return (
            <div
                className="flex1 tsVBox"
                style={{
                    margin: '10px 0 10px 0',
                    minWidth: 800
                }}
            >
                {LMe.pvtGetHeader()}
                <Toolbar
                    style={{ margin: '0 0 0 0px' }}
                    component="div"
                    variant="dense"
                >

                    {LMe.pvtGetInvoiceType()}

                    <div style={{ margin: '0 0 0 20px' }}>
                        <TProductSelection
                            Value={LMe.state.SProduct}
                            InvoiceType={LMe.state.SInvoiceType}
                            OnChange={p_objRecord => LMe.pvtHandleOnProductChange(p_objRecord)}
                            EmptyText={'Select Product'}
                        />
                    </div>

                    <Button
                        size="small"
                        style={{ margin: '0 0 0 20px' }}
                        variant="contained"
                        color="primary"
                        disableElevation
                        onClick={() => {
                            if (isEmpty(LMe.state.SProduct.id) === true) {
                                LMe.FWarningText = 'Select a Product and try again.';
                                LMe.setState({ IsAlertDialogOpen: true });
                                return;
                            } //if..
                            LMe.setState({
                                CanInvokeDialogOpen: true,
                                StockRecord: {},
                            })
                        }}
                    >
                        Add Stock
                    </Button>
                    <Button
                        size="small"
                        style={{ margin: '0 0 0 5px' }}
                        variant="outlined"
                        color="primary"
                        disableElevation
                        onClick={() => {
                            LMe.pvtHandleOnEditButtonClick();
                        }}
                        startIcon={<EditIcon />}
                    >
                        Edit
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
                        Delete
                    </Button>
                    <IconButton
                        style={{ margin: '0 5px 0 5px' }}
                        aria-label="Refresh"
                        onClick={() => LMe.pvtRefresh()}
                    >
                        <Tooltip title="Refresh">
                            <RefreshIcon />
                        </Tooltip>
                    </IconButton>
                </Toolbar>
                <div
                    style={{ margin: '5px 20px 20px 20px' }}
                    className="flex1"
                >
                    <DataGrid
                        ref={LMe.FDataGrid}
                        style={{ minHeight: '400px' }}
                        columns={LMe.state.ColumnFields}
                        rows={LMe.state.FetchedData || []}
                        pagination
                        csvOptions={{ allColumns: true }}
                        loading={LMe.state.FetchedData === null ? true : false}
                        components={{
                            Toolbar: GridToolbar,
                        }}
                        density={'compact'}
                        onCellDoubleClick={(params) => {
                            if (LMe.props.IsSelectMode === true) {

                                var LObj = {
                                    stock: params.row,
                                    product: LMe.state.SProduct,
                                    stockColumns: LMe.state.ColumnFields
                                };
                                LMe.props.HandleOnSelect(LObj);
                            }
                            else {

                                LMe.pvtEditStock(params.row)
                            }
                        }}
                        onRowClick={(e) => LMe.pvtHandleOnRowClick(e.row)}
                    />
                </div>
                {LMe.pvtLoadDialog()}

                <TDialog
                    IsDialogOpen={LMe.state.IsAlertDialogOpen}
                    OnDialogClose={() => LMe.setState({ IsAlertDialogOpen: false })}
                    DialogContent={LMe.FWarningText || ''}
                    DialogActions={<></>}
                    DialogHeader={'Warning'}
                    IsWindow={false}
                />

                <TDialog
                    IsDialogOpen={LMe.state.IsCnfrmDialogOpen}
                    OnDialogClose={() => LMe.setState({ IsCnfrmDialogOpen: false })}
                    DialogContent={LMe.FCnfrmText || ''}
                    DialogActions={LMe.pvtGetWarningDlgAction(true)}
                    DialogHeader={'Confirm'}
                    IsWindow={false}
                />
            </div>
        );
    }
}

export default tsfrmStocksShell;
