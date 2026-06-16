const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.blockList = [
  /android[\\/]\.gradle[\\/].*/,
  /android[\\/]build[\\/].*/,
  /android[\\/]app[\\/]build[\\/].*/,
  /[\\/]\.cxx[\\/].*/,
  /[\\/]node_modules[\\/].*[\\/]android[\\/]\.cxx[\\/].*/,
  /[\\/]node_modules[\\/].*[\\/]android[\\/]build[\\/].*/,
];

module.exports = withNativeWind(config, { input: path.join(projectRoot, 'global.css') });
