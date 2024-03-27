const mongoose = require('mongoose');
const uri = `mongodb+srv://${process.env.NAME_MANAGER_DB}:${process.env.PASWWORD_DB}@cluster0.tfmjrmb.mongodb.net/${process.env.NAME_DB}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

