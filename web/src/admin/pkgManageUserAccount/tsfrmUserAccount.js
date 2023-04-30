import React, { Component } from 'react';

import { Box, Toolbar, Button, IconButton, Tooltip } from '@material-ui/core';
import { BaseUrl, isEmpty, tsGetProjectId } from '../../tsclsGenUtils';
import PeopleSharpIcon from '@material-ui/icons/PeopleSharp';
import RefreshIcon from '@material-ui/icons/Refresh';
import CheckIcon from '@material-ui/icons/Check';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

import TUserDialog from './tsdlgUser';
import EditIcon from '@material-ui/icons/Edit';
import TDialog from '../../reusable/tsclsDialog';

class tsfrmUserAccount extends Component {
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
         UserRecord: {},
         IsAlertDialogOpen: false,
      };

      LMe.FGridRef = React.createRef();
   }

   componentDidMount() {
      /**
       * @method componentDidMount
       * This method allows us to execute the React code when the component is already placed in the DOM (Document Object Model).
       * This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered.
       *
       */
      var LMe = this;

      LMe.pvtFetchUsers();
   }

   pvtRefresh() {
      /**
       * @method pvtRefresh
       * This function will refresh the grid
       *
       * @returns: Nothing
       */
      var LMe = this;

      LMe.pvtFetchUsers();

      this.setState({
         FetchedData: null,
      });
   }

   pvtFetchUsers() {
      /**
       * @method pvtLoadListData
       * This function will fetch the list which will visible in side panel
       *
       * @returns: Array of objects of list items with tooltips
       */
      var LMe = this,
         LUrl;

      LUrl = BaseUrl() + 'users';

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

               // responseJson.forEach(function (p_objRecord) {
               //    p_objRecord.id = p_objRecord._id;
               // });//forEach

               LMe.setState({
                  FetchedData: responseJson
               });
            },
            (error) => {
               this.setState({
                  FetchedData: [],
               });
            }
         );
   }

   pvtLoadUserDialog() {
      /**
       * @method pvtNewUser
       * This method will Create new user
       */
      var LMe = this;

      if (LMe.state.CanInvokeDialogOpen === false) {

         return (<></>);
      }//if..

      return (
         <TUserDialog
            IsDialogOpen={LMe.state.CanInvokeDialogOpen}
            OnDialogClose={() => LMe.setState({ CanInvokeDialogOpen: false })}
            UpdateUserStore={(p_objUser) => LMe.UpdateUserStore(p_objUser)}
            UserRecord={LMe.state.UserRecord || {}}
            PAllUsers={LMe.state.FetchedData || []}
         />
      );
   }

   pvtEditUser(p_objParam) {
      /**
       * @method pvtEditUser
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

      // Update state.
      LMe.setState({ FetchedData: LArrResponse });
   }

   pvtHandleOnEditButtonClick() {
      var LMe = this;

      if (isEmpty(LMe.FSelectedRecord) === true) {
         LMe.FWarningText = 'Select a User and try again.';
         LMe.setState({ IsAlertDialogOpen: true });
         return;
      } //if..

      LMe.pvtEditUser(LMe.FSelectedRecord);
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

   render() {
      var LMe = this;

      return (
         <div className="flex1 tsVBox">
            <Box component="div" display="flex" px={4} pb={2}>
               {/* Admin Setting Icon */}
               <div style={{ margin: '20px 6px 0 0' }}>
                  <PeopleSharpIcon />
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
                  New User
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
                  Edit User
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
               style={{ margin: '5px 10px 20px 50px', maxWidth: '1000px' }}
               className="flex1"
            >
               <DataGrid
                  columns={[
                     {
                        field: 'isActive',
                        headerName: 'Active',
                        headerClassName: 'tsGridHeader',
                        width: 120,
                        renderCell: (params) => (
                           <>{params.value === 1 ? <CheckIcon /> : ''}</>
                        ),
                     },
                     {
                        field: 'displayName',
                        headerName: 'Name',
                        headerClassName: 'tsGridHeader',
                        flex: 1,
                        color: 'primary',
                        sort: 'asc',
                     },
                     // {
                     //    field: 'birthdate',
                     //    headerName: 'Birthday 🎂',
                     //    headerClassName: 'tsGridHeader',
                     //    width: 200,
                     //    valueFormatter: (params) => {
                     //       var LDate = params.value,
                     //          LDispDate = '';

                     //       if (isEmpty(LDate) === false) {
                     //          LDispDate = tsGetDateFromServerDate(LDate);
                     //       } //if..

                     //       return LDispDate;
                     //    },
                     // },
                     {
                        field: 'username',
                        headerName: 'Email',
                        headerClassName: 'tsGridHeader',
                        minWidth: 200,
                     },
                     {
                        field: 'password',
                        headerName: 'Password',
                        headerClassName: 'tsGridHeader',
                        minWidth: 150,
                        hide: true,
                     },
                  ]}
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
                  onCellDoubleClick={(params) => LMe.pvtEditUser(params.row)}
                  onRowClick={(e) => LMe.pvtHandleOnRowClick(e.row)}
                  hideFooter
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
         </div>
      );
   }
}

export default tsfrmUserAccount;
