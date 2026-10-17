import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { productService } from '../services/productService.js';
import { portfolioStats } from '../utils/graph.js';
import { useAuth } from './AuthContext.jsx';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [graph, setGraph] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setGraph(await productService.getGraph());
      setStatus('ready');
    } catch (e) {
      setError(e.message || 'Something went wrong while loading data.');
      setStatus('error');
    }
  }, []);

  // Reload when the signed-in business changes (it names the retail stage).
  useEffect(() => { load(); }, [load, user?.id, user?.businessName]);

  const saveProduct = useCallback(async (payload) => { const id = await productService.save(payload); await load(); return id; }, [load]);
  const removeProduct = useCallback(async (id) => { await productService.remove(id); await load(); }, [load]);
  const resetData = useCallback(async () => { await productService.resetDemoData(); await load(); }, [load]);

  const stats = useMemo(() => (graph ? portfolioStats(graph) : null), [graph]);
  const value = useMemo(() => ({ graph, stats, status, error, reload: load, saveProduct, removeProduct, resetData }), [graph, stats, status, error, load, saveProduct, removeProduct, resetData]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
