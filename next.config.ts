import nextra from "nextra";

// Set up Nextra with its configuration
const withNextra = nextra({
  // ... Add Nextra-specific options here
});

// Export the final Next.js config with Nextra included
export default withNextra({
  // ... Add regular Next.js options here
  outputFileTracingRoot: __dirname,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      protobuf: false,
    };
    return config;
  },
});
