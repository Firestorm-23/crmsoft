
const express = require('express');
const router = express.Router();

const FDb = require('../tsclsDatabase');
const GenConstant = require('../tsclsGenConstants');

var { ErrorObj, isEmpty, isEmailValid, isObjEmpty } = require('../local/tsclsGenUtils');
const { SendEmail } = require('../tsclsSendMail');

//Getting all users
router.get('/', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var sql = `SELECT * FROM users WHERE projectId=${LProjectId}`;

        FDb.all(sql, [], (p_error, rows) => {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            p_res.json(rows);
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

//Getting one user by id
router.get('/:id', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {

        var LId = parseInt(p_req.params.id);

        var L_fun = function (p_objRecord) {

            p_res.json(p_objRecord || {});
        };

        pvtGetUserById(L_fun, LId, LProjectId);
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

function pvtAddProjectAndInvoiceType(p_strOrgName, p_callBack) {

    FDb.run(`INSERT INTO projects (orgName, defaultInvoice, defaultPaymentInvoice, defaultStatement, timestamp) VALUES ('${p_strOrgName}', 'tpl1', 'tpl1', 'tpl1', '${new Date()}')`, [], function (p_error) {

        if (p_error) {

            return p_error;
        }//if..

        var LProjectId = this.lastID;

        FDb.run(`INSERT INTO invoiceTypes (NAME, SINGULAR_NAME, ACT_CODE, INVOICE_NO_STARTS_WITH, projectId) VALUES 
        ('Inventories', 'Inventory', 'actInventory', 'I-', ${LProjectId})`, [], function (p_error) {

            if (p_error) {

                return p_error;
            }//if..

            p_callBack(LProjectId);
        });
    });
}

//Creting new one
router.post('/', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    const LBody = p_req.body || {};

    var LCanCreateNewProject = LBody.canCreateNewProject || false;

    if (LCanCreateNewProject === false && isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var LUserName = LBody.username;

    LUserName = LUserName.split(" ");
    LUserName = LUserName.join("");
    LUserName = LUserName.toLowerCase();

    if (isEmailValid(LUserName) === false) {
        return p_res.status(500).json(ErrorObj({ message: 'Username is empty.' }));
    }//if..

    if (LCanCreateNewProject === true) {
        // Verify OTP
        if (pvtGetOTPByEmailFromCollection(LUserName) !== parseInt(LBody.otp)) {
            return p_res.status(500).json(ErrorObj({ message: 'Invalid OTP, please check your email\'s spam box.' }));
        }//if..

        // Here means email is valid
    }

    var LIsActive = LBody.isActive === true ? 1 : 0;

    var L_fun = function (p_objRecord) {

        p_res.json(p_objRecord || {});
    };

    try {

        var L_funUser = function (p_intProjectId) {
            // insert one row into the users table
            FDb.run(`INSERT INTO users (username, password, isActive, displayName, projectId) VALUES('${LUserName}', '${LBody.password}', ${LIsActive}, '${LBody.displayName}', ${p_intProjectId})`,
                [], function (p_error) {
                    if (p_error) {

                        var LMessage = p_error.message;

                        if (GenConstant().ERROR_CODE_FOR_UNIQUE === p_error.errno) {
                            LMessage = pvtGetAlreadyExistsMsgForEmail(LUserName);;
                        }//if..

                        return p_res.status(500).json(
                            {
                                message: LMessage,
                                success: false
                            }
                        );
                    }

                    pvtGetUserById(L_fun, this.lastID, p_intProjectId);
                });
        }

        if (LCanCreateNewProject === true) {

            pvtAddProjectAndInvoiceType(LBody.orgName, function (p_intProjectId) {

                L_funUser(p_intProjectId);
            });
        }//if..
        else {
            L_funUser(LProjectId);
        }
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

//Delete the user by id
router.delete('/:id', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    try {
        // delete one row into the langs table
        FDb.run(`DELETE FROM users WHERE id=${p_req.params.id} AND projectId=${LProjectId}`,
            [], function (p_error) {
                if (p_error) {

                    return p_res.status(500).json(ErrorObj(p_error));
                }//if..

                p_res.json({
                    success: true,
                    message: 'User Deleted.',
                    // id: this.lastID
                });
            });

    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

router.put('/:id', async (p_req, p_res) => {

    var LProjectId = p_req.headers.projectid;

    if (isEmpty(LProjectId) === true) {

        return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
    }//if..

    var LUpdateQuery = '';

    if (p_req.body.displayName != null) {

        LUpdateQuery += ' displayName="' + p_req.body.displayName + '"';
    }

    if (p_req.body.username != null) {

        // LUpdateQuery += ', username="' + p_req.body.username + '"';
    }

    if (p_req.body.password != null) {

        LUpdateQuery += ', password="' + p_req.body.password + '"';
    }

    if (p_req.body.isActive != null) {

        var LIsActive = p_req.body.isActive === true ? 1 : 0;
        LUpdateQuery += ', isActive=' + LIsActive;
    }

    try {

        var LId = parseInt(p_req.params.id);

        var LSql = `UPDATE users SET ${LUpdateQuery} WHERE id=${LId} AND projectId=${LProjectId}`;

        var L_fun = function (p_objRecord) {

            p_res.json(p_objRecord || {});
        };

        // update one row into the langs table
        FDb.run(LSql, [], function (p_error) {

            if (p_error) {

                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            pvtGetUserById(L_fun, LId, LProjectId);
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});


function pvtGetUserById(p_callback, p_intId, p_intProjectId) {
    /**
     * @method pvtGetUser
     * This method will return the user and call callback function
     * 
     * @param
     * {callback} - function
     * {id} - User Id
     */

    if (!p_intId) {

        return false;
    }

    var sql = `SELECT * FROM users where id=${p_intId} AND projectId=${p_intProjectId}`;

    FDb.all(sql, [], (p_error, rows) => {

        if (p_error) {

            return p_callback(ErrorObj(p_error));
        }

        if (p_callback) {

            p_callback(rows[0]);
        }
    });
}

function pvtGetAlreadyExistsMsgForEmail(p_strEmail) {
    /**
     * @method pvtGetAlreadyExistsMsgForEmail
     * This method will return the message for already exists msg
     */

    p_strEmail = p_strEmail || '';

    return 'The "' + p_strEmail + '" email is already registered, try forget password or create new account by different email.';
}

var FCollectionEmailAndOTPs = [
    // {
    //     email: 'fdfdfd@fdfd.fdfd',
    //     otp: '1234'
    // }
];

function pvtAddOTPInCollection(p_strEmail, p_OTP) {

    // Checking Email is in the list
    const LRecord = pvtOTPObjectByEmail(p_strEmail);

    if (isObjEmpty(LRecord) === false) {
        // Update OTP
        LRecord.otp = p_OTP;
        return;
    }

    // Else add new entry
    FCollectionEmailAndOTPs.push({
        email: p_strEmail,
        otp: p_OTP
    });
}

function pvtOTPObjectByEmail(p_strEmail) {

    return FCollectionEmailAndOTPs.find(function (p_objRecord) {
        return p_objRecord.email === p_strEmail;
    });
}

function pvtGetOTPByEmailFromCollection(p_strEmail) {

    const LRecord = pvtOTPObjectByEmail(p_strEmail);

    if (isObjEmpty(LRecord) === false) {
        return LRecord.otp;
    }

    return '';
}

function pvtGetRandomOTP() {

    return Math.floor(1000 + Math.random() * 9000);
}

router.put('/send/otp', async (p_req, p_res) => {

    const LEmail = p_req.body.email,
        LName = p_req.body.displayName;

    if (isEmailValid(LEmail) === false) {
        return p_res.status(500).json(ErrorObj({ message: 'Email is invalid.' }));
    }//if..

    try {

        const sql = `SELECT * FROM users WHERE username='${LEmail}'`;

        FDb.all(sql, [], (p_error, rows) => {

            if (p_error) {
                return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            const LRecord = rows[0];

            if (isObjEmpty(LRecord) === false) {
                return p_res.status(500).json(ErrorObj({ message: pvtGetAlreadyExistsMsgForEmail(LEmail) }));
            }//if..

            const LOtp = pvtGetRandomOTP();

            pvtAddOTPInCollection(LEmail, LOtp);

            SendEmail({
                to: LEmail,
                subject: 'CRM SOFT - Your OTP is: ' + LOtp,
                html: `Hello ${LName}, <br/> <br/> <h1 style="color: green">Welcome to CRM SOFT</h1><br/>
                Your one time password is: <b> ${LOtp} </b>.<br/><br/>
                <i style="color: grey;">* Do not share this OTP with any one.</i><br/>
                <i style="color: grey;">* This is an auto generated email.</i><br/>
                <br/>
                Best Regards, <br/> CRM SOFT
                `
            }, function (p_response) {
                // Success
                // Email has been sent to your emailid
                return p_res.json({
                    success: true,
                    // response: p_response
                });
            }, function (p_error) {
                return p_res.status(500).json(ErrorObj(p_error));
            });
        });
    }
    catch (p_error) {
        return p_res.status(500).json(ErrorObj(p_error));
    }
});

module.exports = router;