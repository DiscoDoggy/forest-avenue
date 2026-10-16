import { ExpoConfig, ConfigContext } from 'expo/config';

const withMapboxMavenRepository = require('./plugins/withMapboxMavenRepository');

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'forest-ave',
  slug: 'forest-ave',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'forestave',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    infoPlist: {
      // Mapbox iOS Token
      MBXAccessToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
    package: 'com.theflightlessbird.forestave',
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    withMapboxMavenRepository,
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
    [
      '@rnmapbox/maps',
      {
        RNMapboxMapsVersion: '11.16.2',
        RNMapboxMapsDownloadToken: process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN,
		accessToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'Show current location on map.',
      },
    ],
    [
      'with-rn-bluetooth-classic',
      {
        peripheralUsageDescription: 'Allow myDevice to check bluetooth peripheral info',
        alwaysUsageDescription: 'Allow myDevice to always use bluetooth info',
        protocols: ['com.myCompany.p1', 'com.myCompany.p2'],
      },
    ],
    'expo-sqlite',
    'expo-font',
    'expo-image',
    'expo-status-bar',
    'expo-web-browser',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '1883de71-9253-4b10-81d2-505a03d0f911',
    },
  },
  updates: {
    assetPatternsToBeBundled: process.env.EXPO_PUBLIC_ENV === 'development' 
      ? ['assets/**/*', 'assets/test-data/test-routes/*.json']
      : ['assets/images/*'],
  }
  
});
