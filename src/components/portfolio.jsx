import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { firestore } from "../app/db.js";
import { collection, query, where, getDocs } from 'firebase/firestore';
import axios from 'axios';
import styles from "../styles/portfolio.css";


const cryptoColors = {
  BITCOIN: "#ffa500",
  ETHEREUM: "#CBC3E3",
  DOGECOIN: "#ba9f33l",
  LITECOIN: "#345d9d",
  POLKADOT: "#e6007a",
  RIPPLE: "#FF0000",
  SOLANA: "#9945ff",
};

const Portfolio = (props) => { 
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHoldings = async () => {
      const q = query(collection(firestore, "cryptoHoldings"), where("userID", "==", props.data.docID));
      const docRef = await getDocs(q);
      
      if (!docRef.empty) {
        return docRef.docs[0].data().holdings;
      } else {
        console.error("No such document!");
        return null;
      }
    };

    const fetchCryptoPrices = async (holdings) => {
      const ids = Object.keys(holdings).join(',');
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: ids,
          vs_currencies: 'usd',
        },
      });
      return response.data; 
    };

    const calculatePortfolioValue = async () => {
      try {
        const holdings = await fetchHoldings();
        if (!holdings) throw new Error("No holdings found for this user.");

        const prices = await fetchCryptoPrices(holdings);

        const portfolioData = Object.entries(holdings).map(([key, value]) => {
          const cryptoPrice = prices[key.toLowerCase()]?.usd;
          const amount = value * cryptoPrice;
          return { name: key.toUpperCase(), value: amount, color: cryptoColors[key.toUpperCase()] || "#999999" };
        });

        setCryptoData(portfolioData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    calculatePortfolioValue();
  }, [props.data.docID]);

  const pieChartData = {
    labels: cryptoData.map(crypto => crypto.name),
    datasets: [{
      label: 'Your Cryptocurrency Portfolio',
      data: cryptoData.map(crypto => crypto.value),
      backgroundColor: cryptoData.map(crypto => crypto.color),
      hoverOffset: 4,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'center',
        labels: {
          color: 'white',
          boxWidth: 20,
          padding: 20,
        }
      },
      title: {
        display: true,
        text: 'Your Cryptocurrency Portfolio',
        color: 'white',
        font: {
          size: 20
        }
      }
    }
  };

  if (loading) {
    return <div>Loading your portfolio...</div>;
  }

  return (
    <div className={styles.chartContainer}>
      <Pie data={pieChartData} options={options} />
    </div>
  );
};

export default Portfolio;
