/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "imgproxy.fourthwall.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  trailingSlash: false,
  // Codespaces forwards a public *.app.github.dev URL to local 127.0.0.1,
  // and Next 16 will require an explicit allowlist for those internal
  // dev-only requests. Production export is unaffected.
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.app.github.dev"],
};

export default nextConfig;
