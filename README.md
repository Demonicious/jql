Ever wanted to use JSON as a database in an SQL-Like Environment ? Yeah me neither but still this is a thing..

## 1.) Installation

```
npm install --save demon-jql
```

## 2.) Basic Usage

```javascript
const jql = require("demon-jql");
const db = jql.establish("newDatabase", "./newDatabase"); // Name and Path

// if you wish to use another database, you'd have to use jql.establish() once again)
```

## 3.) Creating a Table

```javascript
let foodColumns = [
    {
        "type": "text",
        "name": "foodName"
    },
    {
        "type": "text",
        "name": "originCountry"
    }
]

db.createTable("food", foodColumns);

// Expected Return:- bool : true
```

## 4.) Inserting Data into Table

```javascript
let data = [
    {
        "name": "Pizza",
        "originCountry": "Italy",
    },
    {
        "name": "Lahmacun",
        "originCountry": "Turkey"
    }
]

db
.write("food", data)
.run();

// Expected Return:- bool : true
```

## 5.) Reading Data from Table.

```javascript
db
.select("food", "*") // Select Everything
.run();

// Expected Return: Object : { "0": { "name": "Pizza", "originCountry": "Italy" }, "1": { "name": "Lahmacun", "originCountry": "Turkey" }, "success": true }
// The Return object has a property of "success" which is either True/False based on if data was retrieved

db
.select("food", ["name"]) // If Selecting Columns Specifically, They need to be placed in a StringArray[] (even for individual columns) e.g ["name", "originCountry"]
.where({"originCountry": "Turkey"}) // Where Method takes in a Object as parameter.
.run();

// Expected Return:- Object : { "0" : {"name": "Pizza" }, "success": true }
```

## 6.) Updating Pre-existing Data.

```javascript
// Warning: Using .update() without .where() will Update the entire table.

db
.update("food", {"name": "Kebab"}) // Update method takes in the Table name and Object as parameters.
.where({"originCountry": "Turkey"})
.run();

// Expected Return:- bool : true
```

## 7.) Using Auto Increments

```javascript

db.createTable("users", [
    {
        "type": "number",
        "name": "id"
    },
    {
        "type": "text",
        "name": "username"
    }
])

// Expected Return:- bool : true

// If writing a Single row, It still needs to be placed inside an Array[]
db.write("users", [
    {
        "id": db.nextID(),
        "name": "Demonicious"
    }
]).run();

// Expected Return:- bool : true
```

## 8.) An Example

```javascript
const jql = require("./src/jql.js");
const db = jql.establish("db2", "./db2");

// Creating a New Table
// .run() method isn't used here.
db.createTable("someTable", [
    {
        "type": "number",
        "name": "id"
    },
    {
        "type": "text",
        "name": "name"
    }
]);

// Filling the table with Data
db.write("someTable", [
    {
        "id": db.nextID(),
        "name": "Demonicious1"
    },
    {
        "id": db.nextID(),
        "name": "Demonicious2"
    },
    {
        "id": db.nextID(),
        "name": "Demonicious3"
    },
    {
        "id": db.nextID(),
        "name": "Demonicious4"
    },
    {
        "id": db.nextID(),
        "name": "Demonicious5"
    },
    {
        "id": db.nextID(),
        "name": "Demonicious6"
    }
]).run();

// Updating a Row
// .where() is optional but without it, it will rewwrite the entire table.
db.update("someTable", {
    "name": "DemoniciousSIX"
}).where({
    "id": "5"
}).run();

// Removing a Row
db.removeRow("someTable").where({
    "id":"4"
}).run();

// Retrieving single column
// .where() is optional in Select
var data = db.select("someTable", [
    "name"
]).where({
    "id": "5"
}).run();

if (data.success) {
    console.log(data);
}

// Retrieving Multiple Columns
data = db.select("someTable", [
    "id",
    "name"
]).where({
    "id": "5"
}).run();

if (data.success) {
    console.log(data);
}

// Retrieving Everything
var data = db.select("someTable", "*").where({
    "id": "5"
}).run();

if (data.success) {
    console.log(data);
}

// Removing a Table Entirely
// .run() isn't used here.
// I removed this table just to show it can be done.
db.removeTable("someTable");
```

I plan to Make a lot of Optimizations and add more features (making it more sql-like)