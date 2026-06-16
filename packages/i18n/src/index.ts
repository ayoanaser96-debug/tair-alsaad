import ar from './locales/ar.json' with { type: 'json' };
import en from './locales/en.json' with { type: 'json' };

const locales = { ar, en } as const;

export default locales;
