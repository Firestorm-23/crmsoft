const FNodemailer = require('nodemailer');

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2("219042882611-nj8j52g8o0c1qttgcl9bh6bmr5f4b26v.apps.googleusercontent.com",//clientId
   "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", // Client Secret
   "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
   refresh_token: "1//04bypxeBke-KuCgYIARAAGAQSNgF-L9IrCPGr33lCZeZTDAiatqcNeJYkhcUJlr09Y6EUFUAOhJBKldb7W9_KFf0CcOYhJ8FOXw"
});

function SendEmail(p_objMailOption, p_callBackOnSuccess, p_callBackOnFailure) {

   const LTransporter = FNodemailer.createTransport({
      service: 'gmail',
      auth: {
         type: "OAuth2",
         user: 'crrm.soft@gmail.com',
         pass: 'Crm@1234',
         clientId: "219042882611-nj8j52g8o0c1qttgcl9bh6bmr5f4b26v.apps.googleusercontent.com",
         clientSecret: "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",
         refreshToken: "1//04bypxeBke-KuCgYIARAAGAQSNgF-L9IrCPGr33lCZeZTDAiatqcNeJYkhcUJlr09Y6EUFUAOhJBKldb7W9_KFf0CcOYhJ8FOXw",
         accessToken: oauth2Client.getAccessToken(),
         rejectUnauthorized: false
      }
   });

   // For Refrence
   // let LMailOptions = {
   //    from: 'Crrm@soft@gmail.com',
   //    to: 'ss@yahoo.com',
   //    subject: 'Sending Email using Node.js',
   //    text: 'That was easy!'
   // };

   let LMailOptions = p_objMailOption || {};

   LMailOptions.from = 'crrm.soft@gmail.com';
   LMailOptions.generateTextFromHTML = true;

   LTransporter.sendMail(LMailOptions, function (error, info) {
      if (error) {
         p_callBackOnFailure(error);
      } else {
         p_callBackOnSuccess(info.response);
      }
   });
}


module.exports = { SendEmail };