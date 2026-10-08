"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../../component/Button";
import axios from "axios";
import { useRouter } from 'next/navigation';

function Page() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const showPassword = () => {
    setShowPass((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    setPhoneError("");
    setPasswordError("");

    if (!phone.trim()) {
      setPhoneError("Please enter the phone number / email address.");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

     try {
      const response = await axios.post(`/api/admin/login`,{
        email:phone,
        password:password,
      })
      if(response.status === 200){
       router.push("/admin/dashboard/home")
       router.refresh();
      }
     } catch (error) {
       setPhoneError("Oppos! Invalid credentials");
       hasError = true;
     }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#1C1C1C]">
      <form className="w-80" onSubmit={handleSubmit}>
        <Image
          src="/admin.png"
          alt="logo"
          width={200}
          height={150}
          className="mx-auto mb-2"
        />

        {/* Phone / Email */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Phone number / email address"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);

              if (e.target.value.trim()) {
                setPhoneError("");
              }
            }}
            className={`bg-[#1C1C1C] border rounded-full p-3 px-4 w-full text-white focus:outline-none text-sm placeholder-[#585858] ${
              phoneError
                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-[#585858] focus:ring-1 focus:ring-white"
            }`}
            autoFocus
          />

          {phoneError && (
            <p className="text-red-500 text-xs px-2 mt-1">
              {phoneError}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-3">
          {/* Input container */}
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);

                if (e.target.value.trim()) {
                  setPasswordError("");
                }
              }}
              className={`bg-[#1C1C1C] border rounded-full p-3 px-4 pr-12 w-full text-white focus:outline-none text-sm placeholder-[#585858] ${
                passwordError
                  ? "border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-[#585858] focus:ring-1 focus:ring-white"
              }`}
            />

            {/* Eye button stays centered inside input */}
            <button
              type="button"
              onClick={showPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Error is OUTSIDE relative container */}
          {passwordError && (
            <p className="text-red-500 text-xs px-2 mt-1">
              {passwordError}
            </p>
          )}
        </div>

        {/* Forgot Password */}
        <p className="text-gray-300 text-xs mb-4 px-2 leading-5">
          <span className="text-white hover:underline font-medium underline">
            Forgot your password?
          </span>{" "}
          Please contact the{" "}
          <a
            href="#"
            className="text-white hover:underline font-medium underline"
          >
            Developer
          </a>{" "}
          for any future assistance.
        </p>

        {/* Sign In */}
        <Button action={handleSubmit}>
          Sign In
        </Button>
      </form>
    </div>
  );
}

export default Page;

