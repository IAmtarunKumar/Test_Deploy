
const nodemailer = require('nodemailer'); 
const dotenv = require("dotenv")
dotenv.config()


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  })
  
  // Function to send email notification
  const sendOTPEmail = (email, subject, htmlContent) => {
    const mailOptions = {
      from: process.env.EMAIL, // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      html: htmlContent 
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error('Error sending email:', error);
      }
      console.log('Email sent:', info.response);
    });
  };

  module.exports = sendOTPEmail;