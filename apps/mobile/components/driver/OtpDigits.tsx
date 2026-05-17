import { TextInput } from 'react-native';

type Props = {
  value: string;
  onChange: (digits: string) => void;
};

/** Four-digit OTP for pickup / delivery confirmations. */
export function OtpDigits(props: Props) {
  const { value, onChange } = props;
  return (
    <TextInput
      keyboardType="number-pad"
      maxLength={4}
      value={value}
      placeholderTextColor="#5C544A"
      onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 4))}
      style={{ letterSpacing: 6 }}
      textAlign="center"
      className="mx-auto mb-6 h-14 w-48 rounded-xl border border-border bg-surface px-5 text-xl font-semibold text-ink"
    />
  );
}
