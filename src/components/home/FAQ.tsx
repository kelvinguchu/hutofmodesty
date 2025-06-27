"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  faqs: FAQItem[];
  accent?: "emerald" | "purple" | "default";
}

export default function FAQ({ faqs, accent = "default" }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getAccentColors = () => {
    switch (accent) {
      case "emerald":
        return {
          primary: "primary",
          hover: "primary/90",
        };
      case "purple":
        return {
          primary: "primary",
          hover: "primary/90",
        };
      default:
        return {
          primary: "gray-600",
          hover: "gray-700",
        };
    }
  };

  const colors = getAccentColors();

  return (
    <div className='space-y-2 sm:space-y-3'>
      {faqs.map((faq, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className='group'>
          <div
            className={`border transition-all duration-300 ${
              openIndex === index
                ? "border-white bg-white text-black"
                : "border-white/30 bg-transparent text-white hover:border-white/60"
            }`}>
            {/* Question Button */}
            <button
              onClick={() => toggleFAQ(index)}
              className='w-full text-left p-4 sm:p-5 md:p-6 flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-inset transition-all duration-200 cursor-pointer touch-manipulation'
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}>
              <div className='flex items-center gap-3 sm:gap-4 flex-1 min-w-0'>
                {/* Simple number badge - responsive */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 flex-shrink-0 ${
                    openIndex === index
                      ? `bg-${colors.primary} text-white`
                      : "bg-white/20 text-white group-hover:bg-white/30"
                  }`}>
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Title - responsive text and truncation */}
                <h3 className='text-base sm:text-lg font-bold uppercase tracking-wide truncate sm:text-clip'>
                  {faq.question}
                </h3>
              </div>

              {/* Toggle button - responsive and accessible */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-all duration-300 flex-shrink-0 ml-3 ${
                  openIndex === index
                    ? `bg-${colors.primary} text-white`
                    : "bg-white/20 text-white group-hover:bg-white/30"
                }`}
                aria-hidden='true'>
                {openIndex === index ? (
                  <Minus className='w-3 h-3 sm:w-4 sm:h-4' />
                ) : (
                  <Plus className='w-3 h-3 sm:w-4 sm:h-4' />
                )}
              </div>
            </button>

            {/* Answer */}
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  id={`faq-answer-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className='overflow-hidden'>
                  <div className='px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6'>
                    <div className='ml-10 sm:ml-12'>
                      <p className='text-gray-700 leading-relaxed text-sm sm:text-base'>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
