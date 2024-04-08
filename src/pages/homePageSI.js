import styles from "../styles/homepageSI.module.css";
import Link from "next/link";
import "./forum";
import Header from "../components/navbar.jsx";

function HomePageSI() {
  const handleBuySell = () => {
    // Redirect to buy page Next.js router
    window.location.href = '/buy';
  };

  const handleMyAccount = () => {
    // Redirect to account page using Next.js router
    window.location.href = '/account';
  };
  return (
    <div>
      <Header />
      <div className={styles.Homepage}>
        {/* Drop Down Signed In */}
        <div className={styles.menu}>
        <ul>
            <button onClick={handleBuySell} className={styles.buysell}>Buy/Sell</button>
            <br/>
            <button onClick={handleMyAccount} className={styles.myaccount}>My Account</button>
        </ul>
        </div>


        {/* overview message */}
        <div className={styles.TradekTitle}>Trade Crypto</div>
        <div className={styles.TradekSlogan}>
          Tradek: Your Gateway to Crypto Trading.
          <br />
        </div>
        <br />
        <div className={styles.Description}>
          Welcome to Tradek, your go-to crypto trading platform offering top
          cryptocurrencies and a vibrant community. With our user-friendly
          interface, you can effortlessly trade Bitcoin, Ethereum, Ripple,
          Litecoin, and more, while our dynamic forum keeps you connected and
          informed. Stay ahead with real-time market analysis and expert
          insights. Join Tradek today and experience the future of crypto
          trading.
        </div>

        <br />
        <br />
        <br />
        <br />
        {/* market & forum container */}
        <div className={styles.MarketForumContainer}>
          <div className={styles.Market}>
            <div className={styles.MarketTitle}>Market</div>
            <br />
            <span className={styles.DescriptionMarket}>
              Explore our comprehensive market analysis tools, providing
              real-time trends
            </span>
            <div className={styles.MoreMarket}>
              <Link href="/market">More: Market</Link>
            </div>
          </div>

          <div className={styles.Forum}>
            <div className={styles.ForumTitle}>24/7 Forum</div>
            <br />
            <span className={styles.DescriptionForum}>
              Join our vibrant forum to engage with fellow enthusiasts, share
              insights in the crypto world
            </span>
            <div className={styles.MoreForum}>
              <Link href="/forum">More: Forum</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePageSI;
