require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');


app.use(express.urlencoded());
app.use(express.static('./assets'));
app.use(expressLayouts);

// Extract styles and scripts from sub pages int layouts page
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

// Set the ejs view Engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Use Router
app.use('/', require('./routes'));



app.listen(PORT, (err) => {
    if (err) {
      console.log(`Error in running on Port :: ${PORT}`, err);
      return;
    }
  
    console.log(`Server is Running on Port :: ${PORT}`);
  });