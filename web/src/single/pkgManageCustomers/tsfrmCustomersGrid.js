import React, { Component } from 'react';
import {
   Box,
   Toolbar,
   Button,
   IconButton,
   Tooltip, Input,
   InputAdornment
} from '@material-ui/core';
import { BaseUrl, isEmpty, tsGetProjectId } from '../../tsclsGenUtils';
import PeopleSharpIcon from '@material-ui/icons/PeopleSharp';
import RefreshIcon from '@material-ui/icons/Refresh';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import TCustomerDialog from './tsdlgCustomers';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import TDialog from '../../reusable/tsclsDialog';
import { GenConstants } from '../../tsclsGenConstants';
import { Search } from '@material-ui/icons';

class tsfrmCustomersGrid extends Component {
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
         CustomerRecord: {},
         IsAlertDialogOpen: false,
         IsCnfrmDialogOpen: false,
         ColumnFields: LMe.pvtGetGridColumn(),
         SortingModel: [{
            field: 'cstName',
            sort: 'asc',
         }]
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
      var LMe = this;

      LMe.pvtFetchCustomersFields();
   }

   pvtRefresh() {
      /**
       * @method pvtRefresh
       * This function will refresh the grid
       *
       * @returns: Nothing
       */
      var LMe = this;

      LMe.pvtFetchCustomersFields();

      LMe.FSelectedRecord = null;

      if (LMe.FSearchField && LMe.FSearchField.current && LMe.FSearchField.current.firstElementChild) {
         LMe.FSearchField.current.firstElementChild.value = '';
      }

      LMe.setState({
         FetchedData: null,
      });
   }

   pvtFetchCustomersFields() {
      /**
       * @method pvtFetchCustomersFields
       * This function will fetch the list which will visible in side panel
       *
       * @returns: Array of objects of list items with tooltips
       */
      var LMe = this,
         LUrl;

      LUrl = BaseUrl() + 'customFields/type/' + GenConstants().CUSTOMER_CSTM_FIELDS;

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

               // responseJson.forEach(function (p_objRecord) {
               //    p_objRecord.id = p_objRecord.id;
               // });

               LMe.pvtFetchCustomers(responseJson);
            },
            (error) => {
               this.setState({
                  FetchedData: [],
               });
            }
         );
   }

   pvtFetchCustomers(p_arrCstFields) {
      /**
       * @method pvtFetchCustomers
       * This function will fetch the list which will visible in side panel
       *
       * @returns: Array of objects of list items with tooltips
       */
      var LMe = this,
         LUrl;

      LUrl = BaseUrl() + 'customers';

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
               }

               // responseJson.forEach(function (p_objRecord) {
               //    p_objRecord.id = p_objRecord.id;
               // });

               LMe.FAllFetectedRecords = responseJson;
               LMe.setState({
                  FetchedData: responseJson,
                  ColumnFields: LMe.pvtGetGridColumn(p_arrCstFields) || [],
               });
            },
            (error) => {
               this.setState({
                  FetchedData: [],
               });
            }
         );
   }

   pvtGetGridColumn(p_arrCstFields) {
      /**
       * @method pvtGetGridColumn
       * This method will return the grid column json
       */

      var //LMe = this,
         LArrColumn = [],
         LObj = {};

      LArrColumn = [
         {
            field: 'cstName',
            headerName: 'Name',
            headerClassName: 'tsGridHeader',
            minWidth: 200,
            flex: 1,
            color: 'primary',
            sort: 'ASC',
            fieldType: GenConstants().SYSTEM_FIELD,
            isRequired: true
         },
         {
            field: 'cstBalance',
            headerName: 'Balance',
            headerClassName: 'tsGridHeader',
            color: 'primary',
            minWidth: 150,
            fieldType: GenConstants().SYSTEM_FIELD,
            isField: false,
            renderCell: (params) => {
               var LValue = params.value;

               if (LValue > 0) {

                  return LValue + ' Cr';
               }
               else if (LValue < 0) {

                  return Math.abs(LValue) + ' Dr';
               }

               return LValue;
            },
         },
         {
            field: 'cstGSTNo',
            headerName: 'GST No',
            headerClassName: 'tsGridHeader',
            minWidth: 200,
            fieldType: GenConstants().SYSTEM_FIELD,
            isRequired: false,
            pattern : "d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}"

         },
         {
            field: 'cstState',
            headerName: 'State',
            headerClassName: 'tsGridHeader',
            minWidth: 200,
            fieldType: GenConstants().STATE_FIELD,
            isRequired: false
         }
      ];

      //Getting custom fields
      if (isEmpty(p_arrCstFields) === false) {

         //Convert it into array
         p_arrCstFields = p_arrCstFields || [];

         p_arrCstFields.forEach(function (p_objRecord) {

            if (p_objRecord.isSystemField === true) {

               return true;
            }//if..

            LObj = {};

            LObj['headerName'] = p_objRecord.fieldName;

            //Setting column name
            LObj['field'] = p_objRecord.columnName;
            LObj['headerClassName'] = 'tsGridHeader';
            LObj['minWidth'] = 150;

            LObj['fieldType'] = p_objRecord.fieldType;
            LObj['isRequired'] = p_objRecord.isRequired === 1;

            LArrColumn.push(LObj);
         });
      }//if..

      return LArrColumn;
   }

   pvtLoadUserDialog() {
      /**
       * @method pvtNewUser
       * This method will Create new user
       */
      var LMe = this;

      if (LMe.state.CanInvokeDialogOpen === true) {
         return (
            <TCustomerDialog
               IsDialogOpen={LMe.state.CanInvokeDialogOpen}
               OnDialogClose={() => LMe.setState({ CanInvokeDialogOpen: false })}
               UpdateCustomerStore={(p_objUser) =>
                  LMe.UpdateCustomerStore(p_objUser)
               }
               CustomerRecord={LMe.state.CustomerRecord || {}}

               ColumnFields={LMe.state.ColumnFields || []}
            />
         );
      }
      return (<></>);
   }

   pvtEditCustomer(p_objParam) {
      /**
       * @method pvtEditCustomer
       * This method will invoke the dialog for edit mode edit the user
       */

      if (isEmpty(p_objParam) === true) {
         return;
      } ///if..

      var LMe = this,
         LRecord = p_objParam;

      LMe.setState({
         CanInvokeDialogOpen: true,
         CustomerRecord: LRecord
      });
   }

   UpdateCustomerStore(p_objResponseUser) {
      /**
       * @method UpdateCustomerStore
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

      if (LMe.props.IsSelectMode === true) {

         LMe.props.HandleOnSelect(p_objResponseUser);
      }
   }

   pvtHandleOnEditButtonClick() {
      var LMe = this;

      if (isEmpty(LMe.FSelectedRecord) === true) {
         LMe.FWarningText = 'Select a Customer and try again.';
         LMe.setState({ IsAlertDialogOpen: true });
         return;
      } //if..

      LMe.pvtEditCustomer(LMe.FSelectedRecord);
   }

   pvtHandleOnDeleteButtonClick() {
      var LMe = this;

      if (isEmpty(LMe.FSelectedRecord) === true) {
         LMe.FWarningText = 'Select a Customer and try again.';
         LMe.setState({ IsAlertDialogOpen: true });
         return;
      } //if..

      LMe.FCnfrmText = "Are you sure want to delete this customer?";
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
         LMe.FWarningText = 'Select a Customer and try again.';
         LMe.setState({ IsAlertDialogOpen: true });
         return;
      } //if..

      // eslint-disable-next-line no-useless-concat
      LUrl = BaseUrl() + 'customers' + '/' + LMe.FSelectedRecord.id;

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
                  LMe.setState({ IsAlertDialogOpen: true, IsCnfrmDialogOpen: false });

                  LMe.pvtFilterOnSearch();
                  return;
               }

               LMe.FSelectedRecord = null;

               if (LMe.props.IsSelectMode === true) {

                  LMe.props.SelectedRecord(LMe.FSelectedRecord);
               }//if..

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

      if (LMe.props.IsSelectMode === true) {

         LMe.props.SelectedRecord(LMe.FSelectedRecord);
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

   pvtGetHeader() {
      var LMe = this;

      if (LMe.props.IsSelectMode === true) {
         return <></>;
      }

      return (<Box component="div" display="flex" px={3} pb={2}>
         {/* Module Icon */}
         <div style={{ margin: '20px 6px 0 0' }}>
            <PeopleSharpIcon />
         </div>
         <div style={{ margin: '18px 6px 0 0' }}>
            {/* Module Title */}
            <div style={{ fontSize: '20px' }}> Manage Customers </div>

            {/* Module Description */}
            <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
               Create new customer, edit customer details, remove
               customer, etc.
            </Box>
         </div>
      </Box>);
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

         LCstName = p_objCustomer.cstName || '';
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
               // width: '100/%'
            }}
         >
            {LMe.pvtGetHeader()}
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
                        CustomerRecord: {},
                     })
                  }
               >
                  New Customer
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
                  Edit Customer
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
                  Delete Customer
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
               <div className="flex1"></div>

               <Input label="Search" placeholder="Search Customer"
                  onChange={(e) => {
                     LMe.pvtFilterOnSearch(e.currentTarget.value)
                  }}
                  ref={LMe.FSearchField}
                  type="text"
                  margin="dense"
                  style={{ margin: '10px 0 0 0' }}
                  endAdornment={
                     <InputAdornment position="start">
                        <Search />
                     </InputAdornment>
                  }
               />
            </Toolbar>
            <div
               style={{ margin: '5px 20px 0 20px' }}
               className="flex1"
            >
               <DataGrid
                  style={{ minHeight: '400px' }}
                  columns={LMe.state.ColumnFields}
                  rows={LMe.state.FetchedData || []}
                  ref={LMe.FGridRef}
                  // rowHeight={50}
                  pagination={true}
                  // pageSize={10}
                  csvOptions={{ allColumns: true }}
                  loading={LMe.state.FetchedData === null ? true : false}

                  sortModel={LMe.state.SortingModel}
                  onSortModelChange={(model) => LMe.setState({ SortingModel: model })}

                  // filterModel={{
                  //    items: [{ columnField: 'cstName', operatorValue: 'contains', value: 'Trinesh' }],
                  // }}

                  components={{
                     Toolbar: GridToolbar,
                  }}
                  density={'compact'}
                  onCellDoubleClick={(params) => {
                     if (LMe.props.IsSelectMode === true) {

                        LMe.props.HandleOnSelect(params.row);
                     }
                     else {

                        LMe.pvtEditCustomer(params.row)
                     }
                  }}
                  onRowClick={(e) => LMe.pvtHandleOnRowClick(e.row)}
                  hideFooter={LMe.props.IsSelectMode === true}
               />
            </div>
            {LMe.pvtLoadUserDialog()}

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

export default tsfrmCustomersGrid;
