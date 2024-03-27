function getVerifyEmailHtml(token) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111111;">
      <h2>Confirm Your Email Address</h2>
      <p>Please click on the link below to confirm your email address:</p>
      <a href="${process.env.URL}/api/auth/verify-email?token=${token}">Confirm Email Address</a>
      <p>If you did not register on our site, please ignore this email.</p>
    </div>`;
}

function getResetPasswordHtml(token) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111111;">
      <h2>Reset Your Password</h2>
      <p>Please click on the link below to reset your password:</p>
      <a href="${process.env.FRONTEND_URL}/api/auth/reset-password?token=${token}">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email.</p>
    </div>`;
}

function getInvitationHtml(token, calendarId, creatorEmail, calendarTitle) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111111;">
      <h2>Invitation to Join "${calendarTitle}"</h2>
      <p>You have been invited to join the calendar "${calendarTitle}". Please click on the link below to accept the invitation:</p>
      <p><a href="${process.env.URL}/api/calendar/${calendarId}/accept-invitation?token=${token}">Accept Invitation</a></p>
      <p>This link will take you to a page where you can confirm your participation in the calendar.</p>
      <p>If you did not expect to receive this invitation, please ignore this email.</p>
      <p><strong>Please note:</strong> This invitation is valid for 24 hours. If you are unable to accept the invitation within this time, please contact the calendar owner at <a href="mailto:${creatorEmail}">${creatorEmail}</a> for a new invitation.</p>
    </div>`;
}

function getAcceptanceNotificationHtml(userEmail, calendarName) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111111;">
      <h2>Invitation Accepted</h2>
      <p>We are pleased to inform you that <a href="mailto:${userEmail}">${userEmail}</a> has accepted your invitation to join the calendar <strong>${calendarName}</strong>.</p>
      <p>Thank you for using our service!</p>
    </div>`;
}

function getEventAccessGrantedHtml(eventTitle, creatorEmail) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111111;">
      <h2>Access to Event: "${eventTitle}" Granted</h2>
      <p>We are pleased to inform you that you have been granted access to the event: <strong>"${eventTitle}"</strong> by <a href="mailto:${creatorEmail}">${creatorEmail}</a>.</p>
      <p>If you have not yet registered on our platform, please follow the link below to complete your registration and join the event:</p>
      <p><a href="${process.env.FRONTEND_URL}/register">Complete Registration and Join Event</a></p>
      <p>Thank you for joining us!</p>
    </div>`;
}



module.exports = {
  getVerifyEmailHtml,
  getResetPasswordHtml,
  getInvitationHtml,
  getAcceptanceNotificationHtml,
  getEventAccessGrantedHtml
};