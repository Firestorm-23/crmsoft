

// Modules to control application life and create native browser window
const { BrowserWindow } = require('electron');
const express = require('express');
const router = express.Router();

router.put('/', async (p_req, p_res) => {

    var LOptions = {
        // silent: false,
        printBackground: true,
        color: false,
        // margin: {
        //     marginType: 'printableArea'
        // },
        landscape: p_req.body.landscape || false,
        pageSize: p_req.body.pageSize || 'A5',
        pagesPerSheet: 1,
        // collate: false,
        copies: 1
    };

    // Defining a new BrowserWindow Instance
    var LWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        icon: __dirname + '/img/logo.png',
        menu: false
    });

    LWindow.loadURL('http://localhost:5000/' + p_req.body.url);

    LWindow.setMenuBarVisibility(false);

    LWindow.webContents.on('did-finish-load', () => {

        LWindow.webContents.print(LOptions, (success, failureReason) => {

            if (!success) {
                // p_res.json({
                //     success: false,
                //     message: 'Some thing wents wrong with printing.',
                //     error: failureReason
                // });
            }//if..

            //Electron is raising error, so comment this and write below the function
            // p_res.json({
            //     success: true
            // });
        });
        p_res.json({
            success: true
        });
    });
});
module.exports = router;