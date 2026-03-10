import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef(
  ({ className, type, startIcon: StartIcon, endIcon: EndIcon, onEndIconClick, ...props }, ref) => {
    return (
      <div className="w-full relative">
        {StartIcon && (
          <div className="absolute left-1.5 top-1/2 transform -translate-y-1/2">
            <StartIcon size={18} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            StartIcon ? "pl-8" : "",
            EndIcon ? "pr-8" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {EndIcon && (
          <div onClick={onEndIconClick} className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{cursor: "pointer"}}>
            <EndIcon size={17} />
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
