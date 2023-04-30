import { GenConstants } from './tsclsGenConstants';

export function BaseUrl() {
    // return 'http://localhost:5000/';
    if (IsDesktopApp()) {
        return 'http://localhost:5000/';
    }//if..

    return window.location.origin + '/';
}

export function IsEmailValid(p_strEmail) {

    if (isEmpty(p_strEmail)) {
        return false;
    }

    const LArrEmail = String(p_strEmail).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return Array.isArray(LArrEmail) && (LArrEmail.length > 0);
}

export function IsDesktopApp() {

    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
    }

    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
        return true;
    }

    // Detect the user agent when the `nodeIntegration` option is set to true
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
    }

    return false;
}

export function OriginUrl() {

    // return window.location.origin + '/';
    return '';
}

var FObjLoggedInUserDetails = {};
var FInvoiceTypeArr = [];

export function LogOut(p_objHistoryProp) {
    /**
     * INTENT: This function will logout the user
     * Go to Login Page
     */

    FObjLoggedInUserDetails = {};
    tsSaveInLocalStorage('LoggedInUserDetails', JSON.stringify(FObjLoggedInUserDetails));

    tsSaveInLocalStorage('userDetailsForAppBar', '');

    tsClearCache();

    if (isEmpty(p_objHistoryProp)) {

        if (window.location.pathname === '/login') {
            return;
        }

        window.location.pathname = '/login';
    }

    p_objHistoryProp.push('/login');
}

export function tsClearCache() {

    tsSaveInLocalStorage('tsLastSelectedInvoiceType', '');
    tsSaveInLocalStorage('tsLastSelectedState', '');
}

export function tsLogin(p_username, p_password, p_params) {
    /**
     * INTENT: This function will login the user
     */

    if (isEmpty(p_username) || isEmpty(p_password)) {

        window.location.pathname = '/login';
        return false;
    }//if..

    // localStorage.setItem('tsKey1', btoa(p_username));
    // localStorage.setItem('tsKey2', btoa(p_password));
    // localStorage.setItem('tsLoggenUserId', p_params.userId);

    FObjLoggedInUserDetails = {
        tsKey1: p_username,
        tsKey2: p_password,
        tsLoggenUserId: p_params.userId || p_params.id,
        tsProjectId: p_params.projectId
    };

    tsSaveInLocalStorage('LoggedInUserDetails', JSON.stringify(FObjLoggedInUserDetails));
}

export function tsGetLoggedInUser() {

    if (isObjEmpty(FObjLoggedInUserDetails) === true) {

        FObjLoggedInUserDetails = JSON.parse(tsGetFromLocalStorage('LoggedInUserDetails'));
    }

    return FObjLoggedInUserDetails || {};
}

export function tsGetProjectId() {

    return tsGetLoggedInUser().tsProjectId;
}

export function tsIsUserLoggedIn() {
    /**
     * INTENT: This function will check for user session
     */

    if (isObjEmpty(tsGetLoggedInUser()) === true) {

        return false;
    }//if..

    return true;
}

export function tsIsMobileView() {

    // Setting the mobile min width
    if (window.innerWidth < 800) {

        return true;
    }

    return false;
}

export function tsGetTimeBySeconds(p_sec) {
    var d = Number(p_sec);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    // var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    // var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    // var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";

    var hDisplay = h > 0 ? h + ':' : "";
    var mDisplay = m + ':';
    var sDisplay = s.toString().length === 1 ? '0' + s : s;


    return hDisplay + mDisplay + sDisplay;
}

export function tsSearchTree(p_objTree, p_field, p_val) {
    /**
     * @method tsSearchTree
     * This method will search the p_objTree in tree and return the obj
     * 
     * @public
     * 
     * @param {Object}: Tree Object
     * @param {String}: Field to search
     * @param {String}: Value of given field
     * 
     * @returns {Object}: Tree Node
     */

    if (p_objTree[p_field] === p_val) {

        return p_objTree;
    }//if..
    else if (p_objTree.children != null) {

        var LIndex,
            LResult = null;

        for (LIndex = 0; LResult == null && LIndex < p_objTree.children.length; LIndex++) {

            LResult = tsSearchTree(p_objTree.children[LIndex], p_field, p_val);
        }//for..

        return LResult;
    }//else if..

    return null;
}

