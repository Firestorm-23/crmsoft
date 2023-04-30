import React, { Component } from 'react';
import DashboardSharpIcon from '@material-ui/icons/DashboardSharp';
import RefreshIcon from '@material-ui/icons/Refresh';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { Box, Toolbar, Button, IconButton, Tooltip } from '@material-ui/core';
import { DataGrid } from '@mui/x-data-grid';
import { BaseUrl, isEmpty, tsGetProjectId, tsGetInvoiceTypes, tsSetInvoiceType } from '../../tsclsGenUtils';
import TInvoiceTypeDlg from './tsdlgInvoiceType';
import TDialog from '../../reusable/tsclsDialog';

class tsfrmCstFieldsShell extends Component {
   constructor(props) {
      super(props);

      var LMe = this;

      LMe.state = {
         FetchedData: null,
         CanInvokeDialogOpen: false,
         UserRecord: {},
         CanShowWarningIcon: false,
         IsAlertDialogOpen: false,
         IsCnfrmDialogOpen: false
      };

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

      LMe.pvtFetchInvoiceTypes(true);
   }

   pvtRefresh() {
      /**
       * @method pvtRefresh
       * This function will refresh the grid
       *
       * @returns: Nothing
       */
      var LMe = this;

      LMe.FSelectedRecord = null;
      LMe.setState({
         FetchedData: null,
      });

      LMe.pvtFetchInvoiceTypes();
   }

   pvtFetchInvoiceTypes(p_boolGetFromCache) {
      /**
       * @method pvtFetchInvoiceTypes
       * This function will fetch the list which will visible in side panel
       *
       * @returns: Array of objects of list items with tooltips
       */
      var LMe = this;

      if (p_boolGetFromCache === true) {

         LMe.setState({
            FetchedData: tsGetInvoiceTypes(),
         });

         return;
      }

      var LUrl = BaseUrl() + 'invoicetypes';

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
               }//if..

               tsSetInvoiceType(responseJson);

