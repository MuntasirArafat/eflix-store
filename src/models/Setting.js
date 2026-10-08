import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "general_settings",
      unique: true,
    },
    mail: {
      host: { type: String, default: "" },
      port: { type: Number, default: 587 },
      username: { type: String, default: "" },
      password: { type: String, default: "" },
      fromName: { type: String, default: "" },
      fromEmail: { type: String, default: "" },
      encryption: { type: String, default: "TLS" },
    },
    oneSignal: {
      appId: { type: String, default: "" },
      restApiKey: { type: String, default: "" },
      enabled: { type: Boolean, default: false },
    },
    payments: {
      bkash: {
        number: { type: String, default: "" },
        type: { type: String, default: "Personal" },
        enabled: { type: Boolean, default: true },
      },
      nagad: {
        number: { type: String, default: "" },
        type: { type: String, default: "Personal" },
        enabled: { type: Boolean, default: true },
      },
      rocket: {
        number: { type: String, default: "" },
        type: { type: String, default: "Personal" },
        enabled: { type: Boolean, default: true },
      },
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      title: {
        type: String,
        default: "We are currently under maintenance.",
      },
      message: {
        type: String,
        default: "We are working on some improvements. Please check back soon.",
      },
    },
    social: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      x: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    whatsapp: {
      number: { type: String, default: "" },
      message: { type: String, default: "Hello, I need some help." },
      enabled: { type: Boolean, default: true },
    },
    imgbb: {
      apiKey: { type: String, default: "" },
      enabled: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Setting && !mongoose.models.Setting.schema.paths.imgbb) {
  delete mongoose.models.Setting;
}

const Setting =
  mongoose.models.Setting ||
  mongoose.model("Setting", SettingSchema);

export default Setting;
