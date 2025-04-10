import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Typography
} from '@mui/material';

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('https://script.google.com/macros/s/AKfycbz_3srpVSs3r1TUEe9gpN7uHhAKdivcrPq4R_B0TxuQ8VaK6KYFmpyycfTYhDHPSImC/exec');
      const data = await res.json();

      // 📅 업데이트 시간 추출
      setUpdatedAt(data.updatedAt);

      // 📦 데이터
      setStocks(data.items);
    } catch (err) {
      console.error(err);
      setError('데이터 가져오기 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        📦 재고 현황
      </Typography>

      {updatedAt && (
        <Typography variant="subtitle1" style={{ marginBottom: '1rem' }}>
          마지막 업데이트: {updatedAt}
        </Typography>
      )}

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper} style={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ whiteSpace: 'nowrap' }}>품목명</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>브랜드</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>원산지</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }} align="right">중량 (kg)</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }} align="right">매입단가 (원)</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>이력번호</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stocks.map((item, index) => (
                <TableRow key={index}>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>{item.name}</TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>{item.brand}</TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>{item.origin}</TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }} align="right">
                    {parseFloat(item.qty).toLocaleString()}
                  </TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }} align="right">
                    {parseFloat(item.price).toLocaleString()}
                  </TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>{item.trace}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default App;
