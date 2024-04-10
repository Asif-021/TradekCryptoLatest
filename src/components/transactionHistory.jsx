import { useState, useEffect } from "react";
import { firestore } from "../app/db";
import {query, collection, where, getDocs, orderBy} from 'firebase/firestore';
import "../styles/transactionHistory.css"

function TransHistory(props){

    const [results, setResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [type, setType] = useState('all');
    const [startDate, setStartDate] = useState(new Date('2024-01-01'));
    const [endDate, setEndDate] = useState(new Date());
    const [currency, setCurrency] = useState('USD');
    const [errors, setErrors] = useState({});    

    const supportedCurrencies = ['USD', 'BTC', 'ETH', 'SOL', 'DOT', 'DOGE', 'LTC', 'XRP'];  

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                // Base query to fetch all user transactions 
                const bQ = query(collection(firestore, 'transaction history'), where('userID', '==', props.data.docID), orderBy('Date', 'desc'));
                
                const bqSnapshot = await getDocs(bQ);
                
                // Map the results to extract document data
                const bqResults = bqSnapshot.docs.map(doc => doc.data());

                // Set the results to the state
                setResults(bqResults);
                setFilteredResults([...bqResults]);
            } catch (error) {
                console.error("Error fetching documents: ", error);
            }
        };

        fetchDocuments();
    }, []);

    const handleFilter = async () => {
        if (!supportedCurrencies.includes(currency.toUpperCase())) {
            setErrors(p => ({...p, supportedCurrency: true}))
            return;
        }

        try {
            let dummy = [...results]; 
        
            // Filter by type if not all types of transactions
            if (type !== 'all') {
                dummy = dummy.filter(item => item.type === type);

            }

            // Filter by currency
            dummy = dummy.filter(item => item.currency === currency.toUpperCase());

            // Filter by date range
            dummy = dummy.filter(item => {
                const itemDate = item.Date.toDate(); 
                return itemDate >= startDate && itemDate <= endDate;
            });

            // Update the state with the filtered results
            setFilteredResults(dummy);
            console.log(results)
            // console.log(`${type}, ${currency}, ${startDate}, ${endDate}`)
            // Reset any previous errors
            setErrors({});
        } catch (error) {
            console.error("Error fetching documents: ", error);
        }
    
    }

    const capitaliseFirstLetter = (word) =>{
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    

    return(
        <>
        {props.data.approved &&
        <>
            <div className="filter-form">
                <div className="type -container">
                    <label htmlFor='type-dropdown'>Type:</label>
                    <select id='type-dropdown' value={type} onChange={e=>setType(e.target.value)}>
                        <option value='all'>All Types</option>
                        <option value='deposit'>Deposit</option>
                        <option value='withdrawal'>Withdrawal</option>
                        <option value='transfer'>Transfer</option>
                        <option value='Buy'>Buy</option>
                        <option value='Sell'>Sell</option>
                        <option value='Convert'>Convert</option>
                    </select>
                </div>
                <div className="currency -container">
                    <label htmlFor="currency-dropdown">Currency:</label>
                    <input type='text' list='currencies'  
                            id='currency-dropdown'  
                            value={currency}  
                            onChange= { e =>{setCurrency(e.target.value)}} />
                </div>
                <div className="startDate -container">
                    <label htmlFor="startDate-dropdown">Start Date:</label>
                    <input id='startDate-dropdown'
                        type='date' 
                        defaultValue={startDate.toISOString().substring(0, 10)}
                        onChange={e=>setStartDate(new Date(e.target.value))}/>
                </div>
                <div className="endDate -container">
                <label htmlFor='endDate-dropdown'>End Date:</label>
                <input id='endDate-dropdown'
                       type='date'  
                       defaultValue={endDate.toISOString().substring(0, 10)} 
                       onChange={e=>setEndDate(new Date(e.target.value))} />
                </div>
                <button id="filter-btn" onClick={handleFilter}>Filter</button>
            </div>
            {errors.supportedCurrency && <div className="error">Please use a supported currency, using the abbreviation of the coins e.g. Bitcoin ={'>'} BTC </div>}
            <div className="filtered-results">
                
                {filteredResults && filteredResults.length>0 ? (filteredResults.map((transaction, index)=>{
                    let tType = transaction.type;
                    return (

                        <div key={index} className="transaction">
                            <p>Type: {transaction.type && capitaliseFirstLetter(transaction.type)}</p>
                            <p>Currency: {transaction.currency}</p>
                            {transaction.monetaryAmount && <p>Monetary Amount: ${transaction.monetaryAmount}</p>}
                            {transaction.cryptoAmount && <p>Crypto Amount: {transaction.cryptoAmount}</p>}
                            <p>Date: {transaction.Date.toDate().toLocaleString()}</p>
                            {transaction.recipient && <p>Recipient Username: {transaction.recipient}</p>}
                        </div>
                    );
                    })
                
                ) : (
                    <div className="transaction">No transactions found with applied filter</div>
                )}
                

            </div>
        </>
        }
        {!props.data.approved && <div>Your account must be approved before you can access transaction history.</div>}
        </>
    )

}

export default TransHistory;