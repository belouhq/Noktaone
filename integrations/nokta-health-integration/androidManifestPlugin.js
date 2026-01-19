// androidManifestPlugin.js
// Config plugin Expo pour ajouter les intent-filter Health Connect

const { withAndroidManifest } = require('@expo/config-plugins');

function addHealthConnectIntentFilter(androidManifest) {
  const { manifest } = androidManifest;

  // Trouver l'application
  const application = manifest.application?.[0];
  if (!application) {
    console.warn('androidManifestPlugin: No application found in manifest');
    return androidManifest;
  }

  // Trouver ou créer l'activité principale
  let mainActivity = application.activity?.find(
    (activity) => activity.$?.['android:name'] === '.MainActivity'
  );

  if (!mainActivity) {
    // Chercher l'activité avec l'intent MAIN
    mainActivity = application.activity?.find((activity) =>
      activity['intent-filter']?.some((filter) =>
        filter.action?.some(
          (action) => action.$?.['android:name'] === 'android.intent.action.MAIN'
        )
      )
    );
  }

  if (!mainActivity) {
    console.warn('androidManifestPlugin: No main activity found');
    return androidManifest;
  }

  // Ajouter l'intent-filter pour Health Connect permissions
  const healthConnectIntentFilter = {
    action: [
      {
        $: {
          'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE',
        },
      },
    ],
  };

  // Vérifier si l'intent-filter existe déjà
  const existingFilter = mainActivity['intent-filter']?.find((filter) =>
    filter.action?.some(
      (action) =>
        action.$?.['android:name'] ===
        'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE'
    )
  );

  if (!existingFilter) {
    if (!mainActivity['intent-filter']) {
      mainActivity['intent-filter'] = [];
    }
    mainActivity['intent-filter'].push(healthConnectIntentFilter);
  }

  return androidManifest;
}

module.exports = function withHealthConnectPermissions(config) {
  return withAndroidManifest(config, async (config) => {
    config.modResults = addHealthConnectIntentFilter(config.modResults);
    return config;
  });
};
