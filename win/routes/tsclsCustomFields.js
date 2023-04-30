
const express = require('express');
const router = express.Router();

const FDb = require('../tsclsDatabase');

const GenConstant = require('../tsclsGenConstants');
var { ErrorObj, isEmpty } = require('../local/tsclsGenUtils');

//Getting all customFields fields
router.get('/type/:type', async (p_req, p_res) => {
   try {

      var LProjectId = p_req.headers.projectid;

      if (isEmpty(LProjectId) === true) {

         return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
      }//if..

      var sql = `SELECT * FROM customFields WHERE type='${p_req.params.type}' AND projectId=${LProjectId}`;

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

router.get('/type/:type/:invoiceType', async (p_req, p_res) => {
   try {

      var LProjectId = p_req.headers.projectid;

      if (isEmpty(LProjectId) === true) {

         return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
      }//if..

      var sql = `SELECT * FROM customFields WHERE type='${p_req.params.type}' AND invoiceType='${p_req.params.invoiceType}' AND projectId=${LProjectId}`;

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

   var LId = parseInt(p_req.params.id);

   var L_fun = function (p_objRecord) {

      p_res.json(p_objRecord || {});
   };

   pvtGetFieldById(L_fun, LId, LProjectId);
});

function pvtGetTableName(p_type) {

   var LResult;
   switch (p_type) {

      case GenConstant().CUSTOMER_CSTM_FIELDS:
         LResult = 'customers';
         break;
      case GenConstant().PRODUCT_CSTM_FIELDS:
         LResult = 'products';
         break;
      case GenConstant().STOCK_CSTM_FIELDS:
         LResult = 'stock';
         break;
   }

   return LResult;
}

//Creting new one
router.post('/', async (p_req, p_res) => {

   var LProjectId = p_req.headers.projectid;

   if (isEmpty(LProjectId) === true) {

      return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
   }//if..

   var L_fun = function (p_objRecord) {

      p_res.json(p_objRecord || {});
   };

   var LColumnName = pvtGetFieldColumnName(p_req.body.fieldName);

   var LIsRequired = p_req.body.isRequired ? 1 : 0,
      LTableName = pvtGetTableName(p_req.body.type),
      LInvoiceType = p_req.body.invoiceType || '';

   try {
      // insert one row into the customFields table
      FDb.run(`ALTER TABLE ${LTableName} ADD ${LColumnName} TEXT`,
         [], function (p_error) {
            if (p_error) {

               var LErrorMsg = p_error.message;

               //Not Raising error if duplicate column finds in DB
               if (LErrorMsg.search("duplicate column name") === -1) {
                  // p_error.message = 'Field name must be unique';
                  return p_res.status(500).json(ErrorObj(p_error));
               }//if..
            }

            FDb.run(`INSERT INTO customFields (fieldName, fieldType, type, columnName, isRequired, invoiceType, projectId) VALUES('${p_req.body.fieldName}', '${p_req.body.fieldType}', '${p_req.body.type}', '${LColumnName}', ${LIsRequired}, '${LInvoiceType}', ${LProjectId})`, [], function (p_error) {
               if (p_error) {

                  return p_res.status(500).json(ErrorObj(p_error));
               }//if..

               pvtGetFieldById(L_fun, this.lastID, LProjectId);
            });
         });
   }
   catch (p_error) {

      return p_res.status(500).json(ErrorObj(p_error));
   }
});

//Delete the user by id
router.delete('/:id', async (p_req, p_res) => {
   try {

      var LProjectId = p_req.headers.projectid;

      if (isEmpty(LProjectId) === true) {

         return p_res.status(500).json(ErrorObj({ message: GenConstant().ERROR_MSG_FOR_INVALID_USER }));
      }//if..

      // delete one row into the langs table
      // var Lfun = function (p_objRecord) {

      FDb.run(`DELETE FROM customFields WHERE id=${p_req.params.id} AND projectId=${LProjectId}`, [], function (p_error) {

         if (p_error) {

            return p_res.status(500).json(ErrorObj(p_error));
         }//if..

         //SQLite - NOT Support DROP command
         // var LColumnName = p_objRecord.columnName;
         // //DROP table column in customer table
         // var LAlterCommand = `ALTER TABLE customers DROP COLUMN ${LColumnName} `;

         // FDb.run(LAlterCommand, [], function (err) {
         //    if (err) {
         //       console.log(err.message);
         //       return p_res.status(500).json(
         //          {
         //             message: err.message,
         //             success: false
         //          }
         //       );
         //    }
         // });

         p_res.json({
            success: true,
            message: 'Field Deleted.',
            id: parseInt(p_req.params.id)
         });
      });
      // };

      // pvtGetFieldById(Lfun, p_req.params.id, LProjectId);

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

   var LUpdateQuery = '',
      LColumnName = pvtGetFieldColumnName(p_req.body.fieldName) || null;

   if (p_req.body.fieldName != null || LColumnName !== null) {

      LUpdateQuery += 'fieldName="' + p_req.body.fieldName + '"';
      LUpdateQuery += ', fieldType="' + p_req.body.fieldType + '"';
      LUpdateQuery += ', type="' + p_req.body.type + '"';

      //We are not changing column name once its fixed
      // LUpdateQuery += ', columnName="' + LColumnName + '"';

      var LIsRequired = p_req.body.isRequired ? 1 : 0;
      //Integer
      LUpdateQuery += ', isRequired=' + LIsRequired;
   }
   else {

      return p_res.status(500).json(ErrorObj({ message: 'Something Wrong' }));
   }

   try {

      var LId = parseInt(p_req.params.id);

      var LSql = `UPDATE customFields SET ${LUpdateQuery} WHERE id=${LId} AND projectId=${LProjectId}`;

      var L_fun = function (p_objRecord) {

         p_res.json(p_objRecord || {});
      };

      // update one row into the langs table
      FDb.run(LSql,
         [], function (p_error) {
            if (p_error) {

               return p_res.status(500).json(ErrorObj(p_error));
            }//if..

            pvtGetFieldById(L_fun, LId, LProjectId);
         });
   }
   catch (p_error) {

      return p_res.status(500).json(ErrorObj(p_error));
   }
});

function pvtGetFieldById(p_callback, p_intId, p_intProjectId) {
   /**
    * @method pvtGetFieldById
    * This method will return the field and call callback function
    * 
    * @param
    * {callback} - function
    * {id} - User Id
    */

   var sql = `SELECT * FROM customFields where id=${p_intId} AND projectId=${p_intProjectId}`;

   FDb.all(sql, [], (p_error, rows) => {
      if (p_error) {

         return p_callback(ErrorObj(p_error));
      }//if..

      if (p_callback) {

         p_callback(rows[0]);
      }
   });
}

function pvtGetFieldColumnName(p_fieldName) {

   if (p_fieldName === undefined || p_fieldName === null) {
      return '';
   }

   var LColumnName = p_fieldName;

   LColumnName = LColumnName.split(" ");
   LColumnName = LColumnName.join("");
   LColumnName = LColumnName.toUpperCase();

   LColumnName = 'CSTM_CST_' + LColumnName;

   return LColumnName;
}

module.exports = router;
