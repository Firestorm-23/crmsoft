import React, { Component } from 'react';
import {
   Box,
   Toolbar,
   Button,
   IconButton,
   Tooltip, Input,
   InputAdornment
} from '@material-ui/core';
import { BaseUrl, isEmpty, tsGetDisplayTextByTaxType, tsGetProjectId } from '../../tsclsGenUtils';
import BallotIcon from '@material-ui/icons/Ballot';
import RefreshIcon from '@material-ui/icons/Refresh';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import TProductDialog from './tsdlgProducts';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import TDialog from '../../reusable/tsclsDialog';
import { GenConstants } from '../../tsclsGenConstants';
import TInvoiceType from '../../reusable/tscmpInvoiceType';
import { Search } from '@material-ui/icons';

class tsfrmProductsGrid extends Component {
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
         ProductRecord: {},
         IsAlertDialogOpen: false,
         IsCnfrmDialogOpen: false,
         ColumnFields: LMe.pvtGetGridColumn(),
         SInvoiceType: ''
      };

      LMe.FGridRef = React.createRef();
      LMe.FSearchField = React.createRef();

      LMe.F_callBackOnCnfrmTrue = null;
   }

   componentDidMount() {
      /**
       * @method componentDidMount
       * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
       * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
       *
       */
      // var LMe = this;

      // LMe.pvtFetchProductsFields();
   }

   pvtRefresh() {
      /**
       * @method pvtRefresh
       * This function will refresh the grid
       *
       * @returns: Nothing
       */
      var LMe = this;

      LMe.pvtFetchProductsFields();

      LMe.FSelectedRecord = null;

      LMe.pvtResetSearchField();

      LMe.setState({
         FetchedData: null,
      });
   }

   pvtResetSearchField() {
      var LMe = this;

      if (LMe.FSearchField && LMe.FSearchField.current && LMe.FSearchField.current.firstElementChild) {

         LMe.FSearchField.current.firstElementChild.value = '';
      }//if..
   }

   pvtFetchProductsFields(p_actCodeInvoiceType) {
      /**
       * @method pvtFetchProductsFields
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

      LUrl = BaseUrl() + 'customFields/type/' + GenConstants().PRODUCT_CSTM_FIELDS + '/' + LInvoiceType;

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
               }

               LMe.pvtFetchProducts(responseJson, LInvoiceType);
            },
            (error) => {
               this.setState({
                  FetchedData: [],
               });
            }
         );
   }

   pvtFetchProducts(p_arrFields, p_strInvoiceType) {
      /**
       * @method pvtFetchProducts
       * This function will fetch the list which will visible in side panel
       *
       * @returns: Array of objects of list items with tooltips
       */
      var LMe = this,
         LUrl;

      LUrl = BaseUrl() + 'products/type/' + p_strInvoiceType;

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
                     FetchedData: [],
                  });
                  return;
               }//if..

               LMe.FAllFetectedRecords = responseJson;

               LMe.setState({
                  FetchedData: responseJson,
                  ColumnFields: LMe.pvtGetGridColumn(p_arrFields) || [],
               });
            },
            (error) => {
               this.setState({
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
         {
            field: 'productName',
            headerName: 'Name',
            headerClassName: 'tsGridHeader',
            minWidth: 200,
            flex: 1,
            color: 'primary',
            sort: 'asc',
            fieldType: GenConstants().SYSTEM_FIELD,
            isRequired: true
         },
         {
            field: 'qty',
            headerName: 'Quantity',
            headerClassName: 'tsGridHeader',
            // flex: 1,
            width: 150,
            color: 'primary',
            fieldType: GenConstants().SYSTEM_FIELD,
            isRequired: true,
            isField: false
         },
         {
            field: 'hsn',
            headerName: 'HSN Code',
            headerClassName: 'tsGridHeader',
            // flex: 1,
            width: 150,
            color: 'primary',
            fieldType: GenConstants().SYSTEM_FIELD,
            isRequired: true,
            isField: true
         },
         {
            field: 'gst',
            headerName: 'GST',
            headerClassName: 'tsGridHeader',
            // flex: 1,
            width: 150,
            color: 'primary',
            // fieldType: GenConstants().GST_FIELD,
            fieldType: GenConstants().FIELD_NUMBER,
            isRequired: true,
            isField: true
         },
         {
            field: 'gstType',
            headerName: 'GST Type',
            headerClassName: 'tsGridHeader',
            width: 150,
            color: 'primary',
            fieldType: GenConstants().GST_FIELD,
            isRequired: true,
            isField: true,
            renderCell: (params) => (
               <span>
                  {tsGetDisplayTextByTaxType(params.value)}
               </span>
            ),
         },
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
            <TProductDialog
               IsDialogOpen={LMe.state.CanInvokeDialogOpen}
               OnDialogClose={() => LMe.setState({ CanInvokeDialogOpen: false })}
               UpdateProductStore={(p_objUser) =>
                  LMe.UpdateProductStore(p_objUser)
               }
               ProductRecord={LMe.state.ProductRecord || {}}
               ColumnFields={LMe.state.ColumnFields || []}
               InvoiceType={LMe.state.SInvoiceType}
            />
         );
      }

      return (<></>);
   }

   pvtEditProduct(p_objParam) {
      /**
       * @method pvtEditProduct
       * This method will invoke the dialog for edit mode edit the user
       */

      if (isEmpty(p_objParam) === true) {
         return;
      } ///if..

      var LMe = this,
         LRecord = p_objParam;

      LMe.setState({
         CanInvokeDialogOpen: true,
         ProductRecord: LRecord
      });
   }

   UpdateProductStore(p_objResponseUser) {
      /**
       * @method UpdateProductStore
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

      LArrFetchedData = LMe.FAllFetectedRecords || [];

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

      LMe.FAllFetectedRecords = LArrResponse;
      // Update state.
      // LMe.setState({ FetchedData: LArrResponse });
      LMe.pvtFilterOnSearch();
   }

   pvtHandleOnEditButtonClick() {
      var LMe = this;

      if (isEmpty(LMe.FSelectedRecord) === true) {
         LMe.FWarningText = 'Select a Product and try again.';
         LMe.setState({ IsAlertDialogOpen: true });
         return;
      } //if..

      LMe.pvtEditProduct(LMe.FSelectedRecord);
   }

   pvtHandleOnDeleteButtonClick() {
      var LMe = this;

      if (isEmpty(LMe.FSelectedRecord) === true) {
         LMe.FWarningText = 'Select a Product and try again.';
         LMe.setState({ IsAlertDialogOpen: true });
         return;
      } //if..

      LMe.FCnfrmText = "Are you sure want to delete this product?";
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
         LMe.FWarningText = 'Select a Product and try again.';
         LMe.setState({ IsAlertDialogOpen: true });
         return;
      } //if..

      // eslint-disable-next-line no-useless-concat
      LUrl = BaseUrl() + 'products' + '/' + LMe.FSelectedRecord.id;

      LArrFetchedData = LMe.FAllFetectedRecords || [];
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

               LMe.FAllFetectedRecords = LArrResponse;
               // Update state.
               LMe.setState({
                  // FetchedData: LArrResponse,
                  IsCnfrmDialogOpen: false
               });

               LMe.pvtFilterOnSearch();
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

      LMe.setState({ SInvoiceType: p_actCodeInvoiceType });

      LMe.FSelectedRecord = null;
      LMe.pvtResetSearchField();
      LMe.pvtFetchProductsFields(p_actCodeInvoiceType);
   }

   pvtFilterOnSearch(p_searchText) {
      /**
       * @method pvtFilterOnSearch
       * This method will filter the grid record
       */
      var LMe = this,
         LCustomers = LMe.FAllFetectedRecords || [],
         LCstName;

      p_searchText = p_searchText || (LMe.FSearchField.current && LMe.FSearchField.current.firstElementChild && LMe.FSearchField.current.firstElementChild.value) || '';

      if (isEmpty(p_searchText) === true) {

         LMe.setState({
            FetchedData: LMe.FAllFetectedRecords
         });
         return;
      }//if..
      p_searchText = p_searchText.toLowerCase();

      var LFilteredRecords = LCustomers.filter((p_objCustomer) => {

         LCstName = p_objCustomer.productName || '';
         LCstName = LCstName.toLowerCase();
         //partial matches
         return LCstName.includes(p_searchText);
      });

      LMe.setState({
         FetchedData: LFilteredRecords
      });
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
                  <BallotIcon />
               </div>
               <div style={{ margin: '18px 6px 0 0' }}>
                  {/* Module Title */}
                  <div style={{ fontSize: '20px' }}> Manage Products </div>

                  {/* Module Description */}
                  <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
                     Create new product, edit product details, remove
                     product, etc.
                  </Box>
               </div>
            </Box>
            <Toolbar
               style={{ margin: '0 0 0 0px' }}
               component="div"
               variant="dense"
            >
               <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  disableElevation
                  onClick={() =>
                     LMe.setState({
                        CanInvokeDialogOpen: true,
                        ProductRecord: {},
                     })
                  }
               >
                  New Product
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
                  Edit Product
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
               <IconButton
                  style={{ margin: '0 5px 0 5px' }}
                  aria-label="Refresh"
                  onClick={() => LMe.pvtRefresh()}
               >
                  <Tooltip title="Refresh">
                     <RefreshIcon />
                  </Tooltip>
               </IconButton>

               <TInvoiceType
                  Value={LMe.state.SInvoiceType}
                  OnChange={p_value => LMe.pvtHandleOnInvoiceTypeChange(p_value)}
                  EmptyText={'Product Type'}
               ></TInvoiceType>

               <div className="flex1"></div>

               <Input label="Search" placeholder="Search Products"
                  onChange={(e) => {
                     LMe.pvtFilterOnSearch(e.currentTarget.value)
                  }}
                  ref={LMe.FSearchField}
                  type="text"
                  margin="dense"
                  style={{ margin: '-1px 0 0 5px' }}
                  endAdornment={
                     <InputAdornment position="start">
                        <Search />
                     </InputAdornment>
                  }
               />

            </Toolbar>
            <div
               style={{ margin: '5px 20px 20px 20px' }}
               className="flex1"
            >
               <DataGrid
                  columns={LMe.state.ColumnFields}
                  rows={LMe.state.FetchedData || []}
                  ref={LMe.FGridRef}
                  // rowHeight={50}
                  pagination
                  // pageSize={10}
                  csvOptions={{ allColumns: true }}
                  loading={LMe.state.FetchedData === null ? true : false}
                  // sortModel={LMe.state.SortModel}
                  // onSortModelChange={(model) => LMe.setState({SortModel: model})}
                  components={{
                     Toolbar: GridToolbar,
                  }}
                  density={'compact'}
                  onCellDoubleClick={(params) =>
                     LMe.pvtEditProduct(params.row)
                  }
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

export default tsfrmProductsGrid;
