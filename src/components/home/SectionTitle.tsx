import React from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  alignment?: "left" | "center";
  className?: string;
  accent?: "emerald" | "purple" | "default";
  darkMode?: boolean;
}

export default function SectionTitle({
  title,
  subtitle,
  alignment = "center",
  className = "",
  accent = "default",
  darkMode = false,
}: SectionTitleProps) {
  const getAccentColors = () => {
    switch (accent) {
      case "emerald":
        return {
          primary: "accent",
          light: darkMode ? "accent/20" : "accent/10",
        };
      case "purple":
        return {
          primary: "primary",
          light: darkMode ? "primary/20" : "primary/10",
        };
      default:
        return {
          primary: darkMode ? "white" : "black",
          light: darkMode ? "white/10" : "gray-50",
        };
    }
  };

  const colors = getAccentColors();

  return (
    <div className={`mb-12 sm:mb-14 md:mb-16 text-center ${className}`}>
      <div className='max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-6'>
        {subtitle && (
          <div className='mb-3 sm:mb-4'>
            <span
              className={`inline-block text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-${colors.primary} font-semibold px-2.5 sm:px-3 py-1 bg-${colors.light} rounded-full`}>
              {subtitle}
            </span>
          </div>
        )}

        <h2
          className={`text-2xl sm:text-3xl md:text-4xl font-bold ${darkMode ? "text-white" : "text-gray-900"} ${darkMode ? "mb-5 sm:mb-6" : "mb-0"} leading-tight px-2 sm:px-0`}>
          {title.split(" ").map((word, index) => (
            <span
              key={index}
              className={`inline-block mr-2 sm:mr-3 ${
                index % 2 === 1 ? `text-${colors.primary}` : ""
              }`}>
              {word}
            </span>
          ))}
        </h2>

        {/* Subtle decorative line - only for dark mode (FAQ section) */}
        {darkMode && (
          <div className='flex items-center justify-center mb-6 sm:mb-8'>
            <div className={`w-8 sm:w-10 md:w-12 h-px bg-white/20`}></div>
            <div
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-${colors.primary} mx-3 sm:mx-4 transform rotate-45`}></div>
            <div className={`w-8 sm:w-10 md:w-12 h-px bg-white/20`}></div>
          </div>
        )}
      </div>
    </div>
  );
}
