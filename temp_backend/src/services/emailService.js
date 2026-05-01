const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Sends an email. Fails silently in production (logs error) to avoid blocking API responses.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('Email service not configured. Skipping email send.');
    return;
  }
  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: `"Internship Finder" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error('Failed to send email:', err.message);
    // Non-blocking: don't throw
  }
};

const sendDeadlineReminder = (to, name, internshipTitle, deadline) =>
  sendEmail({
    to,
    subject: `⏰ Application Deadline Reminder: ${internshipTitle}`,
    html: `<p>Hi ${name},</p>
           <p>The deadline for <strong>${internshipTitle}</strong> is on <strong>${new Date(deadline).toDateString()}</strong>.</p>
           <p>Don't miss your chance to apply!</p>`,
    text: `Hi ${name}, the deadline for ${internshipTitle} is ${new Date(deadline).toDateString()}.`,
  });

const sendStatusUpdate = (to, name, internshipTitle, status) =>
  sendEmail({
    to,
    subject: `📋 Application Update: ${internshipTitle}`,
    html: `<p>Hi ${name},</p>
           <p>Your application for <strong>${internshipTitle}</strong> has been updated to: <strong>${status.toUpperCase()}</strong>.</p>`,
    text: `Hi ${name}, your application for ${internshipTitle} is now: ${status}.`,
  });

module.exports = { sendEmail, sendDeadlineReminder, sendStatusUpdate };
