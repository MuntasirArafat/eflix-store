"use client";

import React, { useEffect, useState } from "react";
import {
  LogOut,
  Loader2,
  UserRound,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserCheck,
  Shield,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Skeleton } from "@/components/admin/AdminSkeleton";

export default function ProfilePage() {
  const router = useRouter();

  // Profile data states
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    createdAt: null,
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Password update states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Fetch admin profile
  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoadingProfile(true);
        const res = await axios.get("/api/admin/profile");
        if (res.data?.success && res.data?.data) {
          const data = res.data.data;
          setProfile(data);
          setName(data.name || "");
          setEmail(data.email || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  // Update profile details
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage(null);

    if (!name.trim()) {
      setProfileMessage({ type: "error", text: "Name cannot be empty." });
      return;
    }
    if (!email.trim()) {
      setProfileMessage({ type: "error", text: "Email cannot be empty." });
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const res = await axios.put("/api/admin/profile", {
        name: name.trim(),
        email: email.trim(),
      });

      if (res.data?.success) {
        setProfile((prev) => ({
          ...prev,
          name: res.data.data.name,
          email: res.data.data.email,
        }));
        setProfileMessage({
          type: "success",
          text: "Profile updated successfully.",
        });
      }
    } catch (err) {
      console.error(err);
      setProfileMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Update password
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!password || !confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Please enter your new password.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    if (password.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const res = await axios.put("/api/admin/profile/password", {
        password,
      });

      if (res.data?.success) {
        setPasswordMessage({
          type: "success",
          text: "Password updated successfully.",
        });
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error(error);
      setPasswordMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update password.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; max-age=0;";
    router.push("/admin/login");
    router.refresh();
  };

  const initials = (name || profile.name || "AD")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Active Admin";

  return (
    <div className="w-full max-w-4xl">
      {/* HEADER */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold mb-2">Profile</h1>
        <p className="text-[#a3a3a3] text-xs sm:text-sm">
          Manage your account profile and credentials.
        </p>
      </div>

      <div className="w-full space-y-6">
        {/* ACCOUNT OVERVIEW CARD */}
        <section>
          <div className="bg-[#353638] border border-[#444444] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {isLoadingProfile ? (
              <div className="flex items-center gap-4 min-w-0" aria-busy="true">
                <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3.5 w-52" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ) : (
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#4469ff] flex items-center justify-center text-white font-bold text-base sm:text-xl shrink-0 shadow-lg">
                {initials}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-base sm:text-lg font-medium truncate">
                    {profile.name || "Administrator"}
                  </p>
                </div>

                <p className="text-[#999999] text-xs sm:text-sm mt-1 truncate">
                  {profile.email || "admin@example.com"}
                </p>

                {profile.createdAt && (
                  <p className="text-[#777777] text-[11px] mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Member since {formattedDate}
                  </p>
                )}
              </div>
            </div>
            )}

            <div className="w-11 h-11 sm:w-12 sm:h-12  max-sm:hidden rounded-full bg-[#2c2d2f] flex items-center justify-center shrink-0 self-end sm:self-auto border border-[#444444]">
              <UserRound
                className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#a3a3a3]"
                strokeWidth={1.8}
              />
            </div>
          </div>
        </section>

        {/* EDIT PROFILE DETAILS */}
        <section className="bg-[#2a2b2d] border border-[#3e3f42] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">
                Personal Information
              </h2>
              <p className="text-xs text-[#888888] mt-0.5">
                Update your display name and email address.
              </p>
            </div>
          </div>

          {profileMessage && (
            <div
              className={`mb-5 p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 ${
                profileMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {profileMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#e5e5e5] mb-2">
                  Full Name
                </label>
                {isLoadingProfile ? (
                  <Skeleton className="h-[42px] w-full rounded-xl" />
                ) : (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full bg-[#353638] border border-[#444444] rounded-xl px-4 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#777777] outline-none focus:border-[#666666] transition-colors"
                />
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#e5e5e5] mb-2">
                  Email Address
                </label>
                {isLoadingProfile ? (
                  <Skeleton className="h-[42px] w-full rounded-xl" />
                ) : (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full bg-[#353638] border border-[#444444] rounded-xl px-4 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#777777] outline-none focus:border-[#666666] transition-colors"
                />
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile || isLoadingProfile}
                className="flex items-center justify-center gap-2 bg-[#4469ff] text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#3459ee] transition-colors disabled:opacity-50"
              >
                {isUpdatingProfile && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isUpdatingProfile ? "Saving Changes..." : "Save Details"}
              </button>
            </div>
          </form>
        </section>

        {/* PASSWORD CHANGE */}
        <section className="bg-[#2a2b2d] border border-[#3e3f42] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">
                Change Password
              </h2>
              <p className="text-xs text-[#888888] mt-0.5">
                Ensure your account is using a secure password.
              </p>
            </div>
          </div>

          {passwordMessage && (
            <div
              className={`mb-5 p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 ${
                passwordMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {passwordMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordUpdate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#e5e5e5] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="w-full bg-[#353638] border border-[#444444] rounded-xl px-4 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#777777] outline-none focus:border-[#666666] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#e5e5e5] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="w-full bg-[#353638] border border-[#444444] rounded-xl px-4 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#777777] outline-none focus:border-[#666666] transition-colors"
                />
              </div>
            </div>

            <p className="text-[11px] text-[#777777] mt-3">
              Minimum 6 characters. Use letters, numbers, and symbols for high strength.
            </p>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="flex items-center justify-center gap-2 bg-white text-black text-xs sm:text-sm font-medium px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isUpdatingPassword && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>

        {/* LOGOUT */}
        <section className="bg-[#241b1b]/50 border border-[#4a2929]/50 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-white">Sign Out</h2>
              <p className="text-xs text-[#888888] mt-1">
                Terminate your active session and sign out of the admin panel.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-[#f87171] border border-[#4a2929] bg-[#241b1b] px-5 py-2.5 rounded-full hover:bg-[#2d2020] hover:border-[#633333] transition-colors w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
