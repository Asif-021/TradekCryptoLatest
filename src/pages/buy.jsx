import React, { useState, useEffect } from 'react';
import CryptoChart from '../components/CryptoChart.jsx';
import axios from 'axios';
import '../styles/market.css';
import Head from 'next/head.js';
import Header from '@/components/header.jsx';
import { firestore } from "../app/db.js";
import { collection, getDocs, query, where, doc, updateDoc, setDoc } from 'firebase/firestore';

const Buy = () => {
  const [cryptoData, selectCryptoData] = useState([]);
  const [selectedCoin, selectSelectedCoin] = useState(null);
  const [loading, selectLoading] = useState(true);
  const [buyPopupOpen, setBuyPopupOpen] = useState(false);
  const [sellPopupOpen, setSellPopupOpen] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState('null');
  const [cryptoId, setcryptoId] = useState('null');
  const [crypto, setcrypto] = useState([]);
  const useremail = "user@email"; // Make sure to assign the correct user
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

  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        const q = query(collection(firestore, 'User Info'), where('email', '==', useremail));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setUserId(doc.id)
          setBalance(doc.data().balance);
        });
      } catch (error) {
        console.error('Error fetching user balance:', error);
      }
    };

    fetchUserBalance();
  }, []);
  useEffect(() => {
    const fetchcryptoHoldings = async () => {
      try {
        const q = query(collection(firestore, 'cryptoHoldings'), where('userID', '==', userId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setcryptoId(doc.id)
          setcrypto(doc.data());
        });
      } catch (error) {
        console.error('Error fetching user crypto', error);
      }
    };

    fetchcryptoHoldings ();
  }, [userId]);

  const handleSelectCoin = (coin) => {
    selectSelectedCoin(coin);
  };

  const handleBuy = (coin) => {
    selectSelectedCoin(coin);
    setBuyPopupOpen(true);
  };

  const handleSell = (coin) => {
    selectSelectedCoin(coin);
    setSellPopupOpen(true);
  };

  const handleBuyPopupClose = () => {
    setBuyPopupOpen(false);
  };

  const handleSellPopupClose = () => {
    setSellPopupOpen(false);
  };

  const handleTransaction = async () => {
    try {
      const selectedCryptoData = cryptoData.find(crypto => crypto.id === selectedCoin);
      if (!selectedCryptoData) {
        console.error('Selected coin data not found.');
        return;
      }

      if (selectedCoin && transactionAmount) {
        const coinPrice = selectedCryptoData.amount;
        const totalTransactionValue = transactionAmount / coinPrice;

        if (buyPopupOpen) {
          const requiredAmount = totalTransactionValue * coinPrice;
          if (requiredAmount > balance) {
            console.log(balance)
            console.error('Insufficient balance for this transaction.');
            return;
          }
          const newBalance = balance - requiredAmount;
          const userDocRef = doc(firestore, 'User Info', userId);
          console.log(userDocRef)
          await updateDoc(userDocRef, { "balance": newBalance });

          console.log(cryptoId)
          console.log(crypto)

          const cryptoHoldingsRef = doc(firestore, 'cryptoHoldings', cryptoId);
          console.log(cryptoHoldingsRef)
          const updatedHoldings = { ...crypto };
          console.log(updatedHoldings)
          console.log(selectedCoin)
          console.log(updatedHoldings.holdings[selectedCoin])
          if (updatedHoldings.holdings[selectedCoin]) {
            updatedHoldings.holdings[selectedCoin] += totalTransactionValue;
          } else {
            updatedHoldings.holdings[selectedCoin] = totalTransactionValue;
          }
          await updateDoc(cryptoHoldingsRef, updatedHoldings);
          console.log("successfully done")
        } else if (sellPopupOpen) {
          console.log(crypto)
          const updatedHoldings = { ...crypto };
          if (updatedHoldings.holdings[selectedCoin]) {
            if (updatedHoldings.holdings[selectedCoin] >= totalTransactionValue) {
              const newBalance = balance + (totalTransactionValue * coinPrice);
              console.log(newBalance)
              const userDocRef = doc(firestore, 'User Info', userId);
              await updateDoc(userDocRef,{"balance":newBalance})
              const cryptoHoldingsRef = doc(firestore, 'cryptoHoldings', cryptoId);
              console.log(cryptoHoldingsRef)
              await updateDoc(cryptoHoldingsRef, { balance: newBalance });

              console.log(crypto)
              const updatedHoldings = { ...crypto };
              updatedHoldings.holdings[selectedCoin] -= totalTransactionValue;
              await updateDoc(cryptoHoldingsRef, updatedHoldings);
              console.log("succefully done")
            } else {
              console.error('Insufficient holdings for this transaction.');
              return;
            }
          } else {
            console.error('No holdings found for this user.');
            return;
          }
        }
      } else {
        console.error('Please select a coin and enter transaction amount.');
      }

      handleBuyPopupClose();
      handleSellPopupClose();
      setTransactionAmount('');
    } catch (error) {
      console.error('Error executing transaction:', error);
    }
  };

  if (loading) {
    return <div className="market-container">Loading market data...</div>;
  }

  return (
    <>
      <Header />
      <div className="market-container">
        <div className="market-list-container">
          <h2>Market</h2>
          <div className="crypto-list">
            {cryptoData.map((crypto, index) => (
              <div className="cryptoItem" key={index}>
                <div className="cryptoName">{crypto.id.toUpperCase()}/{crypto.currency}</div>
                <div className="cryptoPrice">${crypto.amount.toLocaleString()}</div>
                <button onClick={() => handleSelectCoin(crypto.id)}>View Chart</button>
                <button onClick={()=>handleBuy(crypto.id)}>Buy</button>
                <button onClick={()=>handleSell(crypto.id)}>Sell</button>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-container">
          {selectedCoin && <CryptoChart coinId={selectedCoin} />}
        </div>
      </div>
      {buyPopupOpen && (
        <div className="popup">
          <div className="popup-inner">
            <h3>Buy {selectedCoin}</h3>
            <input type="number" value={transactionAmount} onChange={(e) => setTransactionAmount(e.target.value)} />
            <button onClick={handleTransaction}>Confirm Buy</button>
            <button onClick={handleBuyPopupClose}>Cancel</button>
          </div>
        </div>
      )}
      {sellPopupOpen && (
        <div className="popup">
          <div className="popup-inner">
            <h3>Sell {selectedCoin}</h3>
            <input type="number" value={transactionAmount} onChange={(e) => setTransactionAmount(e.target.value)} />
            <button onClick={handleTransaction}>Confirm Sell</button>
            <button onClick={handleSellPopupClose}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Buy;
