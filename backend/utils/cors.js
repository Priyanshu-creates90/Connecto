const LOCAL_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://connecto-1-psxd.onrender.com",
];
const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

const parseOrigins = (rawValue = "") =>
  rawValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const getAllowedOrigins = () => {
  const envOrigins = [
    ...parseOrigins(process.env.URL),
    ...parseOrigins(process.env.CLIENT_URL),
    ...parseOrigins(process.env.CORS_ORIGINS),
  ];

  return [...new Set([...LOCAL_ORIGINS, ...envOrigins])];
};

export const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (LOCAL_ORIGIN_PATTERN.test(origin)) {
    return true;
  }

  return getAllowedOrigins().includes(origin);
};
