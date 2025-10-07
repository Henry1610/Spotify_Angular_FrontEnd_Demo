export const environment = {
  production: false,
  spotify: {
    clientId: '737f3fda9efd4e23b7fe1a8141f017ac',
    clientSecret: '6e6fb672b60145a692d2619d5950d0a1', // Thêm Client Secret
    redirectUri: 'http://127.0.0.1:8000/callback',
    scopes: [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'user-library-read',
      'user-read-playback-state',
      'user-modify-playback-state'
    ]
  }
};
