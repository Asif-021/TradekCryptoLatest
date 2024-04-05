import React, { useState, useEffect } from 'react';
import CryptoChart from '../components/CryptoChart.jsx';
import axios from 'axios';
import '../styles/market.css';
import Head from 'next/head.js';
import Header from '@/components/header.jsx';

const Market = () => {
  const [cryptoData, selectCryptoData] = useState([]);
  const [selectedCoin, selectSelectedCoin] = useState(null);
  const [loading, selectLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const ids = 'bitcoin,ethereum,ripple,litecoin,dogecoin,solana,polkadot';
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: ids,
            vs_currencies: 'usd',
          },
        });

        const data = Object.entries(response.data).map(([key, value]) => ({
          id: key,
          currency: 'USD',
          amount: value.usd,
        }));

        selectCryptoData(data);
      } catch (error) {
        console.error('Error fetching crypto:', error);
      } finally {
        selectLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  const handleSelectCoin = (coin) => {
    selectSelectedCoin(coin);
  };

  if (loading) {
    return <div className="market-container">Loading market data...</div>;
  }

  return (
    <>
      <Header />
    <div className="market-container">
      <div className="market-list-container"> {}
        <h2>Market</h2>
        <div className="crypto-list">
          {cryptoData.map((crypto, index) => (
            <div className="cryptoItem" key={index}>
              <div className="cryptoName">{crypto.id.toUpperCase()}/{crypto.currency}</div>
              <div className="cryptoPrice">${crypto.amount.toLocaleString()}</div>
              <button onClick={() => handleSelectCoin(crypto.id)}>View Chart</button>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-container"> {}
        {selectedCoin && <CryptoChart coinId={selectedCoin} />}
      </div>
    </div>
    </>
  );
};

export default Market;