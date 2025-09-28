import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/userModel.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);

    const count = await User.countDocuments();
    if (count === 0) {
      const users = [
        {
          username: "minhtuyen",
          password: await bcrypt.hash("minhtuyen@123", 10),
          fullName: "Minh Tuyen",
          email: "minhtuyen@gmail.com",
          phone: "0901111111",
          address: "Quan Phu Nhuan, Ho Chi Minh",
          role: "admin",
        },
        {
          username: "dinhhien",
          password: await bcrypt.hash("dinhhien@123", 10),
          fullName: "Dinh Hien",
          email: "dinhhien@gmail.com",
          phone: "0902222222",
          address: "Quan 1, Ho Chi Minh",
          role: "guest",
        },
        {
          username: "ngocchuong",
          password: await bcrypt.hash("123456", 10),
          fullName: "Ngoc Chuong",
          email: "ngocchuong@gmail.com",
          phone: "0901234567",
          address: "123 Le Loi, Ho Chi Minh",
          role: "customer",
        },
      ];

      await User.insertMany(users);
      console.log("✅ Users seeded successfully with 3 roles!");
    } else {
      console.log("ℹ️ Users already exist, skip seeding.");
    }

    process.exit(); // thoát sau khi seed xong
  } catch (err) {
    console.error("❌ Error seeding users:", err);
    process.exit(1);
  }
};

seedUsers();
