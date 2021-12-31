//importing dependencies
const express = require('express');
const cors = require('cors');
const aws = require('aws-sdk');
const hasher = require('crypto');
const config = require('./access.json');
const jwt = require('jsonwebtoken');

//initalizing variables and dependencies
const userTable = 'Users';
const itemTable = 'ReviewItems';
const port = 3000;
const jwtkey = config[0].jwtSecretKey;
const key = config[0].accessKeyId;
const password = config[0].secretAccessKey;
const app = express();
aws.config.update({
  'region' : 'ap-south-1',
  'endpoint' : 'http://dynamodb.ap-south-1.amazonaws.com',
  'accessKeyId' : key,
  'secretAccessKey' : password 
});

//applying middleware
app.use(cors());
app.use(express.json());

//connecting to db
const client = new aws.DynamoDB.DocumentClient();

//api for registering new users
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
      res.status(500);
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
        //encrypt password
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

//api for logging in
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  //find if the userexits
  var params = {
    TableName: userTable,
    Key : {
      "Username" : username
    },
    ProjectionExpression : "Password, Salt"
  };
  client.get(params, (err, data) => {
    res.contentType = 'application/json';
    if (err) 
    {
      console.log(err);
      res.status(500);
      res.json({"Error" : "Internal error. Please try again later"});
    } 
    else 
    {
      if(data.Item)
      {
        //check if passwords match
        var hash = hasher.pbkdf2Sync(password, data.Item.Salt, 1000, 64, `sha512`).toString(`hex`);
        if(hash == data.Item.Password)
        {
          //create a jwt token
          const token = jwt.sign({ username: username }, jwtkey, { expiresIn : '2h'});
          res.status(200);          
          res.json({"jwt" : token});
        }
        else
        {
          res.status(400);
          res.json({"Error" : "Incorrect password"});
        }
        
      }
      else
      {
        res.status(400);
        res.json({"Error" : "No such user. Please check username"});
      }
    }
  });
});

//api for creating new posts
app.post('/newItem', (req, res) => {

});

//initiating the server
app.listen(port, () => {
  console.log(`Server listening on port localhost:${port}!`)
});


