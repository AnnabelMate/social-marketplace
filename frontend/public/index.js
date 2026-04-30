const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', { title: 'Collectible Trading Post' });
});

app.listen(4000, () => console.log('Frontend on port 4000'));