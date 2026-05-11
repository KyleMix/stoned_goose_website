import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    // Static export disables the next/image loader, so the remotePatterns
    // allowlist is unreachable. Every external image must already render via
    // a raw <img>/<Image unoptimized> path.
    unoptimized: true,
  },
  trailingSlash: false,
  // Codespaces forwards a public *.app.github.dev URL to local 127.0.0.1,
  // and Next 16 will require an explicit allowlist for those internal
  // dev-only requests. Production export is unaffected.
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.app.github.dev"],
};

export default withBundleAnalyzer(nextConfig);
