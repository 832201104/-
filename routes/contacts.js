const express = require('express');
const router = express.Router();
const connection = require('../db/mysql/index');
const dayjs = require('dayjs');
const XLSX = require('xlsx');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = 'uploads/';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  })
});

router.get('/template', (req, res) => {
  const workbook = XLSX.utils.book_new();
  const headers = ['姓名', '手机号', '备用手机号', '地址', '邮箱', '生日', '社交媒体'];
  const demoData = ['张三', '13800138000', '13900139000', '北京市朝阳区xxx街道', 'zhangsan@example.com', '1990-01-01', 'WeChat: zhang_san'];
  const data = [headers, demoData];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  const colWidths = [
    { wch: 15 }, // 姓名
    { wch: 15 }, // 手机号
    { wch: 15 }, // 备用手机号
    { wch: 40 }, // 地址
    { wch: 25 }, // 邮箱
    { wch: 15 }, // 生日
    { wch: 30 }  // 社交媒体
  ];
  ws['!cols'] = colWidths;

  for (let i = 0; i < headers.length; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
    if (!ws[cellRef].s) ws[cellRef].s = {};
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4A90E2" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
  }

  XLSX.utils.book_append_sheet(workbook, ws, '联系人');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=contacts_template.xlsx');
  res.send(buffer);
});

router.post('/import', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).send('No file uploaded');
    return;
  }

  const workbook = XLSX.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  data.shift();
  
  const values = data.map(row => [
    row[0] || null,
    row[1] || null,
    row[2] || null,
    row[3] || null,
    row[4] || null,
    row[5] ? dayjs(row[5]).format('YYYY-MM-DD') : null,
    row[6] || null
  ]);

  const query = 'INSERT INTO contacts (name, phone, backup_phone, address, email, birthday, social_media) VALUES ?';
  
  connection.query(query, [values], (err, result) => {
    fs.unlinkSync(req.file.path);
    
    if (err) {
      res.status(500).send('Error importing contacts');
      return;
    }
    res.send({ message: 'Import successful', count: result.affectedRows });
  });
});

router.get('/export', (req, res) => {
  const query = 'SELECT name, phone, backup_phone, address, email, birthday, social_media FROM contacts';
  
  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error exporting contacts');
      return;
    }
    
    const workbook = XLSX.utils.book_new();
    const headers = ['姓名', '手机号', '备用手机号', '地址', '邮箱', '生日', '社交媒体'];
    
    const data = results.map(row => [
      row.name,
      row.phone,
      row.backup_phone,
      row.address,
      row.email,
      row.birthday ? dayjs(row.birthday).format('YYYY-MM-DD') : null,
      row.social_media
    ]);
    
    data.unshift(headers);
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    const colWidths = [
      { wch: 15 }, // 姓名
      { wch: 15 }, // 手机号
      { wch: 15 }, // 备用手机号
      { wch: 40 }, // 地址
      { wch: 25 }, // 邮箱
      { wch: 15 }, // 生日
      { wch: 30 }  // 社交媒体
    ];
    ws['!cols'] = colWidths;

    for (let i = 0; i < headers.length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      if (!ws[cellRef].s) ws[cellRef].s = {};
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4A90E2" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    for (let r = 1; r < data.length; r++) {
      for (let c = 0; c < headers.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) continue;
        if (!ws[cellRef].s) ws[cellRef].s = {};
        ws[cellRef].s = {
          alignment: { horizontal: "center", vertical: "center" },
          fill: {
            fgColor: { rgb: r % 2 === 0 ? "F5F5F5" : "FFFFFF" } // 隔行变色
          }
        };
      }
    }
    
    XLSX.utils.book_append_sheet(workbook, ws, '联系人');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.xlsx');
    res.send(buffer);
  });
});

// 查询所有联系人接口（可模糊查询姓名、手机号码，可日区间查询）
router.get('/all', (req, res) => {
  let query = 'SELECT * FROM contacts';
  if (req.query.name) {
    query += ` WHERE name LIKE '%${req.query.name}%'`;
  }
  if (req.query.phone) {
    if (query.includes('WHERE')) {
      query += ` AND phone LIKE '%${req.query.phone}%'`;
    } else {
      query += ` WHERE phone LIKE '%${req.query.phone}%'`;
    }
  }
  if (req.query.startDate && req.query.endDate) {
    if (query.includes('WHERE')) {
      query += ` AND birthday BETWEEN '${req.query.startDate}' AND '${req.query.endDate}'`;
    } else {
      query += ` WHERE birthday BETWEEN '${req.query.startDate}' AND '${req.query.endDate}'`;
    }
  }
  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error retrieving contacts from database');
      return;
    }
    res.send(results);
  });
});

