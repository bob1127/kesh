// lib/mailer.js
import nodemailer from "nodemailer";

export function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass) throw new Error("Missing GMAIL_USER / GMAIL_PASS");

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}
