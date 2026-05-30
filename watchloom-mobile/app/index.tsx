import { Redirect, type Href } from 'expo-router';

import { routes } from '@/constants/routes';

export default function IndexScreen() {
  return <Redirect href={routes.tabs.home as Href} />;
}
