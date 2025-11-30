const { text } = require("express");
const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  //note: Transporter is a service not belongs to NodeJS, its responsible to send email
  //Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, //this configuration may change when we use some other service like Gmail
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //Define email options
  const emailOptions = {
    from: "Cineflix support<support@cineflix.com>",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  await transporter.sendMail(emailOptions); //sendMail is a async function
};

module.exports = sendEmail;