               LMe.setState({
                  FetchedData: responseJson,
               });
            },
            (error) => {
               LMe.setState({
                  FetchedData: [],
               });
            }
         );
   }

   pvtLoadDlg() {
      /**
       * @method pvtLoadDlg
       * This method will Create new user
       */
      var LMe = this;

      if (LMe.state.CanInvokeDialogOpen === false) {

         return (<></>);
      }//if..

      return (
         <TInvoiceTypeDlg
            IsDialogOpen={LMe.state.CanInvokeDialogOpen}
            OnDialogClose={() => LMe.setState({ CanInvokeDialogOpen: false })}
            UpdateUserStore={(p_objUser) => LMe.UpdateUserStore(p_objUser)}
            UserRecord={LMe.state.UserRecord || {}}
         />
      );
   }

   pvtEdit(p_objParam) {
      /**
       * @method pvtEdit
       * This method will invoke the dialog for edit mode edit the user
       */

      if (isEmpty(p_objParam) === true) {
         return;
      } ///if..

      var LMe = this,
         LRecord = p_objParam;

      LMe.setState({
         CanInvokeDialogOpen: true,
         UserRecord: LRecord,
      });
   }

   UpdateUserStore(p_objResponseUser) {
      /**
       * @method UpdateUserStore
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
            // p_objResponseUser.id = p_objResponseUser._id;
            LArrResponse.push(p_objResponseUser);
            LIsNewRecord = false;
            return true; //continue
         } //if..

         LArrResponse.push(p_objRecord);
      }); //forEach...

      if (LIsNewRecord === true) {
         // p_objResponseUser.id = p_objResponseUser._id;
         LArrResponse.push(p_objResponseUser);
      } //if..

      tsSetInvoiceType(LArrResponse);

      // Update state.
      LMe.setState({ FetchedData: LArrResponse });
   }

   pvtHandleOnEditButtonClick() {
      var LMe = this;

      if (isEmpty(LMe.FSelectedRecord) === true) {
         LMe.FWarningText = 'Select the invoice type and try again.';
         LMe.setState({ IsAlertDialogOpen: true });
         return;
      } //if..

      LMe.pvtEdit(LMe.FSelectedRecord);
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

         LMe.FWarningText = 'Select the invoice type and try again..';
         LMe.setState({ IsAlertDialogOpen: true });
         return;
      } //if..

      LUrl = BaseUrl() + 'invoicetypes/' + LMe.FSelectedRecord.id;

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
               if (responseJson.status === false) {

                  LMe.FWarningText = responseJson.message;
                  LMe.setState({ IsAlertDialogOpen: true, FetchedData: LArrFetchedData, IsCnfrmDialogOpen: false });
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

               tsSetInvoiceType(LArrResponse);

               // Update state.
               LMe.setState({
                  FetchedData: LArrResponse,
                  IsCnfrmDialogOpen: false
               });
            },
            (error) => {

               LMe.FWarningText = error.message;
               LMe.setState({ IsAlertDialogOpen: true, FetchedData: LArrFetchedData, IsCnfrmDialogOpen: false });
            }
         );
   }

   pvtHandleOnDeleteButtonClick() {
      var LMe = this;

      if (isEmpty(LMe.FSelectedRecord) === true) {
         LMe.FWarningText = 'Select the invoice type and try again.';
         LMe.setState({ IsAlertDialogOpen: true });
         return;
      } //if..

      var LAllFetchedData = LMe.state.FetchedData || [];
      if (LAllFetchedData.length <= 1) {

         LMe.FWarningText = <>At least one "Invoice Type" is mandatory.</>;
         LMe.setState({ IsAlertDialogOpen: true });
         return;
      }

      LMe.FCnfrmText = "Are you sure you want to delete this invoice type?";
      LMe.F_callBackOnCnfrmTrue = LMe.pvtDelete;
      LMe.setState({ IsCnfrmDialogOpen: true });
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
                     }
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

   render() {
      var LMe = this;
      return (
         <div className="flex1 tsVBox">
            <Box component="div" display="flex" px={4} pb={2}>
               {/* Admin Manage Icon */}
               <div style={{ margin: '20px 6px 0 0' }}>
                  <DashboardSharpIcon />
               </div>
               <div style={{ margin: '18px 6px 0 0' }}>
                  {/* Admin Title */}
                  <div style={{ fontSize: '20px' }}>
                     {' '}
                     {LMe.props.moduleInfo.moduleTitle}{' '}
                  </div>

                  {/* Admin Description */}
                  <Box component="div" style={{ fontSize: '13px' }} mt={0.5}>
                     {LMe.props.moduleInfo.moduleDescription}
                  </Box>
               </div>
            </Box>

            {/* ToolBar */}
            <Toolbar
               style={{ margin: '0 0 0 30px' }}
               component="div"
               variant="dense"
            >
               <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  disableElevation
                  onClick={() =>
                     LMe.setState({ CanInvokeDialogOpen: true, UserRecord: {} })
                  }
               >
                  New Invoice Type
               </Button>
               <Button
                  size="small"
                  style={{ margin: '0 0 0 10px' }}
                  variant="outlined"
                  color="primary"
                  disableElevation
                  onClick={() => {
                     LMe.pvtHandleOnEditButtonClick();
                  }}
                  startIcon={<EditIcon />}
               >
                  Edit Invoice Type
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
                  Delete Invoice Type
               </Button>
               <IconButton
                  style={{ margin: '0 5px 0 5px' }}
                  aria-label="Refresh"
                  onClick={() => {
                     LMe.pvtRefresh();
                  }}
               >
                  <Tooltip title="Refresh">
                     <RefreshIcon />
                  </Tooltip>
               </IconButton>
            </Toolbar>

            {/* Grid */}
            <div
               style={{ margin: '5px 10px 20px 50px', maxWidth: '800px' }}
               className="flex1"
            >
               <DataGrid
                  columns={[
                     {
                        field: 'NAME',
                        headerName: 'Invoice Type',
                        headerClassName: 'tsGridHeader',
                        minWidth: 300,
                        flex: 1,
                     },
                     {
                        field: 'SINGULAR_NAME',
                        headerName: 'Singular Type',
                        headerClassName: 'tsGridHeader',
                        minWidth: 200,
                     },
                     {
                        field: 'INVOICE_NO_STARTS_WITH',
                        headerName: 'Invoice no starts with',
                        headerClassName: 'tsGridHeader',
                        minWidth: 220,
                     }
                  ]}
                  rows={LMe.state.FetchedData || []}
                  pagination
                  csvOptions={{ allColumns: false }}
                  loading={LMe.state.FetchedData === null ? true : false}
                  //   components={{
                  //      Toolbar: GridToolbar,
                  //   }}
                  onCellDoubleClick={(params) => LMe.pvtEdit(params.row)}
                  onRowClick={(e) => LMe.pvtHandleOnRowClick(e.row)}
                  // sortModel={LMe.state.SortModel}
                  hideFooter
               />
            </div>

            {LMe.pvtLoadDlg()}

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
export default tsfrmCstFieldsShell;
