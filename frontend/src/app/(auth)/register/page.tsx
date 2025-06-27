"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { register as registerService } from "@/service/auth";
import { Moon } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/form/Input";
import PasswordInput from "@/components/form/PasswordInput";
import type { RegisterFormInputs } from "@/types/forms";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  async function onSubmit(data: RegisterFormInputs) {
    setError("");
    try {
      await registerService(data.email, data.username, data.password);
      router.push("/login");
    } catch (err) {
      setError("Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Register</h2>
            <p className="text-gray-600 mb-8">
              Create your account to get started!
            </p>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="First Name"
                type="text"
                placeholder="First Name"
                error={errors.firstName?.message}
                {...register("firstName", {
                  required: "First name is required",
                })}
              />

              <Input
                label="Last Name"
                required={true}
                type="text"
                placeholder="Last Name"
                error={errors.lastName?.message}
                {...register("lastName", { required: "Last name is required" })}
              />

              <Input
                label="Email"
                required={true}
                type="email"
                placeholder="info@gmail.com"
                error={errors.email?.message}
                {...register("email", { required: "Email is required" })}
              />

              <Input
                label="Username"
                required={true}
                type="text"
                placeholder="Username"
                error={errors.username?.message}
                {...register("username", { required: "Username is required" })}
              />

              <PasswordInput
                label="Password"
                required={true}
                placeholder="Password"
                error={errors.password?.message}
                {...register("password", { required: "Password is required" })}
              />
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
                Register
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:text-blue-500">
                Sign In
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
