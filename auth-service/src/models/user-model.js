import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: {
        values: ["SUPER_ADMIN", "ADMIN", "CLIENT"],
        message: "El rol debe ser SUPER_ADMIN, ADMIN o CLIENT",
      },
      default: "CLIENT",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "El nombre no debe superar 50 caracteres"],
    },
    userName: {
      type: String,
      required: [true, "El nickname/username es obligatorio"],
      unique: true,
      trim: true,
      minlength: [4, "El username debe tener al menos 4 caracteres"],
      maxlength: [25, "El username no debe superar 25 caracteres"],
    },
    dpi: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      required: [
        function () {
          return this.role === "CLIENT";
        },
        "El DPI es obligatorio para los clientes",
      ],
      match: [/^\d{13}$/, "El DPI debe tener 13 dígitos"],
      immutable: true,
    },
    address: {
      type: String,
      trim: true,
      required: [
        function () {
          return this.role === "CLIENT";
        },
        "La dirección es obligatoria para clientes",
      ],
      maxlength: [150, "La dirección no debe superar 150 caracteres"],
    },
    phone: {
      type: String,
      trim: true,
      required: [
        function () {
          return this.role === "CLIENT";
        },
        "El celular es obligatorio para clientes",
      ],
      match: [/^\d{8}$/, "El celular debe tener 8 dígitos"],
    },
    email: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [150, "El email no debe superar 150 caracteres"],
      match: [/^\S+@\S+\.\S+$/, "El formato del email no es válido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener un mínimo de 6 caracteres"],
      maxlength: [72, "La contraseña no debe superar 72 caracteres"], // límite real de bcrypt
      select: false,
    },
    jobName: {
      type: String,
      trim: true,
      required: [
        function () {
          return this.role === "CLIENT";
        },
        "El nombre de trabajo es obligatorio para clientes",
      ],
      maxlength: [100, "El nombre de trabajo no debe superar 100 caracteres"],
    },
    monthlyIncome: {
      type: Number,
      min: [0, "Los ingresos mensuales no pueden ser negativos"],
      required: [
        function () {
          return this.role === "CLIENT";
        },
        "Los ingresos mensuales son obligatorios para clientes",
      ],
      validate: {
        // Con ingresos por debajo de Q100 no se debe permitir crear la cuenta.
        validator: function (value) {
          if (this.role !== "CLIENT") return true;
          return value >= 100;
        },
        message:
          "No se puede crear la cuenta: los ingresos deben ser de al menos Q100",
      },
    },
    status: {
      type: Boolean,
      default: false,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    emailVerificationTokenHash: {
      type: String,
      select: false,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
      default: null,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ email: 1 });
userSchema.index({ userName: 1 });
userSchema.index({ dpi: 1 }, { unique: true, sparse: true });

export default model("User", userSchema);
