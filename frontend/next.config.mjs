import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@midnight-ntwrk/compact-js',
    '@midnight-ntwrk/compact-runtime',
    '@midnight-ntwrk/dapp-connector-api',
    '@midnight-ntwrk/ledger-v7',
    '@midnight-ntwrk/midnight-js-contracts',
    '@midnight-ntwrk/midnight-js-fetch-zk-config-provider',
    '@midnight-ntwrk/midnight-js-http-client-proof-provider',
    '@midnight-ntwrk/midnight-js-indexer-public-data-provider',
    '@midnight-ntwrk/midnight-js-network-id',
    '@midnight-ntwrk/midnight-js-types',
    '@midnight-ntwrk/wallet-sdk-address-format'
  ],
  // Allow browser extensions (Lace wallet) to inject scripts properly
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' chrome-extension: moz-extension:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.midnight.network wss://*.midnight.network https://fonts.googleapis.com https://fonts.gstatic.com",
              "frame-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    // Node.js module fallbacks for client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        url: false,
        buffer: false,
        util: false,
        assert: false,
        events: false,
        child_process: false,
        worker_threads: false,
      };
    }

    // Alias isomorphic-ws to our custom shim
    config.resolve.alias = {
      ...config.resolve.alias,
      'isomorphic-ws': path.resolve(__dirname, 'src/lib/isomorphic-ws-shim.js'),
    };

    // Fix ESM import resolution for Midnight SDK packages
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Fix WebAssembly named exports from ledger-v8
    config.module.rules.push({
      test: /midnight_ledger_wasm\.js$/,
      type: 'javascript/auto',
    });

    // Treat WASM files as static assets or enable WebAssembly experiments
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
};

export default nextConfig;
