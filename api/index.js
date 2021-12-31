//importing dependencies
const express = require('express');
const cors = require('cors');
const aws = require('aws-sdk');
const hasher = require('crypto');
const config = require('./access.json');

//initalizing variables and dependencies
const userTable = 'Users';
const itemTable = 'ReviewItems';
const port = 3000;
const key = config[0].accessKeyId;
const password = config[0].secretAccessKey;
const app = express();
aws.config.update({
  'region' : 'ap-south-1',
  'endpoint' : 'http://dynamodb.ap-south-1.amazonaws.com',
  'accessKeyId' : key,
  'secretAccessKey' : password 
});
const client = new aws.DynamoDB.DocumentClient();
app.use(cors());
app.use(express.json());

app.post('/registerUser', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  //find if username already exists
  var params = {
    TableName: userTable,
    Key : {
      "Username" : username
    },
    ProjectionExpression : "Username"
  };
  client.get(params, (err, data) => {
    res.contentType = 'application/json';
    if (err) 
    {
      console.log(err);
      res.status(400);
      res.json({"Error" : "Internal error. Please try again later"});
    } 
    else 
    {
      if(data.Item)
      {
        res.status(400);
        res.json({"Error" : "Username already exists"});
      }
      else
      {
        const salt = hasher.randomBytes(16).toString('hex');
        const hashed = hasher.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
        const input = { "Username" : username, "Password" : hashed, "Salt" : salt};
        const inputParams = {
          TableName : userTable,
          Item : input
        }
        client.put(inputParams, function (err, data){
          if(err)
            console.log(err);
          else
          {
            res.status(200);
            res.json({"Added" : true});
          }
        });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port localhost:${port}!`)
});
