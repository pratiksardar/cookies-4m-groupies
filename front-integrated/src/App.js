// Importaciones deben ir al principio del archivo
import logo from './logo.svg';
import './App.css';
import './styles/style.css';
import './styles/custom.css';
import './js/custom.js';

// Importación de dependencias
import { DynamicContextProvider, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

function App() {
  return (
    <div className="App">
      {/*<!-- Navigation -->*/}
      <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top py-3" id="mainNav">
        <div className="container"> 
          <a className="navbar-brand js-scroll-trigger" href="index.html">Cookies4mGroupies</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation"> 
            <span className="navbar-toggler-icon"></span> 
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item"> <a className="nav-link js-scroll-trigger" href="index.html">Home</a> </li>
              <div className="container">
                <DynamicContextProvider
                  settings={{
                    environmentId: '20c77d13-6995-482f-b451-e19c92c92fba',
                    walletConnectors: [EthereumWalletConnectors],
                  }}>
                  <DynamicWidget />
                </DynamicContextProvider>
                <div id="loader" className="loader hidden"></div>
              </div>
            </ul>
          </div>
        </div>
      </nav>
      
      <header>
        <div className="container">
          <div className="row d-flex align-content-center">
            <div className="col-md-7">
              <div className="headline">
                <div className="headline-content">
                  <h1 className="headline-title display-3">Cookies <span className="rojo">from</span> groupies 🍪</h1>
                  <p className="headline-subtitle">A web3 dApp empowering independent artists and their supporters through decentralized innovation. Give cookies to your local artist!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/*<!-- portfolio -->*/}
      <section className="space-md">
        <div id="portfolio" className="container">
          <div id="portfolio-filters">
            <ul id="filters" className="p-0">
              <li><a href="*" className="active">All</a></li>
              <li><a href=".digital">Digital</a></li>
              <li><a href=".branding">Musical</a></li>
              <li><a href=".campaigns">Performative</a></li>
            </ul>
          </div>
        </div>
      </section>

      {/*<!-- footer -->*/}
      <footer className="footer pb-5">
        <div className="container">
          <div className="row">
            <div className="col-md-3"></div>
            <div className="col-md-9">
              <div className="row">
                <div className="col-md-4">
                  <img width="90%" src="img/nouns.png"/>
                </div>
                <div className="col-md-8">
                  <h4>Cookies From Groupies is a decentralized application (dApp) that bridges the gap between artists and their audiences...</h4>
                </div>
              </div>
              <div className="row mt-5">
                <div className="col-md-4">
                  <img src="img/icons/heart-rounded@2x.png"/>
                  <h5>Browse Artists</h5>
                  <p className="list-unstyled p-0">Discover and connect with independent talent.</p>
                </div>
                <div className="col-md-4">
                  <img src="img/icons/dollar-sign-rounded@2x.png"/>
                  <h4>Support Creatively</h4>
                  <p className="list-unstyled p-0">Choose how to support artists—donate, buy NFTs, or stake tokens.</p>
                </div>
                <div className="col-md-4">
                  <img src="img/icons/gift-rounded@2x.png"/>
                  <h4>Unlock Exclusive Perks</h4>
                  <p className="list-unstyled p-0">Access token-gated content, such as NFTs or special art.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/*<!-- Bootstrap core JavaScript -->*/}
      <script src="vendor/jquery/jquery.min.js"></script>
      <script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
      <script src="vendor/jquery-easing/jquery.easing.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/3.0.6/isotope.pkgd.min.js"></script>
      <script src="js/custom.js"></script>
    </div>
  );
}

export default App;
