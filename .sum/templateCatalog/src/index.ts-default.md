import { getFavoriteFruit } from './getFavoriteFruit';

if (process.env.SDEBUG) {
  getFavoriteFruit();
}

export { getFavoriteFruit };