export function isEmpty(value, allowEmptyString) {
    /**
     * Returns true if the passed value is empty, false otherwise. The value is deemed to be empty if it is either:
     *
     * - `null`
     * - `undefined`
     * - a zero-length array
     * - a zero-length string (Unless the `allowEmptyString` parameter is set to `true`)
     *
     * @param {Object} value The value to test.
     * @param {Boolean} [allowEmptyString=false] `true` to allow empty strings.
     * @return {Boolean}
     */

    return (value == null) || (!allowEmptyString ? value === '' : false) || (isArray(value) && value.length === 0);
}

export function isObjEmpty(object) {
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

export function isArray(value) {
    /**
    * Returns `true` if the passed value is a JavaScript Array, `false` otherwise.
    *
    * @param {Object} target The target to test.
    * @return {Boolean}
    * @method
    */
    return toString.call(value) === '[object Array]';
}

export function isDate(value) {
    /**
    * Returns `true` if the passed value is a JavaScript Date object, `false` otherwise.
    * @param {Object} object The object to test.
    * @return {Boolean}
    */
    return toString.call(value) === '[object Date]';
}

export function FindRecordInArrOfObj(p_array, p_property, p_value) {
    /**
     * @method FindRecordInArrOfObj
     *   This method will find the element in array and return the result
    */

    var LResult = null;

    if (isEmpty(p_array) === true || isEmpty(p_property) === true || isEmpty(p_value) === true) {
        return LResult;
    }//if..

    p_array.forEach(function (p_objRecord) {

        if (p_objRecord[p_property] === p_value) {

            LResult = p_objRecord;
            return false;
        }//if..
    });//forEach..

    return LResult;
}

export function tsGetDateFromServerDateForInpField(p_jsDate) {
    /**
     * @method tsGetDateFromServerDateForInpField
     *   This method will returns the date
    */

    var LDispDate = '';
    // LMonth,
    // LDate;

    if (isEmpty(p_jsDate) === true) {

        return LDispDate;
    }//if..

    var LDateObj = new Date(p_jsDate);

    if (isEmpty(LDateObj) === true) {

        return LDispDate;
    }

    return LDateObj.toLocaleString();
}

export function tsGetDateFromServerDateForPrintField(p_jsDate) {
    /**
     * @method tsGetDateFromServerDateForPrintField
     *   This method will returns the date
    */

    var LDispDate = '';

    if (isEmpty(p_jsDate) === true) {

        return LDispDate;
    }//if..

    var LDateObj = new Date(p_jsDate);

    if (isEmpty(LDateObj) === true) {

        return LDispDate;
    }

    // return LDateObj.toLocaleString();
    return LDateObj.toLocaleDateString();
}

export function tsSetInvoiceType(p_arrInvoiceTypes) {

    FInvoiceTypeArr = p_arrInvoiceTypes || [];
}

export function tsGetInvoiceTypes(p_boolCanIncludeSystemTypes) {

    var LResult = cloneVar(FInvoiceTypeArr) || [];

    if (p_boolCanIncludeSystemTypes === true) {

        LResult.push(
            {
                SINGULAR_NAME: GenConstants().PAYMENT_IN,
                NAME: GenConstants().PAYMENT_IN,
                ACT_CODE: GenConstants().PAYMENT_IN_ACT_CODE,
                INVOICE_NO_STARTS_WITH: 'I-'
            },
            {
                SINGULAR_NAME: GenConstants().PAYMENT_OUT,
                NAME: GenConstants().PAYMENT_OUT,
                ACT_CODE: GenConstants().PAYMENT_OUT_ACT_CODE,
                INVOICE_NO_STARTS_WITH: 'I-'
            }
        );
    }

    return LResult;
}

export function tsGetInvoiceDispNameByActionCode(p_strActionCode) {

    var LDispName = p_strActionCode;

    var LInvoiceTypeArr = tsGetInvoiceTypes(true);

    LInvoiceTypeArr.some(function (p_objRecord) {

        if (p_strActionCode === p_objRecord.ACT_CODE) {

            LDispName = p_objRecord.SINGULAR_NAME;
            return true;
        }//if..

        return false;
    });

    return LDispName;
}

export function tsGetPaymentModes() {
    /**
     * @method tsGetPaymentModes
     * This method will return the menu items for payment type
     */
    return [
        {
            name: 'Cash'
        },
        {
            name: 'Cheque'
        },
        {
            name: 'UPI'
        },
        {
            name: 'Mobile Wallet'
        },
        {
            name: 'Bank Transfer'
        },
        {
            name: 'Credit'
        }
    ];
}

export function cloneVar(item, cloneDom) {
    /**
     * Clone simple variables including array, {}-like objects, DOM nodes and Date without keeping the old reference.
     * A reference for the object itself is returned if it's not a direct descendant of Object.
     *
     * @param {Object} item The variable to clone
     * @param {Boolean} [cloneDom=true] `true` to clone DOM nodes.
     * @return {Object} clone
     */

    if (item === null || item === undefined) {
        return item;
    }

    // DOM nodes
    // recursively
    if (cloneDom !== false && item.nodeType && item.cloneNode) {
        return item.cloneNode(true);
    }

    var type = toString.call(item),
        i, j, k, clone, key;

    // Date
    if (type === '[object Date]') {
        return new Date(item.getTime());
    }

    // Array
    if (type === '[object Array]') {
        i = item.length;

        clone = [];

        while (i--) {
            clone[i] = cloneVar(item[i], cloneDom);
        }
    }
    // Object
    else if (type === '[object Object]' && item.constructor === Object) {
        clone = {};

        for (key in item) {
            clone[key] = cloneVar(item[key], cloneDom);
        }
        var enumerables = ['valueOf', 'toLocaleString', 'toString', 'constructor']
        if (enumerables) {
            for (j = enumerables.length; j--;) {
                k = enumerables[j];
                if (item.hasOwnProperty(k)) {
                    clone[k] = item[k];
                }
            }
        }
    }

    return clone || item;
}

function pvtPadLeadingZeros(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

export function tsGetInvoiceDispNoByInvoiceNo(p_intInvoiceNo, p_invoiceType, p_intIsPurchaserInvoice) {

    var LInvocieNo;

    p_intInvoiceNo = pvtPadLeadingZeros(p_intInvoiceNo, 3);

    var LInvoiceTypeArr = tsGetInvoiceTypes(true);

    LInvoiceTypeArr.forEach(function (p_objRecord) {

        if (p_invoiceType === p_objRecord.ACT_CODE) {

            LInvocieNo = p_objRecord.INVOICE_NO_STARTS_WITH + p_intInvoiceNo;

            //If purchaser's invoice
            if (p_intIsPurchaserInvoice === 1) {

                LInvocieNo = 'SUP ' + p_objRecord.INVOICE_NO_STARTS_WITH + p_intInvoiceNo;
            }//if..

            return false;
        }//if..
    });

    if (isEmpty(LInvocieNo) === true) {

        LInvocieNo = 'I-' + p_intInvoiceNo;
    }//if..

    return LInvocieNo;
}

export function tsIsInvoiceByType(p_invoiceType) {

    var LInvoiceTypeArr = tsGetInvoiceTypes(),
        LResult = false;

    LInvoiceTypeArr.forEach(function (p_objRecord) {

        if (p_invoiceType === p_objRecord.ACT_CODE) {

            LResult = true;
            return false;
        }//if..
    });

    return LResult;
}

export function tsGetGstAmount(p_arrProducts, p_intGrandTotal, p_strPriceField) {
    /**
     * @method pvtGetGstAmount
     * This function will return the GST
     */
    var LArrProducts = p_arrProducts || [],
        LResult,
        LGrandTotalOfCSGST = 0,
        LGST = 0;

    p_strPriceField = p_strPriceField || 'sellingPrice';

    LArrProducts.forEach(function (p_objRecord) {

        // if (p_objRecord.gstType === GenConstants().CSGST) {
        if (p_objRecord.gstType !== GenConstants().IGST) {

            LGST += (100 * (p_objRecord[p_strPriceField] * p_objRecord.qty)) / (100.0 + p_objRecord.gst);
            LGrandTotalOfCSGST += p_objRecord[p_strPriceField] * p_objRecord.qty;
        }

    });

    LResult = (LGrandTotalOfCSGST - LGST) / 2;

    LResult = LResult.toFixed(2);

    return LResult;
}

export function tsGetIGSTAmount(p_arrProducts, p_intGrandTotal, p_strPriceField) {
    /**
     * @method pvtGetGstAmount
     * This function will return the GST
     */
    var LArrProducts = p_arrProducts || [],
        LResult,
        LGrandTotalOfIGST = 0,
        LGST = 0;

    p_strPriceField = p_strPriceField || 'sellingPrice';

    LArrProducts.forEach(function (p_objRecord) {

        if (p_objRecord.gstType === GenConstants().IGST) {

            LGST += (100 * (p_objRecord[p_strPriceField] * p_objRecord.qty)) / (100.0 + p_objRecord.gst);
            LGrandTotalOfIGST += p_objRecord[p_strPriceField] * p_objRecord.qty;
        }

    });

    LResult = (LGrandTotalOfIGST - LGST);

    LResult = LResult.toFixed(2);

    return LResult;
}

export function tsGetDefaultToDate() {
    var LDate = new Date();

    return LDate.getFullYear() + '-' + ('0' + (LDate.getMonth() + 1)).slice(-2) + '-' + ('0' + LDate.getDate()).slice(-2);
}

export function tsGetDefaultFromDate() {
    var LDate = new Date();

    return LDate.getFullYear() + '-' + ('0' + (LDate.getMonth() + 1)).slice(-2) + '-01';
}

export function tsConvertNumInToWords(num) {
    var a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    var b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if ((num = num.toString()).length > 9) return 'overflow';
    var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + ' ' : '';
    return str + "Only";
}

export function tsPrintSupplierInvoice(p_invoiceType, p_invoiceNo) {
    // var LMe = this;

    if (isEmpty(p_invoiceType) || isEmpty(p_invoiceNo)) {
        return;
    }

    // var LWindow = window.open('/singleInvoice/' + p_invoiceType + '/' + p_invoiceNo);

    // LWindow.onload = function () {

    //     setTimeout(function () {
    //         LWindow.print();
    //     }, 100);
    // }

    var LParam = {
        url: OriginUrl() + '#/supplierInvoice/' + p_invoiceType + '/' + p_invoiceNo,
        landscape: true,
        pageSize: 'A5'
    };

    tsFirePrintCmd(LParam);
}

export function tsGenerateSupplierInvoicePDF(p_invoiceType, p_invoiceNo, p_callBack) {

    if (isEmpty(p_invoiceType) || isEmpty(p_invoiceNo)) {
        return;
    }

    var LParam = {
        url: OriginUrl() + '#/supplierInvoice/' + p_invoiceType + '/' + p_invoiceNo,
        landscape: true,
        pageSize: 'A5',
        downloadedFileName: tsGetInvoiceDispNoByInvoiceNo(p_invoiceNo, p_invoiceType, true) + '.pdf'
    };

    pvtGeneratePDF(LParam, p_callBack);
}

export function tsPrint(p_invoiceType, p_invoiceNo) {
    // var LMe = this;

    if (isEmpty(p_invoiceType) || isEmpty(p_invoiceNo)) {
        return;
    }

    // var LWindow = window.open('/singleInvoice/' + p_invoiceType + '/' + p_invoiceNo);

    // LWindow.onload = function () {

    //     setTimeout(function () {
    //         LWindow.print();
    //     }, 100);
    // }

    var LParam = {
        url: OriginUrl() + '#/singleInvoice/' + p_invoiceType + '/' + p_invoiceNo,
        landscape: true,
        pageSize: 'A5'
    };

    tsFirePrintCmd(LParam);
}

export function tsPaymentPrint(p_invoiceNo) {

    if (isEmpty(p_invoiceNo)) {
        return;
    }

    // var LWindow = window.open('/paymentInvoice/' + p_invoiceNo);

    // LWindow.onload = function () {

    //     setTimeout(function () {
    //         LWindow.print();
    //     }, 100);
    // }

    var LParam = {
        url: OriginUrl() + '#/paymentInvoice/' + p_invoiceNo,
        landscape: true,
        pageSize: 'A5'
    };

    tsFirePrintCmd(LParam);
}

export function tsStatementPrint(p_intCstId, p_strFromDate, p_strToDate) {

    if (isEmpty(p_intCstId) || isEmpty(p_strFromDate) || isEmpty(p_strToDate)) {
        return;
    }

    // var LWindow = window.open('/statement/' + p_intCstId + '/' + p_strFromDate + '/' + p_strToDate);

    // LWindow.onload = function () {

    //     setTimeout(function () {
    //         LWindow.print();
    //     }, 100);
    // }

    var LParam = {
        url: OriginUrl() + '#/statement/' + p_intCstId + '/' + p_strFromDate + '/' + p_strToDate,
        landscape: false,
        pageSize: 'A4'
    };

    tsFirePrintCmd(LParam);
}

export function tsFirePrintCmd(p_objParam, p_callback) {
    var LUrl;

    if (IsDesktopApp() === false) {

        var LWindow = window.open(p_objParam.url);

        LWindow.onload = function () {
            setTimeout(function () {
                LWindow.print();
            }, 100);
        };

        return;
    }

    LUrl = BaseUrl() + 'print';

    var LRequestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'projectid': tsGetProjectId()
        },
        body: JSON.stringify(p_objParam)
    };

    // No need to check for session
    fetch(LUrl, LRequestOptions)
        .then((response) => response.json())
        .then(
            (responseJson) => {
                if (responseJson.success === false) {

                    console.error(responseJson);
                    return;
                }//if..

                if (isEmpty(p_callback) === false) {

                    p_callback();
                }
            },
            (error) => {

                console.error(error);
            }
        );
}

