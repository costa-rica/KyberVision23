// metro.config.js
const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

// Tell Metro to use the SVG transformer
config.transformer.babelTransformerPath = require.resolve(
	"react-native-svg-transformer"
);

// Make sure "svg" is treated as source, not as an asset
config.resolver.assetExts = config.resolver.assetExts.filter(
	(ext) => ext !== "svg"
);
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

module.exports = config;
