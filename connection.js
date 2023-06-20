require('dotenv').config();
const mysql = require('mysql');


var connection = mysql.createConnection({
    port : process.env.DB_PORT,
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME

}); 

connection.connect((err)=>{
    !err ? console.log("connected") : console.log(err);
});


module.exports = connection;