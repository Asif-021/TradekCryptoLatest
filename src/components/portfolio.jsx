import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { firestore } from "../app/db.js";
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import styles from "../styles/portfolio.css";

const Portfolio = ({ userID }) => { 
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHoldings = async () => {
        const docRef = doc(firestore, "cryptoHoldings", "t7XbVwLiLNDSmy9gYa9f");
        const docSnap = await getDoc(docRef);
      
        if (docSnap.exists()) {
          return docSnap.data().holdings;
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
          return { name: key.toUpperCase(), value: amount };
        });

        setCryptoData(portfolioData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    calculatePortfolioValue();
  }, [userID]);

  const generateRandomColor = () => {
    let maxVal = 0xFFFFFF;
    let randomNumber = Math.random() * maxVal;
    randomNumber = Math.floor(randomNumber);
    randomNumber = randomNumber.toString(16);
    let randColor = randomNumber.padStart(6, 0);   
    return `#${randColor.toUpperCase()}`
  }

  const pieChartData = {
    labels: cryptoData.map(crypto => crypto.name),
    datasets: [{
      label: 'Your Cryptocurrency Portfolio',
      data: cryptoData.map(crypto => crypto.value),
      backgroundColor: cryptoData.map(() => generateRandomColor()),
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
    <div className="chart-container">
      <Pie data={pieChartData} options={options} />
    </div>
  );
};

export default Portfolio;
