import { Input } from '@/components/ui/Input';

type CatalogSearchBarProps = {
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  value: string;
};

export function CatalogSearchBar({
  onChangeText,
  onSubmit,
  placeholder = 'Search titles',
  value,
}: CatalogSearchBarProps) {
  return (
    <Input
      accessibilityLabel={placeholder}
      autoCapitalize="none"
      autoCorrect={false}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
      placeholder={placeholder}
      returnKeyType="search"
      value={value}
    />
  );
}
