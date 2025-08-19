export const getApiUrl = () => {
  if (typeof window === "undefined") return "/api/chat";
  const hostname = window.location.hostname;
  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.endsWith(".local");
  const isGithubPages = hostname.includes("github.io");
  const isVercel = hostname.includes("vercel.app");
  if (isLocal) {
    return "/api/chat";
  } else if (isGithubPages) {
    return "https://portfolio-one-sable-65.vercel.app/api/chat";
  } else if (isVercel) {
    return "/api/chat";
  } else {
    return "https://portfolio-one-sable-65.vercel.app/api/chat";
  }
};

export const downloadResume = () => {
  const googleDriveLink =
    "https://drive.google.com/uc?export=download&id=1lHQwSsTy_I6PMK1F3vAP7MlL0CSBPi0k";
  const link = document.createElement("a");
  link.href = googleDriveLink;
  link.download = "CV-Marco-Pyré.pdf";
  link.click();
};

export const openContactEmail = (sujet: string, message: string) => {
  const email = "ytmarcopyre@gmail.com";
  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
    sujet
  )}&body=${encodeURIComponent(message)}`;
  window.open(mailtoLink, "_blank");
};

export const openLink = (url: string) => {
  window.open(url, "_blank");
};
