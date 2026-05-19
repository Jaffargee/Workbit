import React from "react";
import { Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import workbitImg from '@/assets/workbit.webp';

export const Logo: React.FC<{ size?: "sm" | "md" | "lg"; light?: boolean }> = ({
      size = "md",
      light = false,
}) => {
      const sizes = {
            sm: "text-lg",
            md: "text-2xl",
            lg: "text-4xl",
      };

      const iconSizes = {
            sm: 20,
            md: 28,
            lg: 40,
      };

      return (
            <Link to={'/'} className={`flex items-center gap-2 font-bold select-none tracking-tight ${sizes[size]} ${light ? "text-white" : "text-blue-600"}`}>
                  <div className={`p-1 rounded-lg ${light ? "bg-white text-blue-600" : "bg-primary text-white"}`}>
                        <Briefcase size={iconSizes[size]} />
                  </div>
                  <img src={workbitImg} alt="Workbit Logo" height={40} width={100} />
            </Link>
      );
};
