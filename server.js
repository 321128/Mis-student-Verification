const express = require('express');
const app = express();
const PORT = 3803;

app.get('/', (req, res) => {
  res.send('Server running on port 3803');
});

app.listen(PORT, () => {
  console.log(`Secondary server running on port ${PORT}`);
});