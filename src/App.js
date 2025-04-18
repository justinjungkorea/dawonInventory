import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Box
} from '@mui/material';

function App() {
  const [stocks, setStocks] = useState([]); // stocks 상태 초기화
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError('');

      const url = process.env.REACT_APP_INVENTORY_URL;
      const response = await fetch(url);
      const data = await response.json(); // JSON 응답으로 처리

      console.log('API 응답 데이터:', data); // 응답 데이터를 로깅하여 확인

      // 유효한 데이터가 있을 경우 상태 업데이트
      if (data && data.items && Array.isArray(data.items)) {
        const sortedItems = [...data.items].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        setStocks(sortedItems);
        setLastUpdated(data.updatedAt); // 마지막 업데이트 시간 설정
      } else {
        throw new Error('유효하지 않은 데이터');
      }

    } catch (err) {
      console.error(err);
      setError('데이터를 불러오는 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData(); // 초기 1회 호출
  
    const interval = setInterval(() => {
      fetchStockData();
    }, 60000);
  
    return () => clearInterval(interval); // 언마운트 시 인터벌 정리
  }, []);

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
        <div>
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
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
                          {parseFloat(item.qty).toLocaleString()} kg
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
        </div>
      )}
    </div>
  );
}

export default App;
