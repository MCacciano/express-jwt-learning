const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('server working'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, (req, res) =>
  console.log(`Server listening on port: ${PORT}`)
);
