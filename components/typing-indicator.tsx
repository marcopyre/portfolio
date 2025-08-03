import React from "react";

export default function TypingIndicator({ phrase }: { phrase: string }) {
  return (
    <div className="flex items-start space-x-4 animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full animate-bounce dot-1"></div>
          <div
            className="w-2 h-2 rounded-full animate-bounce dot-2"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 rounded-full animate-bounce dot-3"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <span className="text-slate-300 text-sm">{phrase}</span>
      </div>

      <style jsx>{`
        .dot-1 {
          background-color: #bbb5b1;
          animation:
            bounce 1s infinite,
            colorChange1 4s infinite;
        }

        .dot-2 {
          background-color: #948f8c;
          animation:
            bounce 1s infinite,
            colorChange2 4s infinite;
        }

        .dot-3 {
          background-color: #6f6b69;
          animation:
            bounce 1s infinite,
            colorChange3 4s infinite;
        }

        @keyframes colorChange1 {
          20% {
            background-color: #bbb5b1;
          }
          40% {
            background-color: #948f8c;
          }
          60% {
            background-color: #6f6b69;
          }
          80% {
            background-color: #948f8c;
          }
          100% {
            background-color: #bbb5b1;
          }
        }

        @keyframes colorChange2 {
          20% {
            background-color: #948f8c;
          }
          40% {
            background-color: #bbb5b1;
          }
          60% {
            background-color: #6f6b69;
          }
          80% {
            background-color: #bbb5b1;
          }
          100% {
            background-color: #948f8c;
          }
        }

        @keyframes colorChange3 {
          20% {
            background-color: #948f8c;
          }
          40% {
            background-color: #bbb5b1;
          }
          60% {
            background-color: #6f6b69;
          }
          80% {
            background-color: #bbb5b1;
          }
          100% {
            background-color: #948f8c;
          }
        }

        /* Réplication de l'animation bounce de Tailwind */
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: none;
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
      `}</style>
    </div>
  );
}
