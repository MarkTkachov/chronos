const nodemailer = require('nodemailer');
const { getVerifyEmailHtml, getResetPasswordHtml, getInvitationHtml, getAcceptanceNotificationHtml, getEventAccessGrantedHtml } = require('./emailTemplates');

async function sendEmail(userEmail, action, token, calendarId='', creatorEmail='', calendarTitle='') {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USERNAME,
      pass: process.env.PASSWORD
    }
  });
  let subject, emailHtml;

  switch(action) {
    case 'verifyEmail':
      subject = 'Confirm Your Email Address';
      emailHtml = getVerifyEmailHtml(token);
      break;
    case 'resetPassword':
      subject = 'Reset Your Password';
      emailHtml = getResetPasswordHtml(token);
      break;
    case 'invitation':
      subject = `You are Invited to Join the Calendar "${calendarTitle}"`;
      emailHtml = getInvitationHtml(token, calendarId, creatorEmail, calendarTitle);
      break;
    case 'calendarNotification':
      subject = 'Invitation Accepted';
      emailHtml = getAcceptanceNotificationHtml(creatorEmail, calendarTitle);
      break;
    case 'eventAccess':
      subject = `Access to Event: "${calendarTitle}" Granted`;
      emailHtml = getEventAccessGrantedHtml(calendarTitle, creatorEmail);
      break;
  }

  let mailOptions = {
    from: process.env.USERNAME,
    to: userEmail,
    subject: subject,
    html: emailHtml
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
