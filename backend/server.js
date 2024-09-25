require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');
const socketHandler = require('./socketHandler');
const { connectDB } = require('./lib/mongoDB'); 

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

connectDB();

app.use(cors());

const sessionMiddleware = session({
    secret: process.env.SessionSecretKey,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60
    }),
    cookie: { 
      secure: new String((process.env.NODE_ENV? process.env.NODE_ENV: "Development")).toLowerCase() === 'production',
      maxAge: 14 * 24 * 60 * 60 * 100 //will be expired after 14 day.
    } 
  });

app.use(sessionMiddleware);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'templates'));
app.use(express.static(path.join(__dirname, '..', 'public')));

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

socketHandler(io);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});