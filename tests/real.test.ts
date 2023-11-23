// import MindsDB from '../src/index';
// import axios from 'axios';
// import Constants from '../src/constants';
// import MLEngine from '../src/ml_engines/ml_engine';

// describe('Testing root SDK functions', () => {


//   test('connect should not authenticate for custom endpoint', async () => {
//     await MindsDB.connect({
//       host: 'https://precise.mindsdb.com',
//       user: 'dev@precisefinance.ai',
//       password: 'KVH2amx8ajy.quy-wup',
//     });

//     const y = await MindsDB.Callbacks.getCallbacks();

//     const x = (await MindsDB.MLEngines.getMLEngine('nhits')) as MLEngine;
//     const cd = JSON.parse(x.connection_data as any);
   
//     expect((x.connection_data as any).code).toBeNull();
//   });
// });
