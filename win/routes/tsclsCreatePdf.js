
const express = require('express');
const router = express.Router();
const puppeteer = require("puppeteer");
const path = require("path");

var { ErrorObj } = require('../local/tsclsGenUtils');
// var GenConstant = require('../tsclsGenConstants');

router.put('/', async (p_req, p_res) => {
    try {

        // var LProjectId = p_req.headers.projectid;

        // if (isEmpty(LProjectId) === true) {

        //     return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
        // }//if..

        // return p_res.status(500).json(ErrorObj({ message: 'Error occurred while converting the invoice into PDF. \n\n If you are getting this error from long time and you want to donwload PDF then simply print this bill and without chossing printer click on "Save as PDF" option to download this in PDF format.' }));

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(p_req.body.url, {
            waitUntil: "networkidle2"
        });

        await page.setViewport({ width: 1680, height: 1050 });

        var LDir, LPDFPath;
        if (process.env.NODE_ENV === 'development') {

            LDir = __dirname;
            // LPDFPath = path.resolve(LDir, '..', 'db', 'invoice.pdf');
        }
        else {

            LDir = (process && process.resourcesPath);
            // LPDFPath = path.resolve(LDir, 'db', 'invoice.pdf');
        }
        LPDFPath = path.resolve(LDir, '..', 'db', 'invoice.pdf');

        await page.pdf({
            path: LPDFPath,//path.resolve(__dirname, '..', 'local', 'pdfs', 'invoice.pdf'),
            format: "A4",
            margin: {
                top: '38px',
                right: '38px',
                bottom: '38px',
                left: '38px'
            }
        });

        await browser.close();

        p_res.json({
            success: true, url: 'downloadpdf'
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj({ message: 'Error occurred while converting the invoice into PDF. Following are the possible reasons:\n\n' + p_error.message }));
    }
});

module.exports = router;