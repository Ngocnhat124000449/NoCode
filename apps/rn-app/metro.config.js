const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration for a pnpm monorepo.
 *
 * pnpm hoists shared dependencies into the workspace-root node_modules
 * (e.g. <repo>/node_modules/@babel/runtime). Without telling Metro about
 * that folder, the bundler cannot resolve modules that pnpm did not also
 * place inside apps/rn-app/node_modules.
 *
 * - watchFolders: keep an eye on the root node_modules for HMR.
 * - nodeModulesPaths: instructs Metro to look in BOTH the app-local
 *   and the workspace-root node_modules when resolving a require().
 */
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    // Keep hierarchical lookup enabled so Node-style resolution walks up
    // parent directories — required for pnpm peer deps that live in
    // node_modules/.pnpm/<pkg>/node_modules/<peer>.
    disableHierarchicalLookup: false,
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
