"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import {
  Bell,
  Loader2,
  Mail,
  MessageCircle,
  Save,
  Send,
  Settings as SettingsIcon,
  CreditCard,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Key,
} from "lucide-react";

import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("mail");
  const [isSaving, setIsSaving] = useState(false);

  // =========================
  // Mail Configuration
  // =========================
  const [mailHost, setMailHost] = useState("");
  const [mailPort, setMailPort] = useState("587");
  const [mailUsername, setMailUsername] = useState("");
  const [mailPassword, setMailPassword] = useState("");
  const [mailFromName, setMailFromName] = useState("");
  const [mailFromEmail, setMailFromEmail] = useState("");
  const [mailEncryption, setMailEncryption] = useState("TLS");

  // =========================
  // OneSignal
  // =========================
  const [oneSignalAppId, setOneSignalAppId] = useState("");
  const [oneSignalRestApiKey, setOneSignalRestApiKey] = useState("");
  const [oneSignalEnabled, setOneSignalEnabled] = useState(false);

  // =========================
  // Payment Settings
  // =========================
  const [bkashNumber, setBkashNumber] = useState("");
  const [bkashType, setBkashType] = useState("Personal");
  const [bkashEnabled, setBkashEnabled] = useState(true);

  const [nagadNumber, setNagadNumber] = useState("");
  const [nagadType, setNagadType] = useState("Personal");
  const [nagadEnabled, setNagadEnabled] = useState(true);

  const [rocketNumber, setRocketNumber] = useState("");
  const [rocketType, setRocketType] = useState("Personal");
  const [rocketEnabled, setRocketEnabled] = useState(true);

  // =========================
  // Maintenance
  // =========================
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [maintenanceTitle, setMaintenanceTitle] = useState(
    "We are currently under maintenance.",
  );

  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "We are working on some improvements. Please check back soon.",
  );

  // =========================
  // Social Links
  // =========================
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // =========================
  // WhatsApp
  // =========================
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [whatsappMessage, setWhatsappMessage] = useState(
    "Hello, I need some help.",
  );

  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  // =========================
  // ImgBB Storage
  // =========================
  const [imgbbApiKey, setImgbbApiKey] = useState("");
  const [imgbbEnabled, setImgbbEnabled] = useState(true);
  const [isTestingImgbb, setIsTestingImgbb] = useState(false);
  const [imgbbTestStatus, setImgbbTestStatus] = useState(null);

  const [loading, setLoading] = useState(true);

  // Load existing settings
  useEffect(() => {
    let isMounted = true;
    async function fetchSettings() {
      try {
        const res = await axios.get("/api/admin/settings");
        if (res.data.success && isMounted) {
          const s = res.data.data;
          if (s.mail) {
            setMailHost(s.mail.host || "");
            setMailPort(String(s.mail.port || 587));
            setMailUsername(s.mail.username || "");
            setMailPassword(s.mail.password || "");
            setMailFromName(s.mail.fromName || "");
            setMailFromEmail(s.mail.fromEmail || "");
            setMailEncryption(s.mail.encryption || "TLS");
          }
          if (s.oneSignal) {
            setOneSignalAppId(s.oneSignal.appId || "");
            setOneSignalRestApiKey(s.oneSignal.restApiKey || "");
            setOneSignalEnabled(Boolean(s.oneSignal.enabled));
          }
          if (s.payments) {
            if (s.payments.bkash) {
              setBkashNumber(s.payments.bkash.number || "");
              setBkashType(s.payments.bkash.type || "Personal");
              setBkashEnabled(s.payments.bkash.enabled ?? true);
            }
            if (s.payments.nagad) {
              setNagadNumber(s.payments.nagad.number || "");
              setNagadType(s.payments.nagad.type || "Personal");
              setNagadEnabled(s.payments.nagad.enabled ?? true);
            }
            if (s.payments.rocket) {
              setRocketNumber(s.payments.rocket.number || "");
              setRocketType(s.payments.rocket.type || "Personal");
              setRocketEnabled(s.payments.rocket.enabled ?? true);
            }
          }
          if (s.maintenance) {
            setMaintenanceMode(Boolean(s.maintenance.enabled));
            if (s.maintenance.title) setMaintenanceTitle(s.maintenance.title);
            if (s.maintenance.message) setMaintenanceMessage(s.maintenance.message);
          }
          if (s.social) {
            setFacebookUrl(s.social.facebook || "");
            setInstagramUrl(s.social.instagram || "");
            setXUrl(s.social.x || "");
            setYoutubeUrl(s.social.youtube || "");
          }
          if (s.whatsapp) {
            setWhatsappNumber(s.whatsapp.number || "");
            if (s.whatsapp.message) setWhatsappMessage(s.whatsapp.message);
            setWhatsappEnabled(s.whatsapp.enabled ?? true);
          }
          if (s.imgbb) {
            setImgbbApiKey(s.imgbb.apiKey || "");
            setImgbbEnabled(s.imgbb.enabled ?? true);
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // =========================
  // Save Settings
  // =========================
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const settingsData = {
        mail: {
          host: mailHost,
          port: Number(mailPort),
          username: mailUsername,
          password: mailPassword,
          fromName: mailFromName,
          fromEmail: mailFromEmail,
          encryption: mailEncryption,
        },

        oneSignal: {
          appId: oneSignalAppId,
          restApiKey: oneSignalRestApiKey,
          enabled: oneSignalEnabled,
        },

        payments: {
          bkash: {
            number: bkashNumber,
            type: bkashType,
            enabled: bkashEnabled,
          },

          nagad: {
            number: nagadNumber,
            type: nagadType,
            enabled: nagadEnabled,
          },

          rocket: {
            number: rocketNumber,
            type: rocketType,
            enabled: rocketEnabled,
          },
        },

        maintenance: {
          enabled: maintenanceMode,
          title: maintenanceTitle,
          message: maintenanceMessage,
        },

        social: {
          facebook: facebookUrl,
          instagram: instagramUrl,
          x: xUrl,
          youtube: youtubeUrl,
        },

        whatsapp: {
          number: whatsappNumber,
          message: whatsappMessage,
          enabled: whatsappEnabled,
        },

        imgbb: {
          apiKey: imgbbApiKey,
          enabled: imgbbEnabled,
        },
      };

      const res = await axios.put("/api/admin/settings", settingsData);

      if (res.data.success) {
        toast.success("Settings saved successfully.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // =========================
  // Test ImgBB API Key
  // =========================
  const handleTestImgbb = async () => {
    if (!imgbbApiKey.trim()) {
      const msg = "Please enter an ImgBB API Key first.";
      setImgbbTestStatus({
        success: false,
        message: msg,
      });
      toast.error(msg);
      return;
    }

    setIsTestingImgbb(true);
    setImgbbTestStatus(null);

    try {
      const res = await axios.post("/api/admin/upload", {
        action: "test",
        apiKey: imgbbApiKey.trim(),
      });

      if (res.data.success) {
        const msg = res.data.message || "ImgBB API Key verified successfully!";
        setImgbbTestStatus({
          success: true,
          message: msg,
        });
        toast.success(msg);
      } else {
        const msg = res.data.message || "Failed to verify API Key.";
        setImgbbTestStatus({
          success: false,
          message: msg,
        });
        toast.error(msg);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to verify API Key. Please check the key.";
      setImgbbTestStatus({
        success: false,
        message: msg,
      });
      toast.error(msg);
    } finally {
      setIsTestingImgbb(false);
    }
  };

  // =========================
  // Reusable Classes
  // =========================
  const inputClass =
    "w-full bg-[#353638] border border-[#444444] rounded-xl px-4 py-3 text-sm text-[#e5e5e5] placeholder:text-[#777777] outline-none focus:border-[#666666] transition-colors";

  const textareaClass =
    "w-full bg-[#353638] border border-[#444444] rounded-xl px-4 py-3 text-sm text-[#e5e5e5] placeholder:text-[#777777] outline-none focus:border-[#666666] transition-colors resize-none";

  const labelClass = "block text-sm font-medium text-[#e5e5e5] mb-2";

  // =========================
  // Tabs
  // =========================
  const tabs = [
    {
      id: "mail",
      label: "Mail",
      icon: Mail,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "payments",
      label: "Payments",
      icon: CreditCard,
    },
    {
      id: "imgbb",
      label: "ImgBB Storage",
      icon: ImageIcon,
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: SettingsIcon,
    },
    {
      id: "social",
      label: "Social",
      icon: Send,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="w-full">
      {/* =========================
          Header
      ========================== */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">Settings</h1>

            <p className="text-[#a3a3a3] text-xs sm:text-sm">
              Manage your store configuration, payment methods, notifications
              and integrations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="hidden lg:flex items-center justify-center gap-2 bg-white text-black text-sm font-medium px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}

            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* =========================
          Tabs
      ========================== */}
      <div className="border-b border-[#353638] mb-8">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2
                  whitespace-nowrap
                  px-4 py-3
                  text-sm font-medium
                  transition-colors
                  ${
                    isActive
                      ? "text-white"
                      : "text-[#888888] hover:text-[#d4d4d4]"
                  }
                `}
              >
                <Icon className="w-4 h-4" />

                {tab.label}

                {isActive && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================
          CONTENT
      ========================== */}
      <div className="w-full">
        {/* ==================================================
            MAIL
        ================================================== */}
        {activeTab === "mail" && (
          <SettingsSection
            icon={<Mail className="w-4 h-4" />}
            title="Mail Configuration"
            description="Configure your SMTP email settings."
          >
            <div className="space-y-5">
              <div>
                <label className={labelClass}>SMTP Host</label>

                <input
                  type="text"
                  value={mailHost}
                  onChange={(e) => setMailHost(e.target.value)}
                  placeholder="smtp.example.com"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>SMTP Port</label>

                  <input
                    type="number"
                    value={mailPort}
                    onChange={(e) => setMailPort(e.target.value)}
                    placeholder="587"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Encryption</label>

                  <select
                    value={mailEncryption}
                    onChange={(e) => setMailEncryption(e.target.value)}
                    className={inputClass}
                  >
                    <option value="TLS">TLS</option>
                    <option value="SSL">SSL</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>SMTP Username</label>

                <input
                  type="text"
                  value={mailUsername}
                  onChange={(e) => setMailUsername(e.target.value)}
                  placeholder="username@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>SMTP Password</label>

                <input
                  type="password"
                  value={mailPassword}
                  onChange={(e) => setMailPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>From Name</label>

                  <input
                    type="text"
                    value={mailFromName}
                    onChange={(e) => setMailFromName(e.target.value)}
                    placeholder="My Store"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>From Email</label>

                  <input
                    type="email"
                    value={mailFromEmail}
                    onChange={(e) => setMailFromEmail(e.target.value)}
                    placeholder="hello@example.com"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </SettingsSection>
        )}

        {/* ==================================================
            NOTIFICATIONS
        ================================================== */}
        {activeTab === "notifications" && (
          <SettingsSection
            icon={<Bell className="w-4 h-4" />}
            title="OneSignal Configuration"
            description="Configure push notifications for your customers."
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#353638] border border-[#444444]">
                <div>
                  <p className="text-sm font-medium">
                    Enable push notifications
                  </p>

                  <p className="text-xs text-[#777777] mt-1">
                    Allow OneSignal to send push notifications.
                  </p>
                </div>

                <Toggle
                  enabled={oneSignalEnabled}
                  onChange={() => setOneSignalEnabled(!oneSignalEnabled)}
                />
              </div>

              <div>
                <label className={labelClass}>App ID</label>

                <input
                  type="text"
                  value={oneSignalAppId}
                  onChange={(e) => setOneSignalAppId(e.target.value)}
                  placeholder="OneSignal App ID"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>REST API Key</label>

                <input
                  type="password"
                  value={oneSignalRestApiKey}
                  onChange={(e) => setOneSignalRestApiKey(e.target.value)}
                  placeholder="OneSignal REST API Key"
                  className={inputClass}
                />
              </div>
            </div>
          </SettingsSection>
        )}

        {/* ==================================================
            PAYMENTS
        ================================================== */}
        {activeTab === "payments" && (
          <SettingsSection
            icon={<CreditCard className="w-4 h-4" />}
            title="Payment Settings"
            description="Configure manual mobile banking payment methods."
          >
            <div className="space-y-8">
              <PaymentMethod
                name="bKash"
                description="Manual bKash payment"
                number={bkashNumber}
                setNumber={setBkashNumber}
                type={bkashType}
                setType={setBkashType}
                enabled={bkashEnabled}
                setEnabled={setBkashEnabled}
                inputClass={inputClass}
              />

              <PaymentMethod
                name="Nagad"
                description="Manual Nagad payment"
                number={nagadNumber}
                setNumber={setNagadNumber}
                type={nagadType}
                setType={setNagadType}
                enabled={nagadEnabled}
                setEnabled={setNagadEnabled}
                inputClass={inputClass}
              />

              <PaymentMethod
                name="Rocket"
                description="Manual Rocket payment"
                number={rocketNumber}
                setNumber={setRocketNumber}
                type={rocketType}
                setType={setRocketType}
                enabled={rocketEnabled}
                setEnabled={setRocketEnabled}
                inputClass={inputClass}
              />
            </div>
          </SettingsSection>
        )}

        {/* ==================================================
            IMGBB STORAGE
        ================================================== */}
        {activeTab === "imgbb" && (
          <SettingsSection
            icon={<ImageIcon className="w-4 h-4" />}
            title="ImgBB Image Storage"
            description="Configure ImgBB API to host all product images on ImgBB CDN servers."
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#353638] border border-[#444444]">
                <div>
                  <p className="text-sm font-medium">Enable ImgBB Image Uploads</p>
                  <p className="text-xs text-[#777777] mt-1">
                    When enabled, product images are automatically uploaded directly to ImgBB and saved as hosted URLs.
                  </p>
                </div>

                <Toggle
                  enabled={imgbbEnabled}
                  onChange={() => setImgbbEnabled(!imgbbEnabled)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#e5e5e5]">
                    ImgBB API Key
                  </label>

                  <a
                    href="https://api.imgbb.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Get Free API Key
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    value={imgbbApiKey}
                    onChange={(e) => {
                      setImgbbApiKey(e.target.value);
                      setImgbbTestStatus(null);
                    }}
                    placeholder="Enter your 32-character ImgBB API Key"
                    className={inputClass}
                  />
                </div>

                <p className="text-xs text-[#777777] mt-2">
                  Find your API key on{" "}
                  <a
                    href="https://api.imgbb.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline underline-offset-2 hover:text-gray-300"
                  >
                    api.imgbb.com
                  </a>
                  . Create a free account and click &quot;Get API key&quot;.
                </p>
              </div>

              {/* Test Connection Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestImgbb}
                  disabled={isTestingImgbb || !imgbbApiKey.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#555555] bg-[#3a3b3e] text-sm font-medium text-white hover:bg-[#45464a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTestingImgbb ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  ) : (
                    <Key className="w-4 h-4 text-emerald-400" />
                  )}
                  {isTestingImgbb ? "Verifying with ImgBB..." : "Test API Key Connection"}
                </button>

                {imgbbTestStatus && (
                  <div
                    className={`mt-3 p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                      imgbbTestStatus.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                  >
                    {imgbbTestStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{imgbbTestStatus.message}</span>
                  </div>
                )}
              </div>

              {/* How it works info card */}
              <div className="rounded-xl border border-[#444444] bg-[#2d2e30] p-4 text-xs text-[#a3a3a3] space-y-2">
                <p className="font-semibold text-white">How ImgBB Storage Works:</p>
                <ul className="list-disc list-inside space-y-1 text-[#888888]">
                  <li>When you upload a product image in Add or Edit Product, it is immediately uploaded to ImgBB.</li>
                  <li>ImgBB returns a high-speed CDN URL (e.g. <code>https://i.ibb.co/...</code>).</li>
                  <li>Your database only stores lightweight URLs, keeping your store fast and lightweight.</li>
                </ul>
              </div>
            </div>
          </SettingsSection>
        )}

        {/* ==================================================
            MAINTENANCE
        ================================================== */}
        {activeTab === "maintenance" && (
          <SettingsSection
            icon={<SettingsIcon className="w-4 h-4" />}
            title="Maintenance Mode"
            description="Temporarily disable your storefront."
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#353638] border border-[#444444]">
                <div>
                  <p className="text-sm font-medium">Enable maintenance mode</p>

                  <p className="text-xs text-[#777777] mt-1">
                    Visitors will see the maintenance page.
                  </p>
                </div>

                <Toggle
                  enabled={maintenanceMode}
                  onChange={() => setMaintenanceMode(!maintenanceMode)}
                />
              </div>

              <div>
                <label className={labelClass}>Maintenance Title</label>

                <input
                  type="text"
                  value={maintenanceTitle}
                  onChange={(e) => setMaintenanceTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Maintenance Message</label>

                <textarea
                  rows={5}
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className={textareaClass}
                />
              </div>
            </div>
          </SettingsSection>
        )}

        {/* ==================================================
            SOCIAL
        ================================================== */}
        {activeTab === "social" && (
          <SettingsSection
            icon={<Send className="w-4 h-4" />}
            title="Social Links"
            description="Add your social media profile links."
          >
            <div className="space-y-5">
              <SocialInput
                icon={<FaFacebookF />}
                label="Facebook URL"
                value={facebookUrl}
                onChange={setFacebookUrl}
                placeholder="https://facebook.com/yourpage"
                inputClass={inputClass}
              />

              <SocialInput
                icon={<FaInstagram />}
                label="Instagram URL"
                value={instagramUrl}
                onChange={setInstagramUrl}
                placeholder="https://instagram.com/yourprofile"
                inputClass={inputClass}
              />

              <SocialInput
                icon={<FaXTwitter />}
                label="X / Twitter URL"
                value={xUrl}
                onChange={setXUrl}
                placeholder="https://x.com/yourprofile"
                inputClass={inputClass}
              />

              <SocialInput
                icon={<FaYoutube />}
                label="YouTube URL"
                value={youtubeUrl}
                onChange={setYoutubeUrl}
                placeholder="https://youtube.com/@yourchannel"
                inputClass={inputClass}
              />
            </div>
          </SettingsSection>
        )}

        {/* ==================================================
            WHATSAPP
        ================================================== */}
        {activeTab === "whatsapp" && (
          <SettingsSection
            icon={<MessageCircle className="w-4 h-4" />}
            title="WhatsApp Support"
            description="Configure your customer support WhatsApp link."
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#353638] border border-[#444444]">
                <div>
                  <p className="text-sm font-medium">Enable WhatsApp support</p>

                  <p className="text-xs text-[#777777] mt-1">
                    Show WhatsApp support to customers.
                  </p>
                </div>

                <Toggle
                  enabled={whatsappEnabled}
                  onChange={() => setWhatsappEnabled(!whatsappEnabled)}
                />
              </div>

              <div>
                <label className={labelClass}>WhatsApp Number</label>

                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="8801XXXXXXXXX"
                  className={inputClass}
                />

                <p className="text-[11px] text-[#777777] mt-2">
                  Include country code without the + sign.
                </p>
              </div>

              <div>
                <label className={labelClass}>Default Message</label>

                <textarea
                  rows={4}
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  placeholder="Hello, I need some help."
                  className={textareaClass}
                />
              </div>

              <div>
                <label className={labelClass}>Generated Support Link</label>

                <div className="bg-[#353638] border border-[#444444] rounded-xl px-4 py-3 text-xs text-[#888888] break-all">
                  {whatsappNumber.replace(/[^0-9]/g, "")
                    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}${
                        whatsappMessage?.trim()
                          ? `?text=${encodeURIComponent(whatsappMessage.trim())}`
                          : ""
                      }`
                    : "Your WhatsApp support link will appear here."}
                </div>
              </div>
            </div>
          </SettingsSection>
        )}
      </div>

      {/* Bottom Divider */}
      <div className="w-full h-px bg-[#353638] my-6 sm:my-8 md:hidden" />

      {/* Bottom Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 md:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto text-sm font-medium px-5 py-2.5 rounded-full border border-[#444444] text-[#e5e5e5] hover:bg-[#353638] transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex justify-center items-center sm:w-auto bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}

          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   SETTINGS SECTION
========================================================= */

function SettingsSection({ icon, title, description, children }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-7">
        <div className="w-10 h-10 rounded-xl bg-[#353638] border border-[#444444] flex items-center justify-center shrink-0 text-[#e5e5e5]">
          {icon}
        </div>

        <div>
          <h2 className="text-base font-semibold">{title}</h2>

          <p className="text-xs text-[#888888] mt-1">{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={enabled}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        enabled ? "bg-white" : "bg-[#444444]"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
          enabled ? "left-6 bg-black" : "left-1 bg-[#999999]"
        }`}
      />
    </button>
  );
}

/* =========================================================
   PAYMENT METHOD
========================================================= */

function PaymentMethod({
  name,
  description,
  number,
  setNumber,
  type,
  setType,
  enabled,
  setEnabled,
  inputClass,
}) {
  return (
    <div className="pb-8 border-b border-[#353638] last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium">{name}</h3>

          <p className="text-xs text-[#777777] mt-1">{description}</p>
        </div>

        <Toggle enabled={enabled} onChange={() => setEnabled(!enabled)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="01XXXXXXXXX"
          className={inputClass}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={inputClass}
        >
          <option value="Personal">Personal</option>

          <option value="Merchant">Merchant</option>
        </select>
      </div>
    </div>
  );
}

/* =========================================================
   SOCIAL INPUT
========================================================= */

function SocialInput({
  icon,
  label,
  value,
  onChange,
  placeholder,
  inputClass,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#888888]">
          {icon}
        </div>

        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputClass} pl-12`}
        />
      </div>
    </div>
  );
}
