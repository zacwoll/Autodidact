function filterInt(value) {
    if (/^[-+]?(\d+|Infinity)$/.test(value)) {
        return Number(value);
    } else {
        return NaN;
    }
}

// Take in object, clean out keys that still have undefined values, return object
function cleanUndefinedEntries(object) {
    let obj = object;
    Object.keys(obj).forEach(key => {
        if (obj[ key ] === undefined) {
            delete obj[ key ];
        }
    });
    return obj;
}

module.exports = { filterInt, cleanUndefinedEntries };