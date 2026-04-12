import { useState, useEffect } from 'react';
import { masterApi } from '../api/master';

type MasterType = 'kategori' | 'pendidikan' | 'instansi';

export function useMasterData(type: MasterType) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetcherMap: Record<MasterType, () => Promise<any>> = {
      kategori: masterApi.getKategori,
      pendidikan: masterApi.getPendidikan,
      instansi: masterApi.getInstansi,
    };

    const fetcher = fetcherMap[type];

    fetcher()
      .then(res => {
        if (isMounted) {
          setData(res.data.data);
          setError(null);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Gagal mengambil data');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [type]);

  return { data, loading, error };
}
