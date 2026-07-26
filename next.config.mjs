/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  turbopack: {
    root: process.cwd()
  },
  ...(isGitHubPages
    ? {
      output: "export",
      basePath: "/habitflow",
      assetPrefix: "/habitflow/",
      trailingSlash: true
    }
    : {})
};

export default nextConfig;
