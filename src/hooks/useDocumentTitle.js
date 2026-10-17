import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | EcoTrace` : 'EcoTrace | Sustainable Supply Chain Tracker';
  }, [title]);
}
