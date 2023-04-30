import React, { Component } from 'react';

import {
   Box,
   Button,
   TextField
} from '@material-ui/core';

import TDialog from '../../reusable/tsclsDialog';
import SaveIcon from '@material-ui/icons/Save';

import {
   BaseUrl,
   isEmpty,
   tsGetProjectId
} from '../../tsclsGenUtils';

class tsdlgCustomerFields extends Component {
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

         IsLoading: false,
         IsAlertDialogOpen: false,
         AlertDialog: {
            AlertDialogContent: <></>,
            AlertDialogHeader: 'Warning',
         },

         SInvoiceType: '',
         SSingularInvoiceType: '',
         SInvoiceTypeStartsWith: ''
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

      var LRecord = LMe.props.UserRecord;

      //Upate state here
      LMe.setState({
         SInvoiceType: LRecord.NAME || '',
         SSingularInvoiceType: LRecord.SINGULAR_NAME || '',
         SInvoiceTypeStartsWith: LRecord.INVOICE_NO_STARTS_WITH || ''
      });
   }

   pvtHandleOnClose() {
      var LMe = this;

      LMe.props.OnDialogClose();
   }

   pvtGetDialogContent() {
      var LMe = this;

      return (
         <Box flex="1" pt={2} display="flex" flexDirection="column" className="tsDialogMinWidth">
            <TextField
               label="Invoice Type Title"
               placeholder="Invoice Type Title"
               required
               fullWidth
               onChange={(e) =>
                  LMe.setState({ SInvoiceType: e.currentTarget.value })
               }
               value={LMe.state.SInvoiceType}
               margin="dense"
            />

            <TextField
               label="Singular Invoice Type Title"
               placeholder="Singular Invoice Type Title"
               style={{ margin: '20px 0 0 0' }}
               required
               fullWidth
               onChange={(e) =>
                  LMe.setState({ SSingularInvoiceType: e.currentTarget.value })
               }
               value={LMe.state.SSingularInvoiceType}
               margin="dense"
            />

            <TextField
               label="Invoice Number Starts with"
               placeholder="Invoice Number Starts with"
               style={{ margin: '20px 0 0 0' }}
               required
               fullWidth
               onChange={(e) =>
                  LMe.setState({ SInvoiceTypeStartsWith: e.currentTarget.value })
               }
               value={LMe.state.SInvoiceTypeStartsWith}
               margin="dense"
               helperText={<>If you want invoice number like <b>"Bill-001"</b> then the value of this field is <b>"Bill-"</b>.</>}
            />
         </Box>
      );
   }

   pvtGetDialogAction() {
      var LMe = this;

      return (
         <Button
            onClick={() => {
               LMe.pvtSave();
            }}
            color="primary"
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
         >
            Save
         </Button>
      );
   }

   pvtValidate() {
      /**
       * @method pvtValidate
       * This method will validate the user dlg
       */
      var LMe = this,
         LAlertStateObj = {},
         LIsValid = true;

      if (isEmpty(LMe.state.SInvoiceType) === true) {
         LIsValid = false;

         LAlertStateObj = {
            AlertDialogContent: <span> "Invoice Type Title" is required. </span>,
            AlertDialogHeader: 'Warning',
         };
      } //if..
      else if (isEmpty(LMe.state.SSingularInvoiceType) === true) {
         LIsValid = false;

         LAlertStateObj = {
            AlertDialogContent: <span> "Singular Invoice Type Title" is required. </span>,
            AlertDialogHeader: 'Warning',
         };
      }
      else if (isEmpty(LMe.state.SInvoiceTypeStartsWith) === true) {
         LIsValid = false;

         LAlertStateObj = {
            AlertDialogContent: <span> Enter "Invoice Number Starts with" value. <br /><br /> If you want invoice number like <b>"Bill-001"</b> then the value of this field is <b>"Bill-"</b>. </span>,
            AlertDialogHeader: 'Warning',
         };
      }

      if (LIsValid === false) {
         LMe.setState({
            IsAlertDialogOpen: true,
            AlertDialog: LAlertStateObj,
         });
      }

      return LIsValid;
   }

   pvtSave() {
      /**
       * @method pvtSave
       * This function will fire the command and save the user data
       *
       */
      var LMe = this,
         LParamObj = {},
         LRequestOptions,
         LUrl = BaseUrl() + 'invoicetypes',
         LIsValid = false,
         LIsEditMode = isEmpty(LMe.props.UserRecord.id) === false;

      LIsValid = LMe.pvtValidate();

      if (LIsValid === false) {
         return false;
      } //if..

      LParamObj = {
         NAME: LMe.state.SInvoiceType,
         SINGULAR_NAME: LMe.state.SSingularInvoiceType,
         INVOICE_NO_STARTS_WITH: LMe.state.SInvoiceTypeStartsWith
      };

      LRequestOptions = {
         method: LIsEditMode === true ? 'PUT' : 'POST',
         headers: {
            'Content-Type': 'application/json',
            'projectid': tsGetProjectId()
         },
         body: JSON.stringify(LParamObj),
      };

      if (LIsEditMode === true) {
         LUrl = BaseUrl() + 'invoicetypes/' + LMe.props.UserRecord.id;
      }//if..

      LMe.setState({
         IsLoading: true
      });

      fetch(LUrl, LRequestOptions)
         .then((response) => response.json())
         .then(
            (responseJson) => {
               LMe.setState({
                  IsLoading: false,
               });

               if (responseJson.success === false || isEmpty(responseJson)) {

                  var LAlertStateObj = {
                     AlertDialogContent: <span> {responseJson.message} </span>,
                     AlertDialogHeader: 'Error Occured',
                  };

                  LMe.setState({
                     IsAlertDialogOpen: true,
                     AlertDialog: LAlertStateObj,
                  });

                  return;
               } //if..

               //If Not error
               LMe.pvtHandleOnClose();
               LMe.props.UpdateUserStore(responseJson);

               if (LIsEditMode === false) {

                  //Reset the variables
                  LMe.setState({
                     SInvoiceType: '',
                     SSingularInvoiceType: '',
                     SInvoiceTypeStartsWith: ''
                  });
               }//if..
            },
            (error) => {
               LMe.setState({
                  IsLoading: false,
               });
            }
         );
   }

   render() {
      var LMe = this;

      return (
         <>
            {/* Window */}
            <TDialog
               IsDialogOpen={LMe.props.IsDialogOpen}
               OnDialogClose={() => LMe.pvtHandleOnClose()}
               DialogContent={LMe.pvtGetDialogContent()}
               DialogActions={LMe.pvtGetDialogAction()}
               DialogHeader={
                  isEmpty(LMe.props.UserRecord.id) ? 'New Invoice Type' : 'Edit Invoice Type'
               }
               DialogLoading={LMe.state.IsLoading}
               IsWindow={true}
            />

            {/* Warning Dialog */}
            <TDialog
               IsDialogOpen={LMe.state.IsAlertDialogOpen}
               OnDialogClose={() => LMe.setState({ IsAlertDialogOpen: false })}
               DialogContent={LMe.state.AlertDialog.AlertDialogContent}
               DialogActions={<></>}
               DialogHeader={LMe.state.AlertDialog.AlertDialogHeader}
               IsWindow={false}
            />
         </>
      );
   }
}

export default tsdlgCustomerFields;
