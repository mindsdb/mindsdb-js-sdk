# MindsDB JavaScript SDK

### [**Full SDK docs**](https://mindsdb.github.io/mindsdb-js-sdk/)
<br/>

The [MindsDB](https://mindsdb.com/) JavaScript SDK allows you to unlock the power of machine learning right inside your web applications. We provide interfaces to perform most MindsDB operations, such as training and querying models, and connecting your own datasources to MindsDB.

## Getting Started

If you haven't already, make sure to [create a MindsDB account](https://cloud.mindsdb.com/register) to use with the SDK.

### Installation

```npm install --save mindsdb-js-sdk```

We have full TypeScript support. Just import the types you need directly. For example:

```import { Database, Model, ModelPrediction, Project, Table, View } from 'mindsdb-js-sdk';```

## Usage Examples


### Connecting to MindsDB

**Before performing any operations, you must connect to MindsDB**. By default, all operations will go through [MindsDB Cloud](https://cloud.mindsdb.com/) REST APIs, but you can use a self-hosted version of MindsDB as well. In future releases, we will support connecting directly to MySQL instances.

MindsDB Cloud:
```typescript
import MindsDB from 'mindsdb-js-sdk';

try {
  await MindsDB.connect({
    user: 'mindsdbuser@gmail.com',
    password: 'mypassword'
  });
} catch(error) {
  // Failed to authenticate.
}
```

MindsDB Pro:
```typescript
import MindsDB from 'mindsdb-js-sdk';

try {
  await MindsDB.connect({
    host: 'http://<YOUR_INSTANCE_IP>',
    user: 'mindsdbuser@gmail.com',
    password: 'mypassword',
    managed: true
  });
} catch(error) {
  // Failed to authenticate.
}
```

Self-hosted
```typescript
import MindsDB from 'mindsdb-js-sdk';

try {
  // No authentication needed for self-hosting
  await MindsDB.connect({
    host: 'http://127.0.0.1:47334'
  });
} catch(error) {
  // Failed to connect to local instance.
}
```

Using your own Axios instance. See [src/util/http.ts](https://github.com/mindsdb/mindsdb-js-sdk/blob/main/src/util/http.ts) for the default instance we use.
```typescript
import MindsDB from 'mindsdb-js-sdk';
import axios from 'axios';

// Use 'host' option in MindsDB.connect to specify base URL override.
const customAxios = axios.create({
  timeout: 1000,
});

try {
  await MindsDB.connect({
    user: mindsdbuser@gmail.com,
    password: mypassword,
    httpClient: customAxios
  });
} catch(error) {
  // Failed to authenticate.
}
```

### Connecting a Database to MindsDB

The following code example assumes you already imported and connected to MindsDB.

You can connect to [many database integrations](https://docs.mindsdb.com/data-integrations/all-data-integrations) through MindsDB. For example, to connect to a Postgres database:

```typescript
const connectionParams = {
  'user': 'postgres',
  'port': 15093,
  'password': 'password',
  'host': '127.0.0.1',
  'database': 'postgres'
}
try {
  const pgDatabase = await MindsDB.Databases.createDatabase(
    'psql_datasource',
    'postgres',
    connectionParams);
} catch (error) {
  // Couldn't connect to database.
}
```

### Getting & Deleting a Database

```typescript
// Can also use MindsDB.Databases.getAllDatabases() to get all databases.
const dbToDelete = await MindsDB.Databases.getDatabase('useless_db');
if (dbToDelete) {
  try {
    // Can also call MindsDB.Databases.deleteDatabase('useless_db') directly.
    await dbToDelete.delete();
  } catch (error) {
    // Something went wrong while deleting the database.
  }
}
```

### Running SQL Queries

The following code example assumes you already imported and connected to MindsDB.

When directly using SQL queries, we recommend escaping them when possible using libraries like [mysql](https://www.npmjs.com/package/mysql).

```typescript
const user = 'raw_unsafe_username'
const query = `SELECT * FROM my_db.customer_data WHERE user=${mysql.escape(user)}`;
try {
  const queryResult = await MindsDB.SQL.runQuery(query);
  if (queryResult.rows.length > 0) {
    const matchingUserRow = queryResult.rows[0];
    // Do something with returned data.
    // {
    //   user: 'raw_unsafe_username',
    //   email: 'useremail@gmail.com',
    //   other_data: 9001,
    //   ... 
    // }
  }
} catch (error) {
  // Something went wrong sending the API request or executing the query.
}
```

### Getting Projects

The following code examples assumes you already imported and connected to MindsDB.

```typescript
const allProjects = await MindsDB.Projects.getAllProjects();
allProjects.forEach(p => {
  console.log(p.name);
});
```

### Training & Querying Models

The following code example assumes you already imported and connected to MindsDB.

See [full training options docs](https://mindsdb.github.io/mindsdb-js-sdk/interfaces/models_trainingOptions.TrainingOptions.html)

See [full query options docs](https://mindsdb.github.io/mindsdb-js-sdk/interfaces/models_queryOptions.QueryOptions.html) and [full batch query options docs](https://mindsdb.github.io/mindsdb-js-sdk/interfaces/models_queryOptions.BatchQueryOptions.html)


Simple queries:
```typescript
const regressionTrainingOptions = {
  select: 'SELECT * FROM demo_data.home_rentals',
  integration: 'example_db'
};

try {

  // MindsDB.Models.retrainModel has the same interface for retraining models.
  // The returned promise resolves when the model is created, NOT when training is actually complete.
  let homeRentalPriceModel = await MindsDB.Models.trainModel(
    'home_rentals_model',
    'rental_price',
    'mindsdb',
    regressionTrainingOptions);

  // Wait for the training to be complete. This is just a simple example. There are much better ways to do this.
  while (homeRentalPriceModel.status !== 'complete' && homeRentalPriceModel.status !== 'error') {
    homeRentalPriceModel = await MindsDB.Models.getModel('home_rentals_model', 'mindsdb');
  }

  const queryOptions = {
    where: [
      'sqft = 823',
      'location = "good"',
      'neighborhood = "downtown"',
      'days_on_market = 10'
    ]
  }

  const rentalPricePrediction = homeRentalPriceModel.query(queryOptions);
  console.log(rentalPricePrediction.value);
  console.log(rentalPricePrediction.explain);
  console.log(rentalPricePrediction.data);
} catch (error) {
  // Something went wrong training or querying.
}
```

A more complex example using batch querying:

```typescript
const timeSeriesTrainingOptions = {
  integration: 'example_db',
  select: 'SELECT * FROM demo_data.house_sales',
  orderBy: 'saledate',
  groupBy: 'bedrooms',
  window: 8,
  horizon: 4,
  using: {
    'key': 'value',
    'labels': ['house-label', 'test-label'],
    'model.args': {
      'submodels': [{
        'module': 'LightGBM',
        'args': {
          'stop_after': 12,
          'fit_on_dev': true
        }
      }]
    }
  }
}

try {
  const houseSalesForecastModel = await MindsDB.Models.trainModel(
    'house_sales_model',
    'rental_price',
    'mindsdb',
    timeSeriesTrainingOptions);

  // Wait for training to be complete...
  // See simple query example.
  //...
  //...

  const modelDescription = await houseSalesForecastModel.describe();
  console.log(modelDescription);

  const queryOptions = {
    // Join model to this data source.
    join: 'example_db.demo_data.house_sales',
    // When using batch queries, the 't' alias is used for the joined data source ('t' is short for training/test).
    // The 'm' alias is used for the trained model to be queried.
    where: ['t.saledate > LATEST', 't.type = "house"'],
    limit: 4
  }
  const rentalPriceForecasts = await houseSalesForecastModel.batchQuery(queryOptions);
  rentalPriceForecasts.forEach(f => {
    console.log(f.value);
    console.log(f.explain);
    console.log(f.data);
  })
} catch (error) {
  // Something went wrong training or predicting.
}
```

### Retraining & Adjusting Models

The following code example assumes you already imported and connected to MindsDB.

See [full training options docs](https://mindsdb.github.io/mindsdb-js-sdk/interfaces/models_trainingOptions.TrainingOptions.html)

See [full adjust options docs](https://mindsdb.github.io/mindsdb-js-sdk/interfaces/models_trainingOptions.AdjustOptions.html)

Retraining: 
```typescript
const homeRentalPriceModel = await MindsDB.Models.getModel('home_rentals_model', 'mindsdb');

if (homeRentalPriceModel.updateStatus === 'available') {
  try {
    // Equivalent to SQL 'RETRAIN mindsdb.home_rentals_model'.
    // For custom retraining:
    // homerentalPriceModel.retrain('example_db', trainingOptions);
    // See training options in Training & Querying example for more context.
    // Does NOT block on training. The promise resolves after training starts.
    await homeRentalPriceModel.retrain();
  } catch (error) {
    // Something went wrong with retraining.
  }
}
```

Adjusting:
```typescript
const homeRentalPriceModel = await MindsDB.Models.getModel('home_rentals_model', 'mindsdb');

const adjustSelect = 'SELECT * FROM demo_data.home_rentals WHERE days_on_market >= 10';
const params = { 'key' : 'value' }

try {
  // Does NOT block on adjusting. The promise resolves after adjusting starts.
  await homeRentalPriceModel.adjust(
    { integration: 'example_db', select: adjustSelect, using: params });
} catch (error) {
  // Something went wrong adjusting.
}
```

### Creating Views

After you create a view, you can query it by including it in SELECT statements as if it's a table.

The following code example assumes you already imported and connected to MindsDB.

```typescript
const viewSelect = `SELECT t.sqft, t.location, m.rental_price
  FROM example_db.home_rentals_data as t
  JOIN mindsdb.home_rentals_model as m
`;
try {
  const predictionsView = await MindsDB.Views.createView(
    'predictions_view',
    'mindsdb',
    viewSelect);
} catch (error) {
  // Something went wrong creating the view.
}
```
## Contributing

Being part of the core MindsDB team is accessible to anyone who is motivated and wants to be part of that journey!

Please see below how to contribute to the project, also refer to the contributing documentation.

### How Can You Help Us?

* Report a bug
* Improve documentation
* Discuss the code implementation
* Submit a bug fix
* Propose new features
* Test the SDK

### Code Contributions

In general, we follow the "fork-and-pull" Git workflow.

1. Fork the mindsdb-js-sdk repository
2. Clone the repository
3. Make changes and commit them
4. Push your local branch to your fork
5. Submit a Pull request so that we can review your changes
6. Write a commit message

### Contributor Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](https://github.com/mindsdb/mindsdb/blob/stable/CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

Join our mission of democratizing machine learning!

## Community

If you have additional questions or you want to chat with the MindsDB core team, please join our [Slack community](https://join.slack.com/t/mindsdbcommunity/shared_invite/zt-o8mrmx3l-5ai~5H66s6wlxFfBMVI6wQ).

To get updates on MindsDB’s latest announcements, releases, and events, sign up for our [Monthly Community Newsletter](https://mindsdb.com/newsletter/?utm_medium=community&utm_source=github&utm_campaign=mindsdb%20repo).

