/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Codex / WorkBuddy 預覽可能使用 IP 而不是 localhost；兩者都允許載入開發資源。
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
