import { EmptyState } from '@/components/ui/EmptyState';

type CatalogEmptyStateProps = {
  message?: string;
  title?: string;
};

export function CatalogEmptyState({
  message = 'Try changing your search or filters.',
  title = 'No titles found',
}: CatalogEmptyStateProps) {
  return <EmptyState message={message} title={title} />;
}
