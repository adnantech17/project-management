import React, { FC } from "react";
import { getActionIconType, getActionIconColor, ActivityActionType } from "@/utils/activity";

interface ActivityIconProps {
  actionType: ActivityActionType;
  size?: number;
  variant?: "default" | "circled";
  className?: string;
}

const ActivityIcon: FC<ActivityIconProps> = ({ 
  actionType, 
  size = 4, 
  variant = "default",
  className = "" 
}) => {
  const IconComponent = getActionIconType(actionType);
  const iconColor = getActionIconColor(actionType);
  const iconSize = size * 4;

  if (variant === "circled") {
    const circleSize = size === 4 ? "w-6 h-6" : size === 5 ? "w-8 h-8" : "w-10 h-10";
    
    return (
      <div className={`flex-shrink-0 ${circleSize} rounded-full bg-white border-2 border-gray-200 flex items-center justify-center ${className}`}>
        <IconComponent size={iconSize} className={iconColor} />
      </div>
    );
  }

  return (
    <div className={className}>
      <IconComponent size={iconSize} className={iconColor} />
    </div>
  );
};

export default ActivityIcon;
