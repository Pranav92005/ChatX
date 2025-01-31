'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(false);

  async function loginWithGoogle() {
    setLoading(true);
    try {
      await signIn('google');
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      toast.error("An error occurred while signing in.");
    } finally {
      setLoading(false); // Corrected: Ensure loading is properly reset
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome</h1>
        <div className="flex justify-center mb-6">
          <Image
            src="/google-logo.svg"
            alt="Google Logo"
            width={50}
            height={50}
          />
        </div>
        <Button
          className="w-full flex items-center justify-center space-x-2"
          variant="outline"
          onClick={loginWithGoogle}
          disabled={loading} // Disable button while loading to prevent multiple clicks
        >
          <Image
            src="/google-logo.svg"
            alt="Google Logo"
            width={20}
            height={20}
          />
          <span>{loading ? "Signing in..." : "Login with Google"}</span>
        </Button>
      </div>
    </div>
  );
}