export function tsGenerateInvoicePDF(p_invoiceType, p_invoiceNo, p_callBack) {

    if (isEmpty(p_invoiceType) || isEmpty(p_invoiceNo)) {
        return;
    }

    var LParam = {
        url: OriginUrl() + '#/singleInvoice/' + p_invoiceType + '/' + p_invoiceNo,
        landscape: true,
        pageSize: 'A5',
        downloadedFileName: tsGetInvoiceDispNoByInvoiceNo(p_invoiceNo, p_invoiceType) + '.pdf'
    };

    pvtGeneratePDF(LParam, p_callBack);
}

export function tsGeneratePaymentInvoice(p_invoiceNo, p_callBack) {

    if (isEmpty(p_invoiceNo)) {
        return;
    }

    var LParam = {
        url: OriginUrl() + '#/paymentInvoice/' + p_invoiceNo,
        landscape: true,
        pageSize: 'A5',
        downloadedFileName: tsGetInvoiceDispNoByInvoiceNo(p_invoiceNo) + '.pdf'
    };

    pvtGeneratePDF(LParam, p_callBack);
}

export function tsGenerateStatement(p_intCstId, p_strFromDate, p_strToDate, p_callBack) {

    if (isEmpty(p_intCstId) || isEmpty(p_strFromDate) || isEmpty(p_strToDate)) {
        return;
    }

    var LParam = {
        url: OriginUrl() + '#/statement/' + p_intCstId + '/' + p_strFromDate + '/' + p_strToDate,
        landscape: false,
        pageSize: 'A4',
        downloadedFileName: 'Customer Statement ' + tsGetDateFromServerDateForInpField(p_strFromDate) + ' to ' + tsGetDateFromServerDateForInpField(p_strToDate) + '.pdf'
    };

    pvtGeneratePDF(LParam, p_callBack);
}

