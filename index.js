/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import Room from './src/routes/Room';
import Stack from './src/routes/Stack';

AppRegistry.registerComponent(appName, () => Stack);
