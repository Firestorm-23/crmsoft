

const express = require('express');
const router = express.Router();
const fs = require('fs');
const FHomedir = require('os').homedir();
const { shell } = require('electron');
const path = require('path');
var { ErrorObj } = require('../local/tsclsGenUtils');

router.get('/backup', (p_req, p_res) => {

    // var LDate = new Date(),
    //     LNewFileName = 'backupfile-' + LDate.toDateString().replace(/\s/g, '-') + '.tnl';

    // p_res.download(__dirname + '/../db/data.db', LNewFileName);
    pvtSaveFileInUsersFolder((p_isSuccess, p_filePath) => {

        if (p_isSuccess === false) {

            return;
        }

        p_res.download(p_filePath, p_filePath);
    });
});

router.get('/openfolder', (p_req, p_res) => {

    var LDir = FHomedir + '/CrmSoft';

    if (!fs.existsSync(LDir)) {

        //Create Directory
        fs.mkdirSync(LDir);
    }

    // shell.showItemInFolder('filepath');
    shell.openPath(LDir);

    p_res.json({
        success: true
    });
});

function pvtSaveFileInUsersFolder(p_callBack) {

    var LDate = new Date(),
        LToFileName,
        LDir;

    LDir = FHomedir + '/CRMSOFT';
    // LDate = LDate.toLocaleDateString().replace(/\s/g, '-');

    LDate = LDate.getTime();

    if (!fs.existsSync(LDir)) {

        //Create Directory
        fs.mkdirSync(LDir);
    }

    LToFileName = LDir + '/Backup-File-' + LDate + '.tnl';

    var LDBPath = pvtGetDBFilePath();

    fs.copyFile(LDBPath, LToFileName, (p_error) => {

        if (p_error) {

            p_callBack && p_callBack(false);
        }//if..

        p_callBack && p_callBack(true, LToFileName);
    });
}

function pvtGetDBFilePath() {

    var LDBPath;

    if (process.env.NODE_ENV === 'development') {

        LDBPath = path.resolve(__dirname, '..', 'db', 'data.db');
    }
    else {

        LDBPath = path.resolve((process.resourcesPath), 'db', 'data.db');
    }

    return LDBPath;
}

function pvtGetDBFolderPath() {

    var LDBPath;

    if (process.env.NODE_ENV === 'development') {

        LDBPath = path.resolve(__dirname, '..', 'db');
    }
    else {

        LDBPath = path.resolve((process.resourcesPath), 'db');
    }

    return LDBPath;
}

/**Restore */
var multer = require('multer');

var FRecentlyUploadedFileName, FStorage = multer.diskStorage({
    destination: function (req, file, callback) {

        var LDir = pvtGetDBFolderPath() + '/uploads';

        if (!fs.existsSync(LDir)) {

            //Create Directory
            fs.mkdirSync(LDir);
        }

        callback(null, LDir);
    },
    filename: function (req, file, callback) {

        FRecentlyUploadedFileName = file.originalname;

        callback(null, file.originalname);
    }
});

var FUpload = multer({ storage: FStorage }).single('tsFileField');

router.post('/uploadfile', (p_req, p_res) => {

    FUpload(p_req, p_res, function (p_error) {

        if (p_error) {
            return p_res.status(500).json(ErrorObj(p_error));
        }

        fs.rename(pvtGetDBFolderPath() + '/uploads/' + FRecentlyUploadedFileName, pvtGetDBFolderPath() + '/uploads/data.db', (p_error) => {
            if (p_error) {
                return p_res.status(500).json(ErrorObj(p_error));
            }
            fs.copyFile(pvtGetDBFolderPath() + '/uploads/data.db', pvtGetDBFolderPath() + '/data.db', (p_error) => {

                if (p_error) {

                    return p_res.status(500).json(ErrorObj(p_error));
                }//if..

                p_res.send('<body onload="history.back()">Uploading file, please wait...</body>');
            });
        });
    });
});

module.exports = router;