function pvtGeneratePDF(p_objParam, p_callback) {
    var //LMe = this,
        LUrl;

    // LUrl = BaseUrl() + 'print';
    LUrl = BaseUrl() + 'pdf';

    var LRequestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'projectid': tsGetProjectId()
        },
        body: JSON.stringify(p_objParam)
    };

    // No need to check for session
    fetch(LUrl, LRequestOptions)
        .then((response) => response.json())
        .then(
            (responseJson) => {

                if (isEmpty(p_callback) === false) {

                    //most probably STOP the loading
                    p_callback(responseJson);
                }//if..

                if (responseJson.success === false) {

                    console.error(responseJson);
                    return;
                }//if..

                tsDownlodByLink(BaseUrl() + responseJson.url, p_objParam.downloadedFileName);
            },
            (error) => {

                if (isEmpty(p_callback) === false) {

                    //most probably STOP the loading
                    p_callback(error);
                }//if..

                console.error(error);
            }
        );
}

export function tsDownlodByLink(p_url, p_strDownloadedFileName) {

    var LAnchor = document.createElement('a');
    LAnchor.setAttribute('href', p_url);
    // LAnchor.setAttribute('target', '_blank');
    LAnchor.setAttribute('download', p_strDownloadedFileName || 'File');

    LAnchor.click();
}

