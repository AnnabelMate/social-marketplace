const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// The server decides which components to render by passing config to EJS
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Collectible Trading Post',
    user: { id: 'user1', name: 'Demo User', role: 'buyer' },
    components: ['marketplace-app'] // server decides what to render
  });
});

// Seller view - server decides to render seller-specific components
app.get('/seller', (req, res) => {
  res.render('index', {
    title: 'Seller Dashboard - Collectible Trading Post',
    user: { id: 'user2', name: 'Demo Seller', role: 'seller' },
    components: ['marketplace-app', 'add-item']
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
});