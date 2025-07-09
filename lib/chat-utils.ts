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

export const get_resume = () => {
  const googleDriveLink =
    "https://drive.google.com/uc?export=download&id=1Wjp02VjqKPbGkk9vReIHe6JNk0mlKfpv";
  const link = document.createElement("a");
  link.href = googleDriveLink;
  link.download = "CV-Marco-Pyré.pdf";
  link.click();
};

export const send_contact_email = (sujet: string, message: string) => {
  const mailto = `mailto:ytmarcopyre@gmail.com?subject=${encodeURIComponent(
    sujet
  )}&body=${encodeURIComponent(message)}`;
  window.location.href = mailto;
};

export const get_source_code = () => {
  const githubUrl = "https://github.com/marcopyre/portfolio";
  window.open(githubUrl, "_blank");
};
