// Express JS code
const express = require('express');
const expressApp = express();
const path = require("path");

const dotenv = require('dotenv');

dotenv.config();

function Initialize() {

    //Using CROS
    var cors = require('cors');
    expressApp.use(cors());

    expressApp.use(express.json());

    const LUsers = require('./routes/tsclsUsers');
    expressApp.use('/users', LUsers);

    const LMenuJson = require('./routes/tsclsMenuJson');
    expressApp.use('/menujson', LMenuJson);

    const LInvoiceTypesJson = require('./routes/tsclsInvoiceTypesJson');
    expressApp.use('/invoicetypes', LInvoiceTypesJson);

    const LLogin = require('./routes/tsclsLogin');
    expressApp.use('/logincmd', LLogin);

    const LCustomers = require('./routes/tsclsCustomers');
    expressApp.use('/customers', LCustomers);

    const LProducts = require('./routes/tsclsProducts');
    expressApp.use('/products', LProducts);

    const LCustomFields = require('./routes/tsclsCustomFields');
    expressApp.use('/customFields', LCustomFields);

    const LStock = require('./routes/tsclsStock');
    expressApp.use('/stocks', LStock);

    const LPayments = require('./routes/tsclsPayments');
    expressApp.use('/payments', LPayments);

    const LInvoices = require('./routes/tsclsInvoice');
    expressApp.use('/invoices', LInvoices);

    const LProject = require('./routes/tsclsProject');
    expressApp.use('/project', LProject);

    const LStatement = require('./routes/tsclsSatement');
    expressApp.use('/statement', LStatement);

    const LSupplierInvoices = require('./routes/tsclsSupplierInvoice');
    expressApp.use('/supplierinvoices', LSupplierInvoices);

    const LGSTReports = require('./routes/clsGSTReports');
    expressApp.use('/gstreports', LGSTReports);

    const LPrint = require('./tsPrint');
    expressApp.use('/print', LPrint);

    const LBackupRestores = require('./routes/clsBackupRestores');
    expressApp.use('/backup-restores', LBackupRestores);

    const LPDF = require('./routes/tsclsCreatePdf');
    expressApp.use('/pdf', LPDF);

    const __dirname = path.resolve();

    expressApp.use(express.static(path.join(__dirname, '/local/pdfs')));

    expressApp.get("/downloadpdf", function (req, res) {

        var LDir;

        if (process.env.NODE_ENV === 'development') {

            LDir = __dirname;
        }
        else {

            //Need to un comment this line for build mode
            LDir = (process && process.resourcesPath);
        }

        var LPDFPath = path.resolve(LDir, 'db/invoice.pdf');

        res.sendFile(LPDFPath);
    });

    //This will runs the Client website
    expressApp.use(express.static(path.join(__dirname, 'build')));

    expressApp.get("*", function (req, res) {

        res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
    });

    expressApp.listen(process.env.PORT || 5000);


}

module.exports = { Initialize };
//Initialize();