import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medeniyet.takvim',
  appName: 'Medeniyet Takvimi',
  webDir: 'dist',
  android: {
    backgroundColor: '#111317',
    allowMixedContent: false,
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#111317',
    },
  },
};

export default config;
