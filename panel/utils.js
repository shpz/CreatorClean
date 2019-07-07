const path = require("path");
const fs = require("fs");
const ffs = require("fire-fs")

let utils = {

    /**
     * @param {string} fileName 
     * @param {string} lookingForString 
     * @param {Array} items 
     * @returns {void}
     */
    recursiveReadFile(fileName, lookingForString, items) {
        if (!fs.existsSync(fileName)) {
            return;
        }

        if (utils.isFile(fileName)) {
            utils.check(fileName, lookingForString, items);
        }

        if (utils.isDirectory(fileName)) {
            let files = fs.readdirSync(fileName);
            files.forEach(function (val, key) {
                let temp = path.join(fileName, val);
                if (utils.isDirectory(temp)) {
                    utils.recursiveReadFile(temp, lookingForString, items);
                }

                if (utils.isFile(temp)) {
                    utils.check(temp, lookingForString, items);
                }
            })
        }
    },

    /**
     * @param {string} fileName 
     * @param {string} lookingForString
     * @returns {void}
     */
    check(fileName, lookingForString) {
        let data = utils.readFile(fileName);
        let exc = new RegExp(lookingForString);

        if (exc.test(data)) {
            return true;
        }

        return false;
    },

    /**
     * @param {string} fileName 
     * @returns {boolean}
     */
    isDirectory(fileName) {
        if (fs.existsSync(fileName)) {
            return fs.statSync(fileName).isDirectory();
        }

        return false;
    },

    /**
     * @param {string} fileName 
     * @returns {boolean}
     */
    isFile(fileName) {
        if (fs.existsSync(fileName)) {
            return fs.statSync(fileName).isFile();
        }

        return false;
    },

    /**
     * 使用 uuid 获取 json
     * @param {string} uuid 
     * @returns {Object}
     */
    getJsonByUuid(uuid) {
        let path = Editor.assetdb.remote.uuidToFspath(uuid);

        return ffs.readJsonSync(path);
    },

    /**
     * @param {string} fileName 
     * @returns {boolean}
     */
    readFile(fileName) {
        if (fs.existsSync(fileName)) {
            return fs.readFileSync(fileName, "utf-8");
        }

        return false;
    },

    /**
     * 查询重复的键
     * @param {any} zh
     * @returns {Array}
     */
    queryDuplicatesKey(zh) {
        let array = Object.keys(zh);
        let result = []

        while (array.length > 0) {
            let key = array.pop();

            while (array.indexOf(key) != -1) {
                result.push({ key: key, value: zh[key] });
                array.splice(array.indexOf(key), 1)
            }

        }

        return result;

    },

};

module.exports = utils;