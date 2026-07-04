import type { TextStyle } from 'react-native';

import { fonts, typeScale } from './tokens';

export type TypographyVariant = 'displayAr' | 'displayEn' | 'title' | 'body' | 'bodyBold' | 'caption';

function isArabicLocale(language: string): boolean {
  return language.startsWith('ar');
}

export function resolveTypographyVariant(
  variant: TypographyVariant,
  language: string,
): TextStyle {
  const ar = isArabicLocale(language);

  switch (variant) {
    case 'displayAr':
      return {
        fontFamily: fonts.displayAr,
        fontSize: typeScale.display.fontSize,
        lineHeight: typeScale.display.lineHeight,
        color: undefined,
      };
    case 'displayEn':
      return {
        fontFamily: fonts.displayEn,
        fontSize: typeScale.display.fontSize,
        lineHeight: typeScale.display.lineHeight,
      };
    case 'title':
      return {
        fontFamily: ar ? fonts.bodyArBold : fonts.bodyEnBold,
        fontSize: typeScale.title.fontSize,
        lineHeight: typeScale.title.lineHeight,
      };
    case 'body':
      return {
        fontFamily: ar ? fonts.bodyArRegular : fonts.bodyEnRegular,
        fontSize: typeScale.body.fontSize,
        lineHeight: typeScale.body.lineHeight,
      };
    case 'bodyBold':
      return {
        fontFamily: ar ? fonts.bodyArMedium : fonts.bodyEnMedium,
        fontSize: typeScale.body.fontSize,
        lineHeight: typeScale.body.lineHeight,
      };
    case 'caption':
      return {
        fontFamily: ar ? fonts.bodyArRegular : fonts.bodyEnRegular,
        fontSize: typeScale.caption.fontSize,
        lineHeight: typeScale.caption.lineHeight,
      };
    default:
      return {
        fontFamily: ar ? fonts.bodyArRegular : fonts.bodyEnRegular,
        fontSize: typeScale.body.fontSize,
        lineHeight: typeScale.body.lineHeight,
      };
  }
}

/** Pick display variant for current locale. */
export function displayVariantForLocale(language: string): 'displayAr' | 'displayEn' {
  return isArabicLocale(language) ? 'displayAr' : 'displayEn';
}
