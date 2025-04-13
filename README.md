# Cookies 4M Groupies

A monorepo containing the frontend, smart contracts, and backend for the Cookies 4M Groupies project.

## Project Structure

```
cookies-4m-groupies/
├── frontend/           # React frontend application
├── smart-contracts/    # Solidity smart contracts
└── backend/           # Backend services and APIs
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Hardhat (for smart contracts)
- Supabase CLI (for backend)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/cookies-4m-groupies.git
cd cookies-4m-groupies
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Development

#### Frontend
```bash
npm run frontend:dev
```

#### Smart Contracts
```bash
npm run contracts:compile
npm run contracts:test
```

#### Backend
```bash
npm run backend:dev
```

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Cookies From Groupies 🍪🎨  
A web3 dApp empowering independent artists and their supporters through decentralized innovation.

---

## 📖 Overview  
**Cookies From Groupies** is a decentralized application (dApp) that bridges the gap between artists and their audiences. It allows artists to build their online profiles, showcase their work, and receive support in creative ways. Fans can explore artist profiles, support them through donations, purchase NFTs, and even stake tokens to share in the yields generated. Supporters unlock exclusive content and gain access to token-gated chats with the artists they support.

---
# Latest Hosted website: https://elaborate-pastelito-739750.netlify.app/ 

## Demo Video
[![Watch the video](https://github.com/pratiksardar/cookies-4m-groupies/blob/main/image.png)](https://www.youtube.com/watch?v=jU5_Dvzpc74)

## 🎨 Features  

### For Artists:  
- **Profile Creation**: Build a customizable online presence.  
- **Monetization Options**:  
  - Accept **donations** directly from fans.  
  - Mint and sell **NFTs** representing your art.  
  - Earn from **yields** generated when supporters stake their tokens on you.  

### For Supporters:  
- **Browse Artists**: Discover and connect with independent talent.  
- **Support Creatively**: Choose how to support artists—donate, buy NFTs, or stake tokens.  
- **Unlock Exclusive Perks**:  
  - Access token-gated content, such as NFTs or special art.  
  - Engage in private token-gated chats with artists.  

---

## 🚀 How It Works  

1. **Artists**:  
   - Sign up and create your profile.  
   - Showcase your work and set up NFT listings or donation goals.  
   - Allow supporters to stake tokens on you to generate profits.

2. **Supporters**:  
   - Browse the platform and discover artists.  
   - Choose your favorite artist and provide support in various ways:
     - Donate directly.  
     - Buy their NFTs.  
     - Stake tokens to generate yield and share profits with the artist.  
   - Unlock token-gated content and exclusive chats.  

---

## 📌 Key Benefits  

- **For Artists**: A platform to monetize creativity without intermediaries and build meaningful connections with supporters.  
- **For Supporters**: An engaging way to support artists while unlocking unique content and experiences.  

---

## 🛠️ Technology Stack  
- **Frontend**: React & Nouns UI for a seamless user experience.  
- **Blockchain**: Scroll, Hedera, Polygon zkEVM  , Morph, Mantel and Flow networks
- **Explorer**: Blockscout
- **Onboarding**: Dynamic.xyz
- **Notifications**:Push Protocol 
- **Generating Random numbers**: Pyth
- **Smart Contracts**: Solidity-based contracts for secure transactions. 
- **Storage**: Akave for decentralized NFT storage.  

---

## Arch
![Arch Diagram](c4g.png)

---

## 🎯 Vision  
**Cookies From Groupies** aims to revolutionize how local independent artists sustain their creativity by offering them decentralized tools for financial growth and fan engagement.

---
## 🛣️ Roadmap
-  Enhanced Artist Discovery: AI-Powered Recommendations, Geolocation-Based Discovery, Geolocation-Based Discovery

- Collaborative Features: Group Support Campaigns, Collaboration Tools for Artists
- Advanced NFT Features: Fractionalized NFTs, Dynamic NFTs
- Community and Social Features: Token-Gated Communities, Events and Livestreams
- Mobile and AR/VR Experiences
- Subscription Models
- Artist Analytics
- Educational Resources for Artists
- DAO Governance

---

## Deployed Contracts and addresses:

Flow - \
The reason to build on Flow is because it is an consumer app focused chain which values content and content creators, artists on flow would be able to join the leverage the platform reacher greater heights with it's existing collabs and platform integration. \


---

Celo-alfajores: 
- ArtistDonation: `0xc6724370cB2CD753189Ee8Ed52a1Ffeaae92e687`
- ArtistStaking: `0x964c2578FAaF895624F761326d4113031eabA147`
- CookiesToken: `0xf981A370B218bF8a7E7205F4dA5dd9aBD96649d6`
- NFTFactory: `0x9A5D90657CCa0849DB08C590f3eD16cBE4965397`

All contracts are verified on CeloScan. You can view them at:
- ArtistDonation: https://alfajores.celoscan.io/address/0xc6724370cb2cd753189ee8ed52a1ffeaae92e687
- ArtistStaking: https://alfajores.celoscan.io/address/0x964c2578faaf895624f761326d4113031eaba147
- CookiesToken: https://alfajores.celoscan.io/address/0xf981A370B218bF8a7E7205F4dA5dd9aBD96649d6
- NFTFactory: https://alfajores.celoscan.io/address/0x9a5d90657cca0849db08c590f3ed16cbe4965397

---

## Deployed Contracts (Celo Alfajores Testnet)

### StableCoinStaking
- Contract Address: [0x1AD64E1E629ED0425EfCb03e891a936596404Bd3](https://alfajores.celoscan.io/address/0x1ad64e1e629ed0425efcb03e891a936596404bd3)
- Constructor Arguments:
  - CookiesToken: [0xf981a370b218bf8a7e7205f4da5dd9abd96649d6](https://alfajores.celoscan.io/address/0xf981a370b218bf8a7e7205f4da5dd9abd96649d6)
  - Stablecoin (cUSD): [0x2f25deb3848c207fc8e0c34035b3ba7fc157602b](https://alfajores.celoscan.io/address/0x2f25deb3848c207fc8e0c34035b3ba7fc157602b)

---

## 🏗️ Contributing  
Contributions are welcome! To contribute:  
1. Fork the repository.  
2. Create a new branch (`feature/your-feature`).  
3. Commit your changes and open a Pull Request.  

---

## 📄 License  
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 📬 Contact  
Have questions or feedback? Reach out at **radarsardar@gmail.com**.

---

## 🤝 Contributors

Find us on X (formerly Twitter @ )
[Sara](https://x.com/holasari_) | [Nidhi](https://x.com/nidhisinghattri) | [Pratik](https://x.com/pratik_sardar)