export function tsSaveInLocalStorage(p_key, p_value) {

    localStorage.setItem(p_key, p_value);
}

export function tsGetFromLocalStorage(p_key) {

    return localStorage.getItem(p_key);
}

export function tsGetDisplayTextByTaxType(p_strTaxTypeValue) {

    var LResult = '',
        LArrTaxTypes = tsGetTaxTypes() || [];

    LArrTaxTypes.some((p_objRecord) => {

        if (p_objRecord.value === p_strTaxTypeValue) {

            LResult = p_objRecord.text;
            return true;
        }

        return false;
    });

    return LResult;
}

export function tsGetTaxTypes() {

    return [
        {
            text: 'CGST & SGST',
            value: GenConstants().CSGST
        },
        {
            text: 'IGST',
            value: GenConstants().IGST
        }
    ];

    //Unused
    // return [
    //     {
    //         text: 'None 0.0%',
    //         value: 0,
    //         type: 'ggst'
    //     },
    //     {
    //         text: 'Exempted 0.0%',
    //         value: 0,
    //         type: 'ggst'
    //     },
    //     {
    //         text: 'GST 0%',
    //         value: 0,
    //         type: 'ggst'
    //     },
    //     {
    //         text: 'GST 0.25%',
    //         value: 0.25,
    //         type: 'ggst'
    //     },
    //     {
    //         text: 'GST 3%',
    //         value: 3,
    //         type: 'ggst'
    //     },
    //     {
    //         text: 'GST 5%',
    //         value: 5,
    //         type: 'ggst'
    //     },
    //     {
    //         text: 'GST 12%',
    //         value: 12,
    //         type: 'ggst'
    //     },
    //     {
    //         text: 'GST 18%',
    //         value: 18,
    //         type: 'ggst'
    //     },
    //     {
    //         text: 'GST 28%',
    //         value: 28,
    //         type: 'ggst'
    //     },

    //     {
    //         text: 'IGST 0%',
    //         value: 0,
    //         type: 'igst'
    //     },
    //     {
    //         text: 'IGST 0.25%',
    //         value: 0.25,
    //         type: 'igst'
    //     },
    //     {
    //         text: 'IGST 3%',
    //         value: 3,
    //         type: 'igst'
    //     },
    //     {
    //         text: 'IGST 5%',
    //         value: 5,
    //         type: 'igst'
    //     },
    //     {
    //         text: 'IGST 12%',
    //         value: 12,
    //         type: 'igst'
    //     },
    //     {
    //         text: 'IGST 18%',
    //         value: 18,
    //         type: 'igst'
    //     },
    //     {
    //         text: 'IGST 28%',
    //         value: 28,
    //         type: 'igst'
    //     }
    // ];
}

