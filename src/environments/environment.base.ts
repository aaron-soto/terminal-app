export const baseEnvironment = {
  version: '0.0.2',
  firebase: {
    apiKey: '${API_KEY}',
    authDomain: '${AUTH_DOMAIN}',
    projectId: '${PROJECT_ID}',
    storageBucket: '${STORAGE_BUCKET}',
    messagingSenderId: '${MESSAGING_SENDER_ID}',
    appId: '${APP_ID}',
    measurementId: '${MEASUREMENT_ID}',
  },
  api: {
    weather: {
      base_url: 'http://api.weatherapi.com/v1',
      api_key: 'b70b4b062c474b159c630639221404',
    },
  },
};
