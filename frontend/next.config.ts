import type { NextConfig } from "next";
import os from "os";
import path from "path";

function getLocalNetworkIps(): string[] {
  const ips: string[] = ["localhost", "127.0.0.1", "172.20.210.145"];
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const ifaceList = interfaces[name];
      if (ifaceList) {
        for (const iface of ifaceList) {
          if (iface.family === "IPv4" || (iface.family as any) === 4) {
            ips.push(iface.address);
          }
        }
      }
    }
  } catch {
    // Ignore
  }
  return Array.from(new Set(ips));
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  allowedDevOrigins: getLocalNetworkIps(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/explore",
        destination: "/community",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const rawBackendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.BACKEND_URL ||
      "http://127.0.0.1:8000";
    const cleanBackendUrl = rawBackendUrl
      .replace(/\/api\/v1\/?$/, "")
      .replace(/\/+$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${cleanBackendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
