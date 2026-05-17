import type { PropsWithChildren } from 'react';
import type { SafeAreaViewProps } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

function tw(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

export function Screen(
  props: PropsWithChildren<
    Omit<SafeAreaViewProps, 'mode'> & { className?: string; edges?: Array<'top' | 'bottom' | 'left' | 'right'> }
  >,
) {
  const { children, className, edges = ['top', 'bottom'], style, ...rest } = props;
  return (
    <SafeAreaView edges={edges} className={tw('flex-1 bg-bg', className ?? '')} style={style} {...rest}>
      {children}
    </SafeAreaView>
  );
}
