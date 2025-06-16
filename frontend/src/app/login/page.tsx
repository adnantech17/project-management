"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Moon } from "lucide-react";
import { login } from "@/service/auth";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PasswordInput from "@/components/PasswordInput";
import type { LoginFormInputs } from "@/types/forms";

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin, isAuthenticated, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      username: "",
      password: "",
      keepLoggedIn: false,
    },
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  const onSubmit = async (data: LoginFormInputs) => {
    setError("");
    try {
      await login(data.username, data.password);
      await authLogin();
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600 mb-8">
              Enter your email and password to sign in!
            </p>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Username*"
                type="text"
                placeholder="Username"
                error={errors.username?.message}
                {...register("username", { required: "Username is required" })}
              />

              <PasswordInput
                label="Password*"
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register("password", { required: "Password is required" })}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="keepLoggedIn"
                    type="checkbox"
                    {...register("keepLoggedIn")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="keepLoggedIn"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Keep me logged in
                  </label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </a>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
              >
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-500"
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-2">AD Project Management</h1>
              <p className="text-lg text-blue-100 max-w-md mx-auto leading-relaxed">
                Streamline Your Workflow, Amplify Your Success.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <Button
        variant="primary"
        size="md"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg"
      >
        <Moon className="w-5 h-5" />
      </Button>
    </div>
  );
}