// 分页查询接口（可模糊查询姓名、手机号码，可生日区间查询）
router.get('/page', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // 构建基础查询语句和总数查询语句
  let baseQuery = 'SELECT * FROM contacts';
  let countQuery = 'SELECT COUNT(*) AS total FROM contacts';
  const conditions = [];

  // 根据查询参数添加条件
  if (req.query.name) {
    conditions.push(`name LIKE '%${req.query.name}%'`);
  }
  if (req.query.phone) {
    conditions.push(`phone LIKE '%${req.query.phone}%'`);
  }
  if (req.query.startDate && req.query.endDate) {
    conditions.push(`birthday BETWEEN '${req.query.startDate}' AND '${req.query.endDate}'`);
  }

  // 将条件追加到查询语句中
  if (conditions.length > 0) {
    const whereClause = ' WHERE ' + conditions.join(' AND ');
    baseQuery += whereClause;
    countQuery += whereClause;
  }

  // 添加分页条件
  baseQuery += ` LIMIT ${limit} OFFSET ${offset}`;

  // 执行总数查询和分页数据查询
  connection.query(countQuery, (countErr, countResults) => {
    if (countErr) {
      res.status(500).send('Error retrieving total count from database');
      return;
    }
    const total = countResults[0].total;

    connection.query(baseQuery, (dataErr, dataResults) => {
      if (dataErr) {
        res.status(500).send('Error retrieving contacts from database');
        return;
      }
      res.send({
        total,
        data: dataResults,
        page,
        limit,
      });
    });
  });
});

// 获取收藏联系人列表接口
router.get('/favorites', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // 构建基础查询语句和总数查询语句
  let baseQuery = 'SELECT * FROM contacts WHERE is_favorite = 1';
  let countQuery = 'SELECT COUNT(*) AS total FROM contacts WHERE is_favorite = 1';
  const conditions = [];

  // 根据查询参数添加条件
  if (req.query.name) {
    conditions.push(`name LIKE '%${req.query.name}%'`);
  }
  if (req.query.phone) {
    conditions.push(`phone LIKE '%${req.query.phone}%'`);
  }
  if (req.query.startDate && req.query.endDate) {
    conditions.push(`birthday BETWEEN '${req.query.startDate}' AND '${req.query.endDate}'`);
  }

  // 将条件追加到查询语句中
  if (conditions.length > 0) {
    const whereClause = ' AND ' + conditions.join(' AND ');
    baseQuery += whereClause;
    countQuery += whereClause;
  }

  // 添加分页条件
  baseQuery += ` LIMIT ${limit} OFFSET ${offset}`;

  // 执行总数查询和分页数据查询
  connection.query(countQuery, (countErr, countResults) => {
    if (countErr) {
      res.status(500).send('Error retrieving total count from database');
      return;
    }
    const total = countResults[0].total;

    connection.query(baseQuery, (dataErr, dataResults) => {
      if (dataErr) {
        res.status(500).send('Error retrieving contacts from database');
        return;
      }
      res.send({
        total,
        data: dataResults,
        page,
        limit,
      });
    });
  });
});

// 添加联系人接口
router.post('/add', express.json(), (req, res) => {
  const { name, phone, backup_phone, address, email, birthday, social_media } = req.body;
  let formattedBirthday = null;
  if (birthday) {
    formattedBirthday = dayjs(birthday).format('YYYY-MM-DD');
  }
  const query = 'INSERT INTO contacts (name, phone, backup_phone, address, email, birthday, social_media) VALUES (?,?,?,?,?,?,?)';

  connection.query(query, [name, phone, backup_phone, address, email, formattedBirthday, social_media], (err, result) => {
    if (err) {
      console.log(err, 'err');
      res.status(500).send('Error adding contact to database');
      return;
    }
    res.send({ id: result.insertId });
  });
});

// 获取联系人详情接口
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM contacts WHERE id = ?';
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send('Error retrieving contact from database');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Contact not found');
      return;
    }
    res.send(results[0]);
  });
});

// 更新联系人接口
router.put('/update', express.json(), (req, res) => {
  const { id, name, phone, backup_phone, address, email, birthday, social_media } = req.body;
  let formattedBirthday = null;
  if (birthday) {
    formattedBirthday = dayjs(birthday).format('YYYY-MM-DD');
  }
  const query = 'UPDATE contacts SET name=?, phone=?, backup_phone=?, address=?, email=?, birthday=?, social_media=? WHERE id=?';
  connection.query(query, [name, phone, backup_phone, address, email, formattedBirthday, social_media, id], (err) => {
    if (err) {
      res.status(500).send('Error updating contact in database');
      return;
    }
    res.sendStatus(200);
  });
});

// 收藏联系人接口
router.put('/favorite/:id', (req, res) => {
  const id = req.params.id;
  const query = 'UPDATE contacts SET is_favorite = 1 WHERE id = ?';
  
  connection.query(query, [id], (err) => {
    if (err) {
      res.status(500).send('Error setting contact as favorite');
      return;
    }
    res.sendStatus(200);
  });
});

// 取消收藏联系人接口
router.put('/unfavorite/:id', (req, res) => {
  const id = req.params.id;
  const query = 'UPDATE contacts SET is_favorite = 0 WHERE id = ?';
  
  connection.query(query, [id], (err) => {
    if (err) {
      res.status(500).send('Error removing contact from favorites');
      return;
    }
    res.sendStatus(200);
  });
});

// 删除联系人接口
router.delete('/delete/:id', (req, res) => {
  const ids = req.params.id.split(',');
   if (ids.length === 0) {
    res.status(400).send('Invalid request: No IDs provided for deletion');
    return;
  }
  
  const query = `DELETE FROM contacts WHERE id IN (${ids.map(() => '?').join(', ')})`;
  connection.query(query, ids, (err) => {
    if (err) {
      res.status(500).send('Error deleting contacts from database');
      return;
    }
    res.sendStatus(200);
  });
});

module.exports = router;