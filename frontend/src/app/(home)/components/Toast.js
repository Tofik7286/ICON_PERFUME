'use client'
import { useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle, FaTimes } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

// Define toast types with icons and CSS classes
const toastTypes = {
    success: {
        icon: <FaCheckCircle />,
        iconClass: "success-icon",
        progressBarClass: "success",
    },
    warning: {
        icon: <FaExclamationCircle />,
        iconClass: "warning-icon",
        progressBarClass: "warning",
    },
    info: {
        icon: <FaInfoCircle />,
        iconClass: "info-icon",
        progressBarClass: "info",
    },
    error: {
        icon: <FaTimesCircle />,
        iconClass: "error-icon",
        progressBarClass: "error",
    },
};

const Toast = ({ message, type, id, onDismiss }) => {
    const { icon, iconClass } = toastTypes[type];

    useEffect(() => {
        const timer = setTimeout(() => {
          onDismiss(id);
        }, 4000); // 4 seconds
    
        return () => clearTimeout(timer); // Cleanup timeout on unmount
      }, [onDismiss]);

    return (
        <div className={`toast max-h-[10em] toast-${type} show`}>
            <span className={iconClass}>{icon}</span>
            <p className="toast-message">{message}</p>
            <button className="dismiss-btn" onClick={() => onDismiss(id)}>
                <IoMdClose size={16} />
            </button>
        </div>
    );
};

export default Toast;
