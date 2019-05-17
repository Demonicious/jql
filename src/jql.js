const fs = require("fs");
const path = require("path");

// Utility Functions
var getNextRowID = (Table) => {
    let data = fs.readFileSync(database.path + `\\${Table}.json`, "utf-8");
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
var getRowAmount = (Table) => {
    let data = fs.readFileSync(database.path + `\\${Table}.json`, "utf-8");
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

var database = {
    // Properties
    name: null,
    path: null,
    inUse: false,

    // Query Data
    query: null,

    // Methods
    createTable: (Name, Columns) => {
        let id = 0;
        fs.readdirSync(database.path + "\\", (err, files) => {
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

        fs.writeFileSync(database.path + `\\${Name}.json`, JSON.stringify(object), function (err) {
            if (err) {
                console.error("Table already exists.")
                process.exit();
            }
        });
        return true;
    },
    updateTable: (Name, Columns) => {
        let id = 0;
        fs.readdirSync(database.path + "\\", (err, files) => {
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
            if (fs.existsSync(database.path + `\\${Name}.json`)) {
              fs.writeFileSync(database.path + `\\${Name}.json`, JSON.stringify(object), (err) => {
                  if (err) throw err;
              })
              return true;
            }
          } catch(err) {
            console.error("Table with the name " + Name + "  does not exist.");
            process.exit();
          }
    },
    write: (Table, Data) => {
        database.query = null;
        if (!(Table == undefined && Data == undefined)) {
            database.query = {};
            database.query.table = `${Table}`;
            database.query.mode = "write";
            database.query.dataToWrite = Data;

            return database;
        } else {
            console.error("Invalid Write Clause Syntax. Table or Data is undefined or incorrectly defined.");
            process.exit();
        }
    },
    select: (Table, Data) => {
        database.query = null;
        if (!(Table == undefined && Data == undefined)) {
            database.query = {};
            database.query.table = `${Table}`;
            database.query.mode = "select";
            database.query.dataToSelect = Data;

            return database;
        } else {
            console.error("Invalid Select Clause Syntax. Table or Data is undefined or incorrectly defined.");
            process.exit();
        }
    },
    update: (Table, Data) => {
        database.query = null;
        if (!(Table == undefined && Data == undefined)) {
            database.query = {};
            database.query.table = `${Table}`;
            database.query.mode = "update";
            database.query.dataToWrite = Data;

            return database;
        } else {
            console.error("Invalid Update Clause Syntax. Table or Data is undefined or incorrectly defined.");
            process.exit();
        }
    },
    removeRow: (Table) => {
        database.query = null;
        if (!(Table == undefined)) {
            database.query = {};
            database.query.table = `${Table}`;
            database.query.mode = "remove";

            return database;
        } else {
            console.error("Invalid Remove Clause Syntax. Table is undefined or incorrectly defined.");
            process.exit();
        }
    },
    where: (Data) => {
        if (Object.keys(Data).length != 0) {
            database.query.where = Data;
            return database;
        } else {
            console.error("Invalid Where Clause Syntax. Data is undefined or incorrectly defined.");
            process.exit();
        }
    },
    run: () => {
        if (database.query != null) {
            if (database.query.mode == "write") {
                let arr = JSON.parse(fs.readFileSync(database.path + `\\${database.query.table}.json`, "utf-8"));
                let columns = [];
                let object = {};
                let keys = [];
                let columnsLength = 0;
                arr.tableInfo.columns.forEach((element) => {
                    columns.push(element.name);
                    columnsLength++;
                });
                let idCount = 0;
                // let tableContent = fs.readFileSync(database.path + `\\${database.query.table}.json`, "utf-8");
                let parsedContent = arr;
                if (parsedContent.rows == undefined) {
                    parsedContent.rows = [];
                }
                let writeArray = database.query.dataToWrite;
                let currentId = getNextRowID(database.query.table);
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
                    fs.writeFileSync(database.path + `\\${database.query.table}.json`, tableContent)
                })
                database.query = null;
                return true;
            } else if (database.query.mode == "update") {
                if (database.query.where == undefined) {
                    fs.readFile(database.path + `\\${database.query.table}.json`, (err, data) => {
                        if (err) { console.error("Table not found."); process.exit(); }
                        let arr = JSON.parse(data);
                        for (var i = 0; i < getRowAmount(database.query.table); i++) {
                            Object.keys(database.query.dataToWrite).forEach((element) => {
                                arr.rows[i][element] = database.query.dataToWrite[element];
                            })
                        }
                        let json = JSON.stringify(arr);
                        fs.writeFileSync(database.path + `\\${database.query.table}.json`, json);
                        database.query = null;
                    })
                    return true;
                } else if (Object.keys(database.query.where).length != 0) {
                    let arr = JSON.parse(fs.readFileSync(database.path + `\\${database.query.table}.json`, "utf-8"));
                    let iter = getRowAmount(database.query.table);
                    let keys = Object.keys(database.query.where);
                    for (var i = 0; i < iter; i++) {
                        let writable = false;
                        let count = 1;
                        keys.forEach((item) => {
                            if (arr.rows[i][item] == database.query.where[item]) { count++ };
                        })
                        if (count - 1 == keys.length) { writable = true; }
                        Object.keys(database.query.dataToWrite).forEach((element) => {
                            if (writable) {
                                arr.rows[i][element] = database.query.dataToWrite[element];
                            }
                        })
                    }
                    let json = JSON.stringify(arr);
                    fs.writeFileSync(database.path + `\\${database.query.table}.json`, json);
                    database.query = null;
                    return true;
                } else {
                    console.error("How did you even get here ?");
                    process.exit();
                }
            } else if (database.query.mode == "remove") {
                let keys = Object.keys(database.query.where);
                if (keys.length != 0) {
                    let arr = JSON.parse(fs.readFileSync(database.path + `\\${database.query.table}.json`, "utf-8"));
                    let iter = getRowAmount(database.query.table);
                    let keys = Object.keys(database.query.where);
                    for (var i = 0; i < iter; i++) {
                        let deletable = false;
                        let count = 1;
                        keys.forEach((item) => {
                            // console.log(arr.rows);
                            if (arr.rows[i] != undefined)
                                if (arr.rows[i][item] == database.query.where[item]) { count++ };
                        })
                        if (count - 1 == keys.length) deletable = true; 
                        if (deletable) {
                            arr.rows.splice(i, 1);
                        }
                    }
                    let json = JSON.stringify(arr);
                    fs.writeFileSync(database.path + `\\${database.query.table}.json`, json);
                    database.query = null;
                } else {
                    console.error("Invalid Usage of Remove Clause, Where to remove not specified");
                    process.exit();
                }
            } else if (database.query.mode == "select") {
                if (database.query.where == undefined) {
                    let returnObject = {};
                    if (database.query.dataToSelect != "*") {
                        let arr = JSON.parse(fs.readFileSync(database.path + `\\${database.query.table}.json`, "utf-8"));
                        for (var i = 0; i < getRowAmount(database.query.table); i++) {
                            returnObject[i] = {};
                            database.query.dataToSelect.forEach((element) => {
                                if (arr.rows[i] != undefined)
                                returnObject[i][element] = arr.rows[i][element];
                            })
                        }
                        if (returnObject[0] != undefined) {
                            returnObject.success = true;
                        } else {
                            returnObject.success = false;
                        }
                        database.query = null;
                        return returnObject;
                    } else {
                        let arr = JSON.parse(fs.readFileSync(database.path + `\\${database.query.table}.json`, "utf-8"));
                        for (var i = 0; i < getRowAmount(database.query.table); i++) {
                            returnObject[i] = {};
                            arr.rows.forEach((element) => {
                                if (arr.rows[i] != undefined)
                                returnObject[i] = arr.rows[i];
                            })
                        }
                        database.query = null;
                        if (returnObject[0] != undefined) {
                            returnObject.success = true;
                        } else {
                            returnObject.success = false;
                        }
                        return returnObject;
                    }
                } else if (Object.keys(database.query.where).length != 0) {
                    let returnObject = {};
                    if (database.query.dataToSelect != "*") {
                        let arr = JSON.parse(fs.readFileSync(database.path + `\\${database.query.table}.json`, "utf-8"));
                        let iter = getRowAmount(database.query.table);
                        let keys = Object.keys(database.query.where);
                        let objectDeclareCounter = 0;
                        for (var i = 0; i < iter; i++) {
                            let readable = false;
                            let count = 1;
                            keys.forEach((item) => {
                                if (arr.rows[i][item] == database.query.where[item]) { count++ };
                            })
                            if (count - 1 == keys.length) { readable = true; }
                            database.query.dataToSelect.forEach((element) => {
                                if (readable) {
                                    if (arr.rows[i] != undefined) {
                                        returnObject[objectDeclareCounter] = {};
                                        returnObject[objectDeclareCounter][element] = arr.rows[i][element];
                                    }
                                }
                            })
                            objectDeclareCounter++;
                        }
                        let json = JSON.stringify(arr);
                        // fs.writeFileSync(database.path + `\\${database.query.table}.json`, json);
                        database.query = null;
                        if (returnObject[0] != undefined) {
                            returnObject.success = true;
                        } else {
                            returnObject.success = false;
                        }
                        return returnObject;
                    } else {
                        let arr = JSON.parse(fs.readFileSync(database.path + `\\${database.query.table}.json`, "utf-8"));
                        let iter = getRowAmount(database.query.table);
                        let keys = Object.keys(database.query.where);
                        let objectDeclareCounter = 0;
                        for (var i = 0; i < iter; i++) {
                            let readable = false;
                            let count = 1;
                            keys.forEach((item) => {
                                if (arr.rows[i][item] == database.query.where[item]) { count++ };
                            })
                            if (count - 1 == keys.length) { readable = true; }
                            if (readable) {
                                if (arr.rows[i] != undefined) {
                                    returnObject[objectDeclareCounter] = arr.rows[i];
                                }
                            }
                            objectDeclareCounter++;
                        }
                        let json = JSON.stringify(arr);
                        // fs.writeFileSync(database.path + `\\${database.query.table}.json`, json);
                        database.query = null;
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
    },
    removeTable: (Table) => {
        fs.unlinkSync(database.path + `\\${Table}.json`);
        return true;
    },
    nextID: () => {
        return "idincrement14890";
    },
    test: () => {
        if (database.inUse) console.log("Database is working.");
        else { console.error("Database isn't working"); process.exit() }
        return database;
    }
};

module.exports = {
    newDatabase: (DatabaseName, DatabasePath) => {
        if (!fs.existsSync(DatabasePath)) {
            fs.mkdirSync(DatabasePath);
        }
        database.name = `${DatabaseName}`;
        database.path = path.join(__dirname, '../../..', `${DatabasePath}`);
        database.inUse = true;
        
        return database;
    }
}