// Create web server
// 1. Create a web server
// 2. Listen for requests
// 3. Read the request body
// 4. Parse the request body
// 5. Save the comment to the database
// 6. Send a response
const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');
const { v4 } = require('uuid');
const { getComments, saveComment, deleteComment } = require('./database');

const server = http.createServer((req, res) => {
  // Check if the request is a POST request
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { comment } = parse(body);
      saveComment(v4(), comment);
      res.writeHead(302, { Location: '/' });
      res.end();
    });
  } else if (req.method === 'DELETE') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const commentId = url.searchParams.get('id');
    deleteComment(commentId);
    res.writeHead(302, { Location: '/' });
    res.end();
  } else {
    const comments = getComments();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end();
        return;
      }
      res.end(data.replace('<!-- comments -->', comments));
    });
  }
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});