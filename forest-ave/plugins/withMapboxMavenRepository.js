const { withSettingsGradle } = require('@expo/config-plugins');

const marker = '@forest-ave/mapbox-maven-repository';

module.exports = function withMapboxMavenRepository(config) {
  return withSettingsGradle(config, (config) => {
    if (config.modResults.contents.includes(marker)) {
      return config;
    }

    config.modResults.contents += `

// @generated begin ${marker}
dependencyResolutionManagement {
  repositories {
    maven {
      url = uri('https://api.mapbox.com/downloads/v2/releases/maven')
      credentials {
        username = 'mapbox'
        password = System.getenv('RNMAPBOX_MAPS_DOWNLOAD_TOKEN')
      }
    }
  }
}
// @generated end ${marker}
`;

    return config;
  });
};
