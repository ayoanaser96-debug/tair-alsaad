import { Text } from 'react-native';

import type { PropsWithChildren } from 'react';

const LRI = '\u2066';
const PDI = '\u2069';

/** Wrap digits / mixed content so RTL layouts keep phone codes readable. */
export function BidiLtr(props: PropsWithChildren<{ text: string; className?: string }>) {
  const labeled = `${LRI}${props.text}${PDI}`;
  return <Text className={props.className}>{labeled}</Text>;
}
