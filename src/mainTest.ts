import MindsDB from './index';

MindsDB.connect({
  user: 'tylerbtbam@gmail.com',
  password: 'i#@LI50N&0qn',
}).then((data) => {
  MindsDB.SQL.runQuery('SELECT * FROM mindsdb.models').then((data) => {
    console.log(data);
  });
});
