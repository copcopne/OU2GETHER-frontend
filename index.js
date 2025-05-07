import { registerRootComponent } from 'expo';

import App from './App';
import Home from './components/home/Home';
import Login from './components/profile/Login';
import Profile from './components/profile/Profile';
import Post from './components/post/Post';
import Register from './components/profile/Register';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Register);
