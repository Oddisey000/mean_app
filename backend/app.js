const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-Width, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST PATCH, DELETE, OPTIONS');
  next();
});

app.post('/api/posts', (req, res, next) => {
  const post = req.body;
  console.log(post);
  res.status(201).json({
    message: 'Post added sucessfully'
  });
});

app.get('/api/posts', (req, res, next) => {
  const posts = [
    { 
      id: 'fadf124211',
      title: 'First server-side post',
      content: 'This is comming from the server!'
    },
    { 
      id: 'fadf1242112',
      title: 'Second server-side post',
      content: 'This is comming from the server!'
    },
    { 
      id: 'fadf1242123',
      title: 'Third server-side post',
      content: 'This is comming from the server'
    }
  ];

  return res.status(200).json({
    message: "Posts fetch sucessfully!",
    posts: posts
  });
});

module.exports = app;