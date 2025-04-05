import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography
} from '@mui/material';
import './App.css'; // 필요한 경우 유지

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError('');
  
      const COM_CODE = process.env.REACT_APP_ECOUNT_COM_CODE;
      const USER_ID = process.env.REACT_APP_ECOUNT_USER_ID;
      const API_CERT_KEY = process.env.REACT_APP_ECOUNT_API_CERT_KEY;
      const LAN_TYPE = 'ko-KR';
  
      // // 1. ZONE 조회
      // const zoneRes = await fetch('https://oapi.ecount.com/OAPI/V2/Zone', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ COM_CODE }),
      // });
      // const ZONE = (await zoneRes.json())?.Data?.ZONE;
      // if (!ZONE) throw new Error('ZONE 조회 실패');
      // else console.log('ZONE : ', ZONE);
  
      // // 2. 로그인
      // const loginRes = await fetch(`https://oapi${ZONE}.ecount.com/OAPI/V2/OAPILogin`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     COM_CODE,
      //     USER_ID,
      //     API_CERT_KEY,
      //     LAN_TYPE,
      //     ZONE,
      //   }),
      // });
  
      // const SESSION_ID = (await loginRes.json())?.Data?.Datas?.SESSION_ID;
      // if (!SESSION_ID) throw new Error('로그인 실패');
      // else console.log('SESSION ID : ', SESSION_ID);

      const ZONE = 'cb';
      const SESSION_ID = process.env.REACT_APP_SESSION_ID;
  
      // 3. 재고현황 조회
      const BASE_DATE = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const stockRes = await fetch(`https://oapi${ZONE}.ecount.com/OAPI/V2/InventoryBalance/GetListInventoryBalanceStatusByLocation?SESSION_ID=${SESSION_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ PROD_CD: '', WH_CD: '', BASE_DATE }),
        }
      );
  
      const stockResult = (await stockRes.json())?.Data?.Result ?? [];
  
      // 4. PROD_CD 추출
      const prodCodes = [...new Set(stockResult.map((item) => item.PROD_CD))];
      const prodCodeStr = prodCodes.join('∬');
  
      // 5. 품목정보 조회
      const prodRes = await fetch(`https://oapi${ZONE}.ecount.com/OAPI/V2/InventoryBasic/GetBasicProductsList?SESSION_ID=${SESSION_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ PROD_CD: prodCodeStr }),
        }
      );
  
      const rawProductResult = (await prodRes.json())?.Data?.Result;
  
      // 응답이 문자열일 수 있으므로 파싱
      const productResult = typeof rawProductResult === 'string'
        ? JSON.parse(rawProductResult)
        : rawProductResult;
  
      // 6. 매핑: PROD_CD 기준으로 합치기
      const productMap = {};
      productResult.forEach((prod) => {
        productMap[prod.PROD_CD] = prod;
      });
  
      const merged = stockResult.map((item) => {
        const prod = productMap[item.PROD_CD] || {};
        return {
          ...item,
          IN_PRICE: prod.IN_PRICE ?? '-',
          CONT1: prod.CONT1 ?? '',
          CONT2: prod.CONT2 ?? '',
          CONT3: prod.CONT3 ?? '',
          CLASS_CD: prod.CLASS_CD ?? ''
        };
      });

      const filtered = merged.filter(item =>
        (item.CLASS_CD === '00001' || item.CLASS_CD === '00004') &&
        item.CONT1 !== '국내산'
      );
  
      setStocks(filtered);
    } catch (err) {
      console.error(err);
      setError('API 호출 실패: ' + err.message);
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
                  <TableCell style={{ whiteSpace: 'nowrap' }}>{item.PROD_DES}</TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>{item.CONT3}</TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>{item.CONT1}</TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }} align="right">
                    {parseFloat(item.BAL_QTY).toLocaleString()}
                  </TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }} align="right">
                    {parseFloat(item.IN_PRICE).toLocaleString()}
                  </TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>{item.CONT2}</TableCell>
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
