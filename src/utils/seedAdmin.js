import bcrypt from "bcrypt";
import User from "../models/user-model.js";

export const seedAdmin = async () => {
  const adminUserName = process.env.ADMIN_USERNAME || "ADMINB";
  const adminPassword = process.env.ADMIN_PASSWORD || "ADMINB";

  const existingAdmin = await User.findOne({ userName: adminUserName });
  if (existingAdmin) {
    console.log("Seed | El usuario administrador ya existe, se omite creación");
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = new User({
    role: "SUPER_ADMIN",
    name: "Administrador",
    userName: adminUserName,
    email: process.env.ADMIN_EMAIL || "admin@smartassets.local",
    password: hashedPassword,
    status: true,
  });

  await admin.save({ validateBeforeSave: false });

  console.log(
    `Seed | Usuario administrador creado (userName: ${adminUserName})`,
  );
};
