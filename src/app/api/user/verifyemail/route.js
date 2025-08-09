import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import "dotenv/config";

export async function POST(req) {
  const { email } = await req.json();

  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const otp = Math.floor(1000 + Math.random() * 9000);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for a short time.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ status: "success", otp });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
