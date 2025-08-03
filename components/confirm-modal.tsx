"use client";
import React from "react";

export default function ConfirmModal({
  open,
  question,
  onConfirm,
  onCancel,
  yesLabel = "Oui",
  noLabel = "Non",
  link,
}: {
  open: boolean;
  question: string;
  onConfirm: () => void;
  onCancel: () => void;
  yesLabel?: string;
  noLabel?: string;
  link?: string;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#18181b",
          color: "#fff",
          borderRadius: 12,
          padding: 32,
          minWidth: 320,
          boxShadow: "0 8px 32px #0008",
        }}
      >
        <div style={{ marginBottom: 24, fontSize: 18, fontWeight: 500 }}>
          {question}
        </div>
        {link && (
          <div
            style={{
              marginBottom: 16,
              fontSize: 14,
              color: "#ffd6b9",
              wordBreak: "break-all",
              padding: "8px 12px",
              background: "#c8810b",
              borderRadius: "6px",
              border: "1px solid #ffd6b9",
            }}
          >
            {link}
          </div>
        )}
        <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              background: "#222",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 20px",
              cursor: "pointer",
            }}
          >
            {" "}
            {noLabel}{" "}
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: "#FCA311",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 20px",
              cursor: "pointer",
            }}
          >
            {" "}
            {yesLabel}{" "}
          </button>
        </div>
      </div>
    </div>
  );
}
