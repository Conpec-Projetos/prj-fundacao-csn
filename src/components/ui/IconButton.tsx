"use client";
import React from "react";

type IconButtonProps = {
    href?: string | null;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    disabled?: boolean;
    title?: string;
    ariaLabel?: string;
    className?: string;
    download?: boolean;
    children: React.ReactNode;
};

export default function IconButton({
    href,
    onClick,
    disabled,
    title,
    ariaLabel,
    className = "",
    download,
    children,
}: IconButtonProps) {
    const baseClass = `${className} inline-flex items-center justify-center`;

    if (href && !disabled) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={title}
                aria-label={ariaLabel || title}
                className={baseClass}
                download={download}
            >
                {children}
            </a>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={ariaLabel || title}
            aria-disabled={disabled ? true : undefined}
            disabled={disabled}
            className={`${baseClass} ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
        >
            {children}
        </button>
    );
}
