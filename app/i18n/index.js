import I18n from 'react-native-i18n';
import en from './locales/en';
import ru from './locales/ru';
import zh from './locales/zh';

I18n.fallbacks = true;
I18n.defaultLocale = 'zh';

I18n.translations = {
	zh,
	en,
	ru
};

export default I18n;
