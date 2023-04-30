import React, { Component } from 'react';
import './App.css';
import HomePage from './tsclsHome';
import LoginPg from './tsfrmLogin';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from "@material-ui/core";
import theme from "./theme";
import TSingleInvoice from './single/pkgInvoice/tsfrmSingleInvoice';
import TPaymentInvoice from './single/pkgPayments/tsfrmPaymentInvoice';
import TStatement from './single/pkgManageCustomers/tsclsStatement';
import TSupplierSingleInvoice from './single/pkgSupplier/tsfrmSingleInvoice';
import { BaseUrl, tsSetInvoiceType, tsGetProjectId } from './tsclsGenUtils.js';

class App extends Component {

  constructor(props) {
    super(props);

    var LMe = this;

    LMe.state = {
      SIsLoading: true
    };
  }



  componentDidMount() {
    var LMe = this;

    LMe.pvtFetchInvoiceTypes();
  }

  pvtFetchInvoiceTypes() {
    /**
     * @method pvtFetchInvoiceTypes
     * This function will fetch the invoice types
     * and sets in genutils cache
     */
    var LMe = this,
      LRequestOptions,
      LUrl;
    

    LUrl = BaseUrl() + 'invoicetypes';

    LRequestOptions = {
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

          LMe.setState({
            SIsLoading: false
          });

          if (responseJson.status === false) {
            return;
          }

          //Updating cache
          tsSetInvoiceType(responseJson);
        },
        (error) => {
          LMe.setState({
            SIsLoading: false
          });
        }
      );
  }

  render() {
    var LMe = this;

    if (LMe.state.SIsLoading === true) {

      return <></>;
    }//if..

    return (
      <ThemeProvider theme={theme}>
        <Router>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/supplierInvoice/:invoiceType/:invoiceNo" component={TSupplierSingleInvoice} />
            <Route exact path="/singleInvoice/:invoiceType/:invoiceNo" component={TSingleInvoice} />
            <Route exact path="/paymentInvoice/:invoiceNo" component={TPaymentInvoice} />
            <Route exact path="/statement/:cstId/:fromDate/:toDate" component={TStatement} />
            <Route exact path="/login" component={LoginPg} />
            <Route exact path="/:paramalink" component={HomePage} />
            <Route exact path="/:paramalink/:moduleType" component={HomePage} />
          </Switch>
        </Router>
      </ThemeProvider>
    );
  }
}

export default App;