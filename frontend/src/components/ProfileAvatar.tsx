import React, { FC, memo } from "react";

interface ProfileAvatarProps {
  username: string;
  profile_picture?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export const getInitials = (username: string) => {
  return username
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getProfileColor = (username: string) => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-cyan-500",
  ];

  let hash = 0;
  
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const ProfileAvatar: FC<ProfileAvatarProps> = ({
  username,
  profile_picture,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    xs: "w-4 h-4 text-xs",
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-24 h-24 text-2xl",
  };

  const sizeClass = sizeClasses[size];

  if (profile_picture) {
    return (
      <img
        src={profile_picture}
        alt={username}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-medium ${getProfileColor(
        username
      )} ${className}`}
    >
      {getInitials(username)}
    </div>
  );
};

export default memo(ProfileAvatar);
