
function ErrorObj(p_error) {

    return {
        message: p_error.message,
        success: false
    }//return..
};

function isEmpty(value, allowEmptyString) {
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

function isObjEmpty(object) {
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

function isArray(value) {
    /**
    * Returns `true` if the passed value is a JavaScript Array, `false` otherwise.
    *
    * @param {Object} target The target to test.
    * @return {Boolean}
    * @method
    */
    return toString.call(value) === '[object Array]';
}

function isEmailValid(p_strEmail) {

    if (isEmpty(p_strEmail)) {
        return false;
    }

    const LArrEmail = String(p_strEmail).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return Array.isArray(LArrEmail) && (LArrEmail.length > 0);
}

module.exports = {
    ErrorObj,
    isEmpty,
    isObjEmpty,
    isArray,
    isEmailValid
};