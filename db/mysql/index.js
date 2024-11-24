var mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost', // mysql端口号
  user: 'root', // mysql用户名
  password: '123456', // mysql密码
  database: 'address_book', // 数据库名
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = connection;