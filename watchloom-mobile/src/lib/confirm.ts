import { Alert, Platform } from 'react-native';

type ConfirmOptions = {
  cancelLabel?: string;
  confirmLabel: string;
  message: string;
  title: string;
};

export function confirmAction({
  cancelLabel = 'Cancel',
  confirmLabel,
  message,
  title,
}: ConfirmOptions) {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise<boolean>((resolve) => {
    Alert.alert(title, message, [
      { onPress: () => resolve(false), style: 'cancel', text: cancelLabel },
      { onPress: () => resolve(true), style: 'destructive', text: confirmLabel },
    ]);
  });
}
