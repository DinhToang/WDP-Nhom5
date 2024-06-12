const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./models/users');

const app = express();

app.use(bodyParser.json());
const allowedOrigins = ['http://localhost:3000', 'http://example2.com'];
app.use(cors({
  origin: function (origin, callback) {
    // Check if the origin is allowed or not
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow credentials
}));

mongoose.connect('mongodb://127.0.0.1:27017/gym', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

const userRoutes = require('./routes/users');
const forgotpasswordRoutes = require('./routes/forgotpassword');
app.use('/api/users', userRoutes);
app.use('/forgotpassword', forgotpasswordRoutes);
// app.post('/forgotpassword', (req, res) => {
//   const { email } = req.body;
//   UserModel.findOne({ email: email })
//     .then(user => {
//       if (!user) {
//         return res.send({ Status: "User not existed" })
//       }
//       const token = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "id" })
//       var transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: 'phandinhdan6666@gmail.com',
//           pass: 'nxum kgxi agdf rnvi'
//         }
//       });

//       var mailOptions = {
//         from: 'phandinhdan6666@gmail.com',
//         to: 'phandinhdan6602@gmail.com',
//         subject: 'Reset Password Link',
//         text: 'http://localhost:3000/resetpassword/${user._id}/${token}'
//       };

//       transporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//           console.log(error);
//         } else {
//           return res.send({ Status: "Success" })
//         }
//       });
//     })
// })




app.post('/resetpassword/:id/:token', (req, res) => {
  const { id, token } = req.params
  const { password } = req.body

  console.log('ID:', id);
  console.log('Token:', token);
  console.log('Password:', password);
  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) {
      return res.json({ Status: "Error with token" })
    } else {
      bcrypt.hash(password, 10)
        .then(hash => {
          User.findByIdAndUpdate({ _id: id }, { password: password })
            .then(u => res.send({ Status: "Success" }))
            .catch(err => res.send({ Status: err }))
        })
        .catch(err => res.send({ Status: err }))
    }
  })
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});