export function tsGetStates() {

    return [
        "01-Jammu & Kashmir",
        "02-Himachal Pradesh",
        "03-Punjab",
        "04-Chandigarh",
        "05-Uttarakhand",
        "06-Haryana",
        "07-Delhi",
        "08-Rajasthan",
        "09-Uttar Pradesh",
        "10-Bihar",
        "11-Sikkim",
        "12-Arunachal Pradesh",
        "13-Nagaland",
        "14-Manipur",
        "15-Mizoram",
        "16-Tripura",
        "17-Meghalaya",
        "18-Assam",
        "19-West Bengal",
        "20-Jharkhand",
        "21-Odisha",
        "22-Chhattisgarh",
        "23-Madhya Pradesh",
        "24-Gujarat",
        "25-Daman & Diu",
        "26-Dadra & Nagar Haveli",
        "27-Maharashtra",
        "29-Karnataka",
        "30-Goa",
        "31-Lakshdweep",
        "32-Kerala",
        "33-Tamil Nadu",
        "34-Puducherry",
        "35-Andaman & Nicobar Islands",
        "36-Telangana",
        "37-Andhra Pradesh",
        "97-Other Territory"
    ];
    // var L = [
    //     {
    //         state: "01-Jammu & Kashmir",
    //         stateId: 1
    //     },
    //     {
    //         state: "02-Himachal Pradesh",
    //         stateId: 2
    //     },
    //     {
    //         state: "03-Punjab",
    //         stateId: 3
    //     },
    //     {
    //         state: "04-Chandigarh",
    //         stateId: 4
    //     },
    //     {
    //         state: "05-Uttarakhand",
    //         stateId: 5
    //     },
    //     {
    //         state: "06-Haryana",
    //         stateId: 6
    //     },
    //     {
    //         state: "07-Delhi",
    //         stateId: 7
    //     },
    //     {
    //         state: "08-Rajasthan",
    //         stateId: 8
    //     },
    //     {
    //         state: "09-Uttar Pradesh",
    //         stateId: 9
    //     },
    //     {
    //         state: "10-Bihar",
    //         stateId: 10
    //     },
    //     {
    //         state: "11-Sikkim",
    //         stateId: 11
    //     },
    //     {
    //         state: "12-Arunachal Pradesh",
    //         stateId: 12
    //     },
    //     {
    //         state: "13-Nagaland",
    //         stateId: 13
    //     },
    //     {
    //         state: "14-Manipur",
    //         stateId: 14
    //     },
    //     {
    //         state: "15-Mizoram",
    //         stateId: 15
    //     },
    //     {
    //         state: "16-Tripura",
    //         stateId: 16
    //     },
    //     {
    //         state: "17-Meghalaya",
    //         stateId: 17
    //     },
    //     {
    //         state: "18-Assam",
    //         stateId: 18
    //     },
    //     {
    //         state: "19-West Bengal",
    //         stateId: 19
    //     },
    //     {
    //         state: "20-Jharkhand",
    //         stateId: 20
    //     },
    //     {
    //         state: "21-Odisha",
    //         stateId: 21
    //     },
    //     {
    //         state: "22-Chhattisgarh",
    //         stateId: 22
    //     },
    //     {
    //         state: "23-Madhya Pradesh",
    //         stateId: 23
    //     },
    //     {
    //         state: "24-Gujarat",
    //         stateId: 24
    //     },
    //     {
    //         state: "25-Daman & Diu",
    //         stateId: 25
    //     },
    //     {
    //         state: "26-Dadra & Nagar Haveli",
    //         stateId: 26
    //     },
    //     {
    //         state: "27-Maharashtra",
    //         stateId: 27
    //     },
    //     {
    //         state: "29-Karnataka",
    //         stateId: 29
    //     },
    //     {
    //         state: "30-Goa",
    //         stateId: 30
    //     },
    //     {
    //         state: "31-Lakshdweep",
    //         stateId: 31
    //     },
    //     {
    //         state: "32-Kerala",
    //         stateId: 32
    //     },
    //     {
    //         state: "33-Tamil Nadu",
    //         stateId: 33
    //     },
    //     {
    //         state: "34-Puducherry",
    //         stateId: 34
    //     },
    //     {
    //         state: "35-Andaman & Nicobar Islands",
    //         stateId: 35
    //     },
    //     {
    //         state: "36-Telangana",
    //         stateId: 36
    //     },
    //     {
    //         state: "37-Andhra Pradesh",
    //         stateId: 37
    //     },
    //     {
    //         state: "97-Other Territory",
    //         stateId: 97
    //     }];
}