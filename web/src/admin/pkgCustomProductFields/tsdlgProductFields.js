import React, { Component } from 'react';

import {
   Box,
   Button,
   Select,
   TextField,
   MenuItem,
   FormControl,
   InputLabel,
   FormControlLabel,
   FormHelperText,
   Checkbox
} from '@material-ui/core';

import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import TDialog from '../../reusable/tsclsDialog';
import SaveIcon from '@material-ui/icons/Save';

import {
   BaseUrl,
   isEmpty,
   tsGetProjectId
} from '../../tsclsGenUtils';

import { GenConstants } from '../../tsclsGenConstants';

class tsdlgProductFields extends Component {
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
         ShowPassword: false,
         IsLoading: false,

         IsAlertDialogOpen: false,
         AlertDialog: {
            AlertDialogContent: <></>,
            AlertDialogHeader: 'Warning',
         },

         SFieldName: '',
         SFieldType: '',
         SIsRequired: false
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
         SFieldName: LRecord.fieldName || '',
         SFieldType: LRecord.fieldType || '',
         SIsRequired: LRecord.isRequired === 1,
      });
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      /**
       * @method componentDidUpdate
       *
       */
      // var LMe = this;

      // if (prevProps.UserRecord.id !== LMe.props.UserRecord.id) {

      //    var LRecord = LMe.props.UserRecord;

      //    //Upate state here
      //    LMe.setState({
      //       SFieldName: LRecord.fieldName || '',
      //       SFieldType: LRecord.fieldType || '',
      //       SIsRequired: LRecord.isRequired === 1,
      //    });
      // }//if..
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
               label="Field Name"
               placeholder="Field Name"
               required
               fullWidth
               onChange={(e) =>
                  LMe.setState({ SFieldName: e.currentTarget.value })
               }
               value={LMe.state.SFieldName}
               margin="dense"
            />

            <FormControl style={{ margin: '15px 0 0 0' }}>
               <InputLabel>Field Type</InputLabel>
               <Select
                  value={LMe.state.SFieldType}
                  onChange={(e) =>
                     LMe.setState({ SFieldType: e.target.value })
                  }
               >
                  <MenuItem value={GenConstants().FIELD_TEXT}>Text</MenuItem>
                  <MenuItem value={GenConstants().FIELD_NUMBER}>Number</MenuItem>
                  <MenuItem value={GenConstants().FIELD_DATE}>Date</MenuItem>
               </Select>
            </FormControl>

            <FormControl>
               <FormControlLabel
                  style={{ margin: '20px 0 0 0' }}
                  control={
                     <Checkbox
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        onChange={(e) => LMe.setState({ SIsRequired: e.target.checked })}
                        checked={LMe.state.SIsRequired}
                     />
                  }
                  label="Required?"
               />
               <FormHelperText style={{ margin: '-5px 0 0 20px' }}>If this field is checked, then each time when you add new or modify the customer, this field is required.</FormHelperText>
            </FormControl>
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

      if (isEmpty(LMe.state.SFieldName) === true) {
         LIsValid = false;

         LAlertStateObj = {
            AlertDialogContent: <span> Field Name is required. </span>,
            AlertDialogHeader: 'Warning',
         };
      } //if..
      else if (isEmpty(LMe.state.SFieldType) === true) {
         LIsValid = false;

         LAlertStateObj = {
            AlertDialogContent: <span> Field Type is required. </span>,
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
         LUrl = BaseUrl() + 'customFields',
         LIsValid = false,
         LIsEditMode = isEmpty(LMe.props.UserRecord.id) === false;

      LIsValid = LMe.pvtValidate();

      if (LIsValid === false) {
         return false;
      } //if..

      LParamObj = {
         fieldName: LMe.state.SFieldName,
         fieldType: LMe.state.SFieldType,
         type: GenConstants().PRODUCT_CSTM_FIELDS,
         isRequired: LMe.state.SIsRequired,
         invoiceType: LMe.props.InvoiceType
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
         LUrl = BaseUrl() + 'customFields/' + LMe.props.UserRecord.id;
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
                     AlertDialogHeader: 'Error',
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
                     SFieldName: '',
                     SFieldType: '',
                     SIsRequired: false
                  });
               }//if..
            },
            (error) => {
               this.setState({
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
                  isEmpty(LMe.props.UserRecord.id) ? 'New Field' : 'Edit Field'
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

export default tsdlgProductFields;
