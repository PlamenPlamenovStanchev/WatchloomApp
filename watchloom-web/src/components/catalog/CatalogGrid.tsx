import type { ReactNode } from "react";

type CatalogGridProps = {
  children: ReactNode;
};

export function CatalogGrid({ children }: CatalogGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-6">
      {children}
    </div>
  );
}
