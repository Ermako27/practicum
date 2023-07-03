type Indexed<T = any> = {
    [k in (string | symbol)]: T;
};

function cloneDeep<T extends Indexed>(obj: T) {
    return (function _cloneDeep(item: T): T | Date | Set<unknown> | Map<unknown, unknown> | object | T[] {
        // Handle:
        // * null
        // * undefined
        // * boolean
        // * number
        // * string
        // * symbol
        // * function
        if (item === null || typeof item !== "object") {
            return item;
        }

        // Handle:
        // * Date
        if (item instanceof Date) {
            return new Date((item as Date).valueOf());
        }

        // Handle:
        // * Array
        if (item instanceof Array) {
            let copy: ReturnType<typeof _cloneDeep>[] = [];

            item.forEach((_, i) => (copy[i] = _cloneDeep(item[i])));

            return copy;
        }

        // Handle:
        // * Set
        if (item instanceof Set) {
            let copy = new Set();

            item.forEach(v => copy.add(_cloneDeep(v)));

            return copy;
        }

        // Handle:
        // * Map
        if (item instanceof Map) {
            let copy = new Map();

            item.forEach((v, k) => copy.set(k, _cloneDeep(v)));

            return copy;
        }

        // Handle:
        // * Object
        if (item instanceof Object) {
            let copy: Indexed = {};

            // Handle:
            // * Object.symbol
            Object.getOwnPropertySymbols(item).forEach(s => (copy[s.toString()] = _cloneDeep(item[s.toString()])));

            // Handle:
            // * Object.name (other)
            Object.keys(item).forEach(k => (copy[k] = _cloneDeep(item[k])));

            return copy;
        }

        throw new Error(`Unable to copy object: ${item}`);
    })(obj);
}

const testing = (userFun)=>{
    const obj = {
        a: 1,
        b: 2,
        c: {
            d: 3
        }
    };
    const arr = [1, 2, "hello", 4]
    return (JSON.stringify(userFun(obj)) === JSON.stringify(obj) && obj !== userFun(obj) &&
        JSON.stringify(userFun(arr)) === JSON.stringify(arr) && arr !== userFun(arr) &&
        userFun(123) === 123 && userFun('hello') === 'hello' && userFun(true) === true && userFun(null) === null);
}

console.log(testing(cloneDeep));