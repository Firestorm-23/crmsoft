
const express = require('express');
const { isEmailValid, isObjEmpty, ErrorObj } = require('../local/tsclsGenUtils');
const router = express.Router();

const FDb = require('../tsclsDatabase');
const { SendEmail } = require('../tsclsSendMail');

//Creting new one
router.post('/', async (p_req, p_res) => {

    try {

        var LSql = `SELECT id, isActive, projectId FROM users where username='${p_req.body.username}' and password='${p_req.body.password}'`;

        FDb.all(LSql, [], (err, p_arrRecords) => {
            //If error
            if (err) {
                return p_res.json({ success: false, message: err.message });
            }

            var LObj = p_arrRecords[0] || null;

            //If success
            if (LObj === null || LObj === undefined) {

                return p_res.json({ success: false, message: 'Incorrect credentials, try again.' });
            }//if..

            if (LObj.isActive !== 1) {

                return p_res.json({ success: false, message: 'This user is not activited.' });
            }//if..

            p_res.json({ success: true, message: 'Valid User..', userId: LObj.id, projectId: LObj.projectId });
        });
    }
    catch (p_error) {

        return p_res.status(500).json(ErrorObj(p_error));
    }
});

router.put('/forgotpassword', async (p_req, p_res) => {

    const LEmail = p_req.body.email;

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

            if (isObjEmpty(LRecord) === true) {
                return p_res.status(500).json(ErrorObj({ message: 'Account not found for this email, try to SignUp.' }));
            }//if..

            let LInActiveMsg = '<span style="color: red">Your account is <b>in-active</b>, kindly contact with your system administrator to active.</span>';

            //Account is not activated
            if (LRecord.isActive === 1) {
                LInActiveMsg = '';
            }//if..

            SendEmail({
                to: LEmail,
                subject: 'CRM SOFT - Authentication Details',
                html: `Hello ${LRecord.displayName}, <br/> <br/>
                
                <p>Following are yours login credentials:</p>

                <ul>
                    <li>Email: ${LRecord.username}</li>
                    <li>Password: ${LRecord.password}</li>
                </ul>

                <p> ${LInActiveMsg} </p>

                <p><i style="color: grey;">* You can change your password after login (in "Manage User Account" section).</i><br/>
                <i style="color: grey;">* This email is auto generated.</i></p>
                
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