const { ThreadChannel } = require("discord.js");
const fs = require("node:fs");
const sqlite3 = require('sqlite3').verbose();

const Course = require('./course');

const schemaPath = 'data/schema.txt';
const dbPath = 'data/data.db';
const dbEditTable = 'edits';
const comment = '--';

module.exports = {
    setup: function () {
      	// setup database
        let db = new sqlite3.Database(dbPath);

        // Setup edits table, if it hasn't been done already
        initDB(db, dbEditTable).then(cat => {
            let editsCount = 0;
            // Get number of edits that have been run
            db.get('select count(editID) as editCount from edits', 
            {}, (err, row) => {
                editsCount = row.editCount;

                // Run database commands from schema file
                fs.readFile(schemaPath, function(err, f){
                    var lines = f.toString().split(/\r?\n/); // '/n' doesn't work, but this does

                    // Remove comments
                    lines = lines.filter(function(item) {
                        return item.toString().substring(0, 2) !== comment;
                    });
                    var sqlCommands = lines.join('').split('^');
        
                    // Remove whitespace
                    for (let i = 0; i < sqlCommands.length; i++) {
                        sqlCommands[i] = sqlCommands[i].trim();
                    } 

                    // Run schema edits that have not been run previously
                    for (let i = editsCount - 1; i < sqlCommands.length; i++) {
                        db.run(sqlCommands[i]);

                        // Log the edit
                        db.run('INSERT INTO ' + dbEditTable + '(editMessage, editDate)'
                            + ' VALUES($message,'
                            + ' datetime(\'now\', \'localtime\'));',
                            {
                                $message: sqlCommands[i]
                            });
                    }
                });
            });
        });
    },

    saveCourse: function(course) {
        let db = new sqlite3.Database(dbPath);

        course.saveToDB(db);
    },

    getAllCourses: function() {
        let db = new sqlite3.Database(dbPath);

        return Course.getAllCourses(db);
    },

    deleteCourse: function(dept, code, semester) {
        let db = new sqlite3.Database(dbPath);

        return Course.deleteCourse(db, dept, code, semester);
    }
};


function initDB(db, editTable) {
    return new Promise((resolve, reject) => {
        // Check if any tables exist
        db.get('SELECT count(name) as count FROM sqlite_master WHERE type=$type', 
        {
            $type: 'table'
        }, 
        (err, row) => {
            createDB(db, editTable, row).then(() => {
                resolve();
            });
        });
    });
}

function createDB(db, editTable, row) {
    return new Promise((resolve, reject) => {
        // Empty database
        if (row.count === 0) {
            // Create edits table
            db.run('CREATE TABLE ' + editTable + ' (' // Can't seem to use parameters when creating a table
                + ' editID INTEGER PRIMARY KEY,'
                + ' editMessage TEXT,'
                + ' editDate TEXT NOT NULL'
                + ' );', {}, (err, row) => {
                    db.run('INSERT INTO ' + editTable + '(editMessage, editDate)'
                        + ' VALUES(\'Create DB edits table\', datetime(\'now\', \'localtime\'))',
                    {}, (err, row) => {
                        resolve();
                    });
            });    
        }
        else {
            resolve();
        }
    });
}