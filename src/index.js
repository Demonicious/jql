const fs = require("fs");
const path = require("path");

// Utility Functions
var getNextRowID = (Table, Database) => {
    let data = fs.readFileSync(Database.path + `/${Table}.json`, "utf-8");
    let arr = JSON.parse(data)["rows"];
    let number = 0;
    if (arr == undefined) return 0;
    else {
        let final = arr[arr.length - 1];
        let keys =  Object.keys(final);
        keys.forEach((element) => {
            if (element == "id") {
                number += 1;
                number += parseInt(final.id, 10);
            } else {
                return arr.length;
            }
        })
    }
    return number;
}
var getRowAmount = (Table, Database) => {
    let data = fs.readFileSync(Database.path + `/${Table}.json`, "utf-8");
    let arr = JSON.parse(data)["rows"];
    if (arr == undefined) return 0;
    return arr.length;
}
/* var arrayRemove = (arr, value) => {
    return arr.filter(function(ele){
        return ele != value;
    });
 }
 */

class Database  {
    // Constructor Destructor
    constructor(Name, Path) {
        // Properties
        this.name = null;
        this.path = null;
        this.inUse = false;
        
        // Query Data
        this.query = null

        if (!fs.existsSync(Path)) {
            fs.mkdirSync(Path);
        }
        this.name = `${Name}`;
        this.path = path.join(path.dirname(module.parent.filename),`${Path}`);
        this.inUse = true;

        return this;
    }

