import en from './en';
import bn from './bn';

export type Language = 'en' | 'bn';

export const translations = {
  en,
  bn,
};

export type TranslationType = typeof en;

export { en, bn };
export default translations;
