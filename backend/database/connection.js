const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Criar conexão com SQLite
const dbPath = path.join(__dirname, 'ga_quiz.db');
const db = new sqlite3.Database(dbPath);

// Função para testar conexão
const testConnection = () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT 1', (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve('Conexão com SQLite estabelecida com sucesso');
      }
    });
  });
};

// Função para executar queries
const executeQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Função para executar transações
const executeTransaction = async (queries) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      let completed = 0;
      const total = queries.length;
      
      queries.forEach((query, index) => {
        db.run(query.sql, query.params || [], function(err) {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          
          completed++;
          if (completed === total) {
            db.run('COMMIT', (err) => {
              if (err) {
                reject(err);
              } else {
                resolve('Transação executada com sucesso');
              }
            });
          }
        });
      });
    });
  });
};

module.exports = {
  db,
  testConnection,
  executeQuery,
  executeTransaction
}; 