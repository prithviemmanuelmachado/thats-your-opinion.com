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
const reviewTable = 'Reviews';
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
  const newItem = req.body;
  //check if item already exists
  var params = {
    TableName: itemTable,
    Key : {
      "Title" : newItem.Title
    },
    ProjectionExpression : "Title"
  };
  client.get(params, (err, data)=>{
    if(err)
      console.log(err);
    else
    {
      res.contentType = 'application/json';
      if(data.Item)
      {
        res.status(400);
        res.json({'Error' : 'This item already exists'});
      }
      else
      {
        //if user is logged in post as user else ask user to login
        const token = req.headers.jwt;
        if(token)
        {
          jwt.verify(token, jwtkey, (err, decodedToken)=>{
            const Title = newItem.Title;
            const Contact = newItem.Contact;
            const Links = newItem.Links;
            const Description = newItem.Desc;
            const CreatedBy = decodedToken.username;
            const CreatedOn = new Date().toString();
            const NoOfStars = 0;
            const NoOfReviews = 0;
            const input = {Title, Contact, Links, Description, CreatedBy, CreatedOn, NoOfReviews, NoOfStars};
            const inputParams = {
              TableName : itemTable,
              Item : input
            }
            client.put(inputParams, (err, data)=>{
              if(err)
              {
                console.log(err);
              }
              else
              {
                res.status(200);
                res.json({"Added" : true});
              }
            });
          });
        }
        else
        {
          res.status(400);
          res.json({'Error' : 'Please login to post an item'});
        }
        
      }
    }
  });
  
  
  
});

//api for getting all posts
app.get('/items', (req, res) => {
  const params = {
    TableName : itemTable,
    ProjectionExpression : "Title, NoOfReviews, NoOfStars"
  };
  client.scan(params, (err, data) => {
    if(err)
      console.log(err);
    else
    {
      res.contentType = 'application/json';
      res.status(200);
      res.json(data.Items);
    }
  });
});

//api to get specific item details
app.get('/details', (req, res) => {
  const title = req.query.title;
  const params = {
    TableName : itemTable,
    Key : {
      'Title' : title
    }
  }
  client.get(params, (err, data) => {
    if(err)
      console.log(err);
    else
    {
      const reviewParams = {
        TableName : reviewTable,
        FilterExpression: 'Title = :title',
        ExpressionAttributeValues: {
          ":title": title
        },
        ProjectionExpression : "Stars, CreatedBy, Review"
      }
      client.scan(reviewParams, (err, iData) => {
        if(err)
          console.log(err);
        else
        {
          data.Item.Reviews = iData.Items;
          res.contentType = 'application/json';
          res.status(200);
          res.json(data.Item);
        }
      });
      
    }
  });
});

//api for posting reviews
app.post('/newReview', (req, res) => {
  //if logged in check if self posing review
  const token = req.headers.jwt;
  res.contentType = 'application/json';
  if(token)
  {
    jwt.verify(token, jwtkey, (err, decodedToken)=>{
      const username = decodedToken.username;
      const items = req.body;
      const params = {
        TableName : itemTable,
        Key : {
          'Title' : items.title
        },
        ProjectionExpression : "CreatedBy"
      }
      client.get(params, (err, data) => {
        if(err)
          console.log(err);
        else
        {
          if(data.Item.CreatedBy == username)
          {
            res.status(400);
            res.json({'Error': 'You cannot post a review'});
          }
          else
          {
            const date = new Date().toString();
            const Id = Math.random() +""+ username + "" + date;
            const input = {
              'Id' : Id, 
              'CreatedBy' : username, 
              'Stars' : items.stars, 
              'Title' : items.title, 
              'Review' : items.review, 
              'CreatedOn' : date
            };
            const inputParams = {
              TableName : reviewTable,
              Item : input
            }
            client.put(inputParams, (err, data) => {
              if(err)
                console.log(err);
              else
              {
                //update the review counter on item table
                const getUpdateParams = { 
                  TableName : itemTable,
                  Key : {
                    "Title" : items.title
                  },
                  ProjectionExpression : "NoOfStars, NoOfReviews"
                }
                client.get(getUpdateParams, (err, gUData) => {
                  if(err)
                    console.log(err);
                  else
                  {
                    let stars = parseInt(gUData.Item.NoOfStars, 10);
                    let reviews = parseInt(gUData.Item.NoOfReviews, 10);
                    var updateParams = {
                      TableName: itemTable,
                      Key:{
                          "Title": items.title
                      },
                      UpdateExpression: "set NoOfReviews = :r, NoOfStars = :s",
                      ExpressionAttributeValues:{
                          ":r": reviews + 1,
                          ":s": stars + parseInt(items.stars, 10)
                      }
                    };
                    client.update(updateParams, (err, uData) =>{
                      if(err)
                        console.log(err)
                      else
                      {
                        res.status(200);
                        res.json({'Added' : true});
                      }
                    })
                  }
                });
              }
            });
          }
        }
      });
    });
  }
  //else send error
  else
  {
    res.status(400);
    res.json({'Error': 'Please login to post reviews'});
  }
});

//initiating the server
app.listen(port, () => {
  console.log(`Server listening on port localhost:${port}!`)
});


