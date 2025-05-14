import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Box
} from '@mui/material';

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchStockData = useCallback(async (initial = false) => {
    try {
      if (initial) setLoading(true);
      setError('');

      const url = process.env.REACT_APP_INVENTORY_URL;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.items && Array.isArray(data.items)) {
        if (data.updatedAt !== lastUpdated) {
          const sortedItems = [...data.items].sort((a, b) =>
            a.name.localeCompare(b.name, 'ko')
          );
          setStocks(sortedItems);
          setLastUpdated(data.updatedAt);
        }
      } else {
        throw new Error('유효하지 않은 데이터');
      }
    } catch (err) {
      console.error(err);
      setError('데이터를 불러오는 중 오류가 발생했습니다: ' + err.message);
    } finally {
      if (initial) setLoading(false);
    }
  }, [lastUpdated]);

  useEffect(() => {
    fetchStockData(true); // 초기 로딩만 로딩 상태 사용

    const interval = setInterval(() => {
      fetchStockData(false); // 이후에는 백그라운드 조용히 갱신
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchStockData]);

  return (
    <div style={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        📦 재고 현황
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            마지막 업데이트: {lastUpdated}
          </Typography>

          <Grid container spacing={3}>
            {stocks.length > 0 ? (
              stocks.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography color="textSecondary">{item.brand}</Typography>
                        <Typography color="textSecondary">{item.origin}</Typography>
                        <Typography color="textSecondary">{item.trace || 'N/A'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
                        <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
                          {parseFloat(item.qty).toLocaleString()} kg
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {parseFloat(item.price).toLocaleString()} 원
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography align="center">데이터가 없습니다.</Typography>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </div>
  );
}

export default App;
