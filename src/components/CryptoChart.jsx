import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import 'chart.js/auto';

const CryptoChart = ({ coinId }) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true); 

  const historyData = async () => {
    try {
      const days = 30;
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days,
        },
      });

      if (response.data.prices) {
        const dates = response.data.prices.map((el) => new Date(el[0]).toLocaleDateString());
        const prices = response.data.prices.map((el) => el[1]);

        setChartData({
          labels: dates,
          datasets: [
            {
              label: `${coinId.toUpperCase()} Price`,
              data: prices,
              fill: false,
              backgroundColor: 'cyan',
              borderColor: 'cyan',
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching historical data for coin:', coinId, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coinId) {
      historyData();
    }
  }, [coinId]);

  if (loading) {
    return <div>Loading chart...</div>;
  }

  if (!chartData.datasets) {
    return <div>No chart data available for {coinId.toUpperCase()}</div>;
  }

  return <Line data={chartData} />;
};

export default CryptoChart;