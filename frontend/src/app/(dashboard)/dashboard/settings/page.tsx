"use client";

import React, { FC, useState, useRef, useEffect } from "react";
import { Camera, Save, User, Mail } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/form/Input";
import ProfileAvatar from "@/components/ProfileAvatar";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/service/auth";
import { UserUpdateForm } from "@/types/forms";
import { resizeImageToBase64, validateImageFile } from "@/utils/image";

const SettingsPage: FC = () => {
  const router = useRouter();
  const { user, refetchUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [formData, setFormData] = useState<UserUpdateForm>({
    first_name: "",
    last_name: "",
    profile_picture: "",
  });
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        profile_picture: user.profile_picture || "",
      });
      setPreviewImage(user.profile_picture || "");
    }
  }, [user]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, WebP) under 5MB.");
      return;
    }

    try {
      setError("");
      const base64Image = await resizeImageToBase64(file, 128);
      setPreviewImage(base64Image);
      setFormData(prev => ({ ...prev, profile_picture: base64Image }));
    } catch (err) {
      setError("Failed to process image. Please try again.");
      console.error("Image processing error:", err);
    }
  };

  const handleInputChange = (field: keyof UserUpdateForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const updateData: UserUpdateForm = {};
      
      if (formData.first_name !== (user.first_name || "")) {
        updateData.first_name = formData.first_name;
      }
      if (formData.last_name !== (user.last_name || "")) {
        updateData.last_name = formData.last_name;
      }
      if (formData.profile_picture !== (user.profile_picture || "")) {
        updateData.profile_picture = formData.profile_picture;
      }

      if (Object.keys(updateData).length > 0) {
        await updateUser(updateData);
        await refetchUser();
        setSuccess("Profile updated successfully!");
      } else {
        setSuccess("No changes to save.");
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage("");
    setFormData(prev => ({ ...prev, profile_picture: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  <ProfileAvatar
                    username={user.username}
                    profile_picture={previewImage}
                    size="2xl"
                    className="border-4 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
                  <p className="text-gray-500 text-sm">Update your profile picture and information</p>
                  {previewImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-red-600 hover:text-red-700 text-sm mt-2"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <Input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Username
                  </label>
                  <Input
                    type="text"
                    value={user.username}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">Username cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