    // Methods
    createTable(Name, Columns) {
        let id = 0;
        fs.readdirSync(this.path + "/", (err, files) => {
            id = files.length;
        });

        let object = {};
        object.tableInfo = {};
        object.tableInfo.id = `${id}`;
        object.tableInfo.name = `${Name}`;
        object.tableInfo.columns = [];

        if(Columns == undefined) {
            console.error("No Columns Specified.");
            process.exit();
        }
        else if(Columns.constructor === Array) {
            let id = 0;
            Columns.forEach((element) => {
                let keys = Object.keys(element);
                if (keys.length != 2 && keys[0] == "type" && keys[1] == "name") {
                    console.error("Invalid Column Specification.");
                    process.exit();
                }
                let push = { id: `${id}`, type: `${element.type}`, name: `${element.name}`};
                object.tableInfo.columns.push(push);
                id++;
            });
        } else {
            console.error("The Columns Argument should be an array.");
            process.exit();
        }

        fs.writeFileSync(this.path + `/${Name}.json`, JSON.stringify(object), function (err) {
            if (err) {
                console.error("Table already exists.")
                process.exit();
            }
        });
        return true;
    }
    updateTable(Name, Columns) {
        let id = 0;
        fs.readdirSync(this.path + "/", (err, files) => {
            id = files.length;
        });

        let object = {};
        object.tableInfo = {};
        object.tableInfo.id = `${id}`;
        object.tableInfo.name = `${Name}`;
        object.tableInfo.columns = [];

        if(Columns == undefined) {
            console.error("No Columns Specified.");
            process.exit();
        }
        else if(Columns.constructor === Array) {
            let id = 0;
            Columns.forEach((element) => {
                let keys = Object.keys(element);
                if (keys.length != 2 && keys[0] == "type" && keys[1] == "name") {
                    console.error("Invalid Column Specification.");
                    process.exit();
                }
                let push = { id: `${id}`, type: `${element.type}`, name: `${element.name}`};
                object.tableInfo.columns.push(push);
                id++;
            });
        } else {
            console.error("The Columns Argument should be an array.");
            process.exit();
        }

        try {
            if (fs.existsSync(this.path + `/${Name}.json`)) {
              fs.writeFileSync(this.path + `/${Name}.json`, JSON.stringify(object), (err) => {
                  if (err) throw err;
              })
              return true;
            }
          } catch(err) {
            console.error("Table with the name " + Name + "  does not exist.");
            process.exit();
          }
    }
    write(Table, Data) {
        this.query = null;
        if (!(Table == undefined && Data == undefined)) {
            this.query = {};
            this.query.table = `${Table}`;
            this.query.mode = "write";
            this.query.dataToWrite = Data;

            return this;
        } else {
            console.error("Invalid Write Clause Syntax. Table or Data is undefined or incorrectly defined.");
            process.exit();
        }
    }
    select(Table, Data) {
        this.query = null;
        if (!(Table == undefined && Data == undefined)) {
            this.query = {};
            this.query.table = `${Table}`;
            this.query.mode = "select";
            this.query.dataToSelect = Data;

            return this;
        } else {
            console.error("Invalid Select Clause Syntax. Table or Data is undefined or incorrectly defined.");
            process.exit();
        }
    }
    update(Table, Data) {
        this.query = null;
        if (!(Table == undefined && Data == undefined)) {
            this.query = {};
            this.query.table = `${Table}`;
            this.query.mode = "update";
            this.query.dataToWrite = Data;

            return this;
        } else {
            console.error("Invalid Update Clause Syntax. Table or Data is undefined or incorrectly defined.");
            process.exit();
        }
    }
    removeRow(Table) {
        this.query = null;
        if (!(Table == undefined)) {
            this.query = {};
            this.query.table = `${Table}`;
            this.query.mode = "remove";

            return this;
        } else {
            console.error("Invalid Remove Clause Syntax. Table is undefined or incorrectly defined.");
            process.exit();
        }
    }
    where(Data) {
        if (Object.keys(Data).length != 0) {
            this.query.where = Data;
            return this;
        } else {
            console.error("Invalid Where Clause Syntax. Data is undefined or incorrectly defined.");
            process.exit();
        }
    }
    run() {
        if (this.query != null) {
            if (this.query.mode == "write") {
                let arr = JSON.parse(fs.readFileSync(this.path + `/${this.query.table}.json`, "utf-8"));
                let columns = [];
                let object = {};
                let keys = [];
                let columnsLength = 0;
                arr.tableInfo.columns.forEach((element) => {
                    columns.push(element.name);
                    columnsLength++;
                });
                let idCount = 0;
                // let tableContent = fs.readFileSync(this.path + `/${this.query.table}.json`, "utf-8");
                let parsedContent = arr;
                if (parsedContent.rows == undefined) {
                    parsedContent.rows = [];
                }
                let writeArray = this.query.dataToWrite;
                let currentId = getNextRowID(this.query.table, this);
                writeArray.forEach((elementParent) => {
                    keys = Object.keys(elementParent);
                    keys.forEach((element) => {
                        if (columnsLength != keys.length) { console.error("Illegal Write Clause. Invalid Table Structure (Less or More Columns)."); process.exit(); }
                        if (elementParent[element] == "idincrement14890") { object[`${element}`] = `${idCount + currentId}`; }
                        else { object[`${element}`] = `${elementParent[element]}`; }
                    })
                    idCount++;
                    parsedContent.rows.push(object);
                    object = {};
                    let tableContent = JSON.stringify(parsedContent);
                    fs.writeFileSync(this.path + `/${this.query.table}.json`, tableContent)
                })
                this.query = null;
                return true;
            } else if (this.query.mode == "update") {
                if (this.query.where == undefined) {
                    fs.readFile(this.path + `/${this.query.table}.json`, (err, data) => {
                        if (err) { console.error("Table not found."); process.exit(); }
                        let arr = JSON.parse(data);
                        for (var i = 0; i < getRowAmount(this.query.table, this); i++) {
                            Object.keys(this.query.dataToWrite).forEach((element) => {
                                arr.rows[i][element] = this.query.dataToWrite[element];
                            })
                        }
                        let json = JSON.stringify(arr);
                        fs.writeFileSync(this.path + `/${this.query.table}.json`, json);
                        this.query = null;
                    })
                    return true;
                } else if (Object.keys(this.query.where).length != 0) {
                    let arr = JSON.parse(fs.readFileSync(this.path + `/${this.query.table}.json`, "utf-8"));
                    let iter = getRowAmount(this.query.table, this);
                    let keys = Object.keys(this.query.where);
                    for (var i = 0; i < iter; i++) {
                        let writable = false;
                        let count = 1;
                        keys.forEach((item) => {
                            if (arr.rows[i][item] == this.query.where[item]) { count++ };
                        })
                        if (count - 1 == keys.length) { writable = true; }
                        Object.keys(this.query.dataToWrite).forEach((element) => {
                            if (writable) {
                                arr.rows[i][element] = this.query.dataToWrite[element];
                            }
                        })
                    }
                    let json = JSON.stringify(arr);
                    fs.writeFileSync(this.path + `/${this.query.table}.json`, json);
                    this.query = null;
                    return true;
                } else {
                    console.error("How did you even get here ?");
                    process.exit();
                }
            } else if (this.query.mode == "remove") {
                let keys = Object.keys(this.query.where);
                if (keys.length != 0) {
                    let arr = JSON.parse(fs.readFileSync(this.path + `/${this.query.table}.json`, "utf-8"));
                    let iter = getRowAmount(this.query.table, this);
                    let keys = Object.keys(this.query.where);
                    for (var i = 0; i < iter; i++) {
                        let deletable = false;
                        let count = 1;
                        keys.forEach((item) => {
                            // console.log(arr.rows);
                            if (arr.rows[i] != undefined)
                                if (arr.rows[i][item] == this.query.where[item]) { count++ };
                        })
                        if (count - 1 == keys.length) deletable = true; 
                        if (deletable) {
                            arr.rows.splice(i, 1);
                        }
                    }
                    let json = JSON.stringify(arr);
                    fs.writeFileSync(this.path + `/${this.query.table}.json`, json);
                    this.query = null;
                } else {
                    console.error("Invalid Usage of Remove Clause, Where to remove not specified");
                    process.exit();
                }
            } else if (this.query.mode == "select") {
                if (this.query.where == undefined) {
                    let returnObject = {};
                    if (this.query.dataToSelect != "*") {
                        let arr = JSON.parse(fs.readFileSync(this.path + `/${this.query.table}.json`, "utf-8"));
                        for (var i = 0; i < getRowAmount(this.query.table, this); i++) {
                            returnObject[i] = {};
                            this.query.dataToSelect.forEach((element) => {
                                if (arr.rows[i] != undefined)
                                returnObject[i][element] = arr.rows[i][element];
                            })
                        }
                        if (returnObject[0] != undefined) {
                            returnObject.success = true;
                        } else {
                            returnObject.success = false;
                        }
                        this.query = null;
                        return returnObject;
                    } else {
                        let arr = JSON.parse(fs.readFileSync(this.path + `/${this.query.table}.json`, "utf-8"));
                        for (var i = 0; i < getRowAmount(this.query.table, this); i++) {
                            returnObject[i] = {};
                            arr.rows.forEach((element) => {
                                if (arr.rows[i] != undefined)
                                returnObject[i] = arr.rows[i];
                            })
                        }
                        this.query = null;
                        if (returnObject[0] != undefined) {
                            returnObject.success = true;
                        } else {
                            returnObject.success = false;
                        }
                        return returnObject;
                    }
                } else if (Object.keys(this.query.where).length != 0) {
                    let returnObject = {};
                    if (this.query.dataToSelect != "*") {
                        let arr = JSON.parse(fs.readFileSync(this.path + `/${this.query.table}.json`, "utf-8"));
                        let iter = getRowAmount(this.query.table, this);
                        let keys = Object.keys(this.query.where);
                        let objectDeclareCounter = 0;
                        for (var i = 0; i < iter; i++) {
                            let readable = false;
                            let count = 1;
                            keys.forEach((item) => {
                                if (arr.rows[i][item] == this.query.where[item]) { count++ };
                            })
                            if (count - 1 == keys.length) { readable = true; }
                            this.query.dataToSelect.forEach((element) => {
                                if (readable) {
                                    if (arr.rows[i] != undefined) {
                                        returnObject[objectDeclareCounter] = {};
                                        returnObject[objectDeclareCounter][element] = arr.rows[i][element];
                                    }
                                }
                            })
                            if (readable) objectDeclareCounter++;
                        }
                        let json = JSON.stringify(arr);
                        // fs.writeFileSync(this.path + `/${this.query.table}.json`, json);
                        this.query = null;
                        if (returnObject[0] != undefined) {
                            returnObject.success = true;
                        } else {
                            returnObject.success = false;
                        }
                        return returnObject;
                    } else {
                        let arr = JSON.parse(fs.readFileSync(this.path + `/${this.query.table}.json`, "utf-8"));
                        let iter = getRowAmount(this.query.table, this);
                        let keys = Object.keys(this.query.where);
                        let objectDeclareCounter = 0;
                        for (var i = 0; i < iter; i++) {
                            let readable = false;
                            let count = 1;
                            keys.forEach((item) => {
                                if (arr.rows[i][item] == this.query.where[item]) { count++ };
                            })
                            if (count - 1 == keys.length) { readable = true; }
                            if (readable) {
                                if (arr.rows[i] != undefined) {
                                    returnObject[objectDeclareCounter] = arr.rows[i];
                                }
                            }
                            if (readable) objectDeclareCounter++;
                        }
                        let json = JSON.stringify(arr);
                        // fs.writeFileSync(this.path + `/${this.query.table}.json`, json);
                        this.query = null;
                        if (returnObject[0] != undefined) {
                            returnObject.success = true;
                        } else {
                            returnObject.success = false;
                        }
                        return returnObject;
                    }
                } else {
                    console.error("How did you even get here ?");
                    process.exit();
                }
            }
        }
    }
    removeTable(Table) {
        fs.unlinkSync(this.path + `/${Table}.json`);
        return true;
    }
    nextID() {
        return "idincrement14890";
    } 
    test() {
        // console.log(this);
        if (this.inUse) return true;
        else return false;
    }
};

module.exports = {
    Database: Database
}
