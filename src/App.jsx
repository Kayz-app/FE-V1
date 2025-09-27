    

    import React, { useState, useEffect, useMemo, useRef } from 'react';
import { callAIAPI } from "./api/api.ai";
import { useWeb3 } from './contexts/Web3Context';

// --- MOCK DATA --- //
// In a real application, this data would come from a secure backend and blockchain.

const initialUsers = {
  'investor@demo.com': { 
    id: 1, 
    type: 'investor', 
    name: 'Ada Lovelace', 
    email: 'investor@demo.com', 
    password: 'password123', 
    wallet: { ngn: 5000000, usdt: 1250.50, usdc: 800.25 },
    kycStatus: 'Verified', // 'Not Submitted', 'Pending', 'Verified'
    twoFactorEnabled: true,
  },
  'developer@demo.com': { 
    id: 2, 
    type: 'developer', 
    name: 'Charles Babbage', 
    email: 'developer@demo.com', 
    password: 'password123', 
    wallet: { ngn: 1200000, usdt: 500, usdc: 100 },
    companyProfile: {
        name: 'Babbage Constructions Ltd.',
        regNumber: 'RC123456',
        address: '1 Innovation Drive, Yaba, Lagos',
        website: 'https://babbageconstructions.com',
    },
    twoFactorEnabled: false,
    treasuryAddress: '0x1234ABCD5678EFGH9101KLMN1213OPQR1415STUV', // Collected during KYC
  },
  'admin@demo.com': { id: 3, type: 'admin', name: 'Admin Grace Hopper', email: 'admin@demo.com', password: 'password123', wallet: { ngn: 0, usdt: 0, usdc: 0 } },
  'buyer@demo.com': { 
    id: 4, 
    type: 'investor', 
    name: 'Bayo Adekunle', 
    email: 'buyer@demo.com', 
    password: 'password123', 
    wallet: { ngn: 2500000, usdt: 2000, usdc: 1500 },
    kycStatus: 'Not Submitted',
    twoFactorEnabled: false,
  },
};

const initialProjects = [
  {
    id: 1,
    title: 'Lekki Pearl Residence',
    tokenTicker: 'LPR',
    tokenSupply: 250000,
    developerId: 2,
    developerName: 'Charles Babbage',
    location: 'Lekki, Lagos',
    fundingGoal: 250000,
    amountRaised: 250000, // Fully funded
    apy: 15,
    term: 24, // months
    startDate: '2024-03-01T00:00:00Z',
    description: 'A premium residential complex featuring 50 luxury apartments with state-of-the-art facilities. Located in the heart of Lekki, it promises high rental yield and capital appreciation. The property includes a swimming pool, a fully-equipped gym, and 24/7 security.',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2000',
    images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2000',
        'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=2000',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2e7?q=80&w=2000',
        'https://images.unsplash.com/photo-1605276374104-5de67d60924f?q=80&w=2000',
    ],
    status: 'funded', // 'pending', 'active', 'funded', 'completed'
    projectWalletBalance: 5000, // For APY payments
    completionDate: '2024-05-15T00:00:00Z',
    fundsWithdrawn: true,
    contractAddress: '0x1234567890123456789012345678901234567890', // Mock contract address
  },
  {
    id: 2,
    title: 'Eko Atlantic Tower',
    tokenTicker: 'EAT',
    tokenSupply: 1000000,
    developerId: 2,
    developerName: 'Charles Babbage',
    location: 'Eko Atlantic, Lagos',
    fundingGoal: 1000000,
    amountRaised: 450000,
    apy: 18,
    term: 36,
    startDate: '2023-09-10T00:00:00Z',
    description: 'A visionary skyscraper that will redefine the Lagos skyline. This mixed-use development includes commercial, residential, and recreational spaces, offering unparalleled views and luxury living.',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2000',
    images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2000',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2000',
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2000',
    ],
    status: 'active',
    projectWalletBalance: 12000,
    fundsWithdrawn: false,
    contractAddress: '0x2345678901234567890123456789012345678901', // Mock contract address
  },
  {
    id: 3,
    title: 'Abuja Smart City Villas',
    tokenTicker: 'ASV',
    tokenSupply: 500000,
    developerId: 2,
    developerName: 'Charles Babbage',
    location: 'Gwarinpa, Abuja',
    fundingGoal: 500000,
    amountRaised: 150000,
    apy: 16.5,
    term: 30,
    description: 'An exclusive community of 20 smart homes in a serene district of Abuja, designed for modern living and sustainable luxury. Each villa is equipped with the latest smart home technology for comfort and security.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000',
    images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000',
        'https://images.unsplash.com/photo-1600585153492-3f19d532b259?q=80&w=2000',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000',
    ],
    status: 'active',
    projectWalletBalance: 0,
    fundsWithdrawn: false,
    contractAddress: '0x3456789012345678901234567890123456789012', // Mock contract address
  },
  {
    id: 4,
    title: 'Ikeja Tech Hub',
    tokenTicker: 'ITH',
    tokenSupply: 300000,
    developerId: 2,
    developerName: 'Charles Babbage',
    location: 'Ikeja, Lagos',
    fundingGoal: 300000,
    amountRaised: 0,
    apy: 17,
    term: 36,
    description: 'A state-of-the-art co-working and innovation hub in the heart of Ikeja Computer Village. Designed to foster collaboration and growth for tech startups, offering flexible office spaces, event halls, and networking opportunities.',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2000',
    images: [
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2000',
        'https://images.unsplash.com/photo-1521737852577-684822188716?q=80&w=2000',
        'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2000',
    ],
    status: 'pending', // Submitted for admin approval
    projectWalletBalance: 0,
    fundsWithdrawn: false,
    contractAddress: '0x4567890123456789012345678901234567890123', // Mock contract address
  },
];

// This structure represents token ownership.
const initialPortfolios = {
  1: { // Ada Lovelace's portfolio
    tokens: [
      { tokenId: 'proj1-sec-1', projectId: 1, type: 'SECURITY', amount: 5000, originalOwnerId: 1, lastApyClaimDate: '2025-08-05T00:00:00Z' },
      { tokenId: 'proj1-mkt-1', projectId: 1, type: 'MARKET', amount: 5000, ownerId: 1, status: 'held' }, // status: 'held' or 'listed'
      { tokenId: 'proj2-sec-1', projectId: 2, type: 'SECURITY', amount: 10000, originalOwnerId: 1, lastApyClaimDate: '2025-09-01T00:00:00Z' },
      { tokenId: 'proj2-mkt-1', projectId: 2, type: 'MARKET', amount: 10000, ownerId: 1, status: 'held' },
    ]
  },
  4: { // Bayo Adekunle's portfolio
    tokens: [
        { tokenId: 'proj1-sec-2', projectId: 1, type: 'SECURITY', amount: 2500, originalOwnerId: 4, lastApyClaimDate: '2025-07-20T00:00:00Z' },
        { tokenId: 'proj1-mkt-2', projectId: 1, type: 'MARKET', amount: 2500, ownerId: 4, status: 'held' },
    ]
  }
};

// Represents tokens listed on the secondary market
const initialMarketListings = [
    { listingId: 1, tokenId: 'proj2-mkt-1', sellerId: 1, projectId: 2, amount: 2000, price: 2100 } // Ada is selling 2000 of her market tokens for project 2 at a premium
];


// --- AI API INTEGRATION (SECURE VIA BACKEND) --- //

// Instead of calling OpenAI directly with the API key from the frontend (which is insecure),
// this function now calls a backend endpoint (`/api/ai`) that safely holds the API key.
// You must implement the `/api/ai` endpoint in your backend (Node/Express, Next.js API routes, etc.).

// --- AI API INTEGRATION (SECURE + COMPATIBLE) --- //
// callAIAPI now accepts either:
// - a string (plain user prompt)
// - an OpenAI-style { messages: [...] } object
// It normalizes the input and sends either `messages` or `prompt` to the backend `/api/ai`.
// The backend should accept either `{ messages }` (OpenAI style) or `{ prompt }` (string) and call OpenAI accordingly.

// --- AI API INTEGRATION (OPENAI ONLY, SECURE) --- //
// callAIAPI now strictly uses OpenAI's messages format.
// Always supply either a string prompt (which will be wrapped) or a { messages } array.
// The backend (/api/ai) will receive { messages } and must forward them to OpenAI securely.
// callAIAPI moved to /src/api/ai.js





// --- SVG ICONS AS REACT COMPONENTS --- //
const KayzeraLogo = ({ textColor = "#1f2937", taglineColor = "#6b7280", ...props }) => (
  <svg {...props} viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#6366f1', stopOpacity: 1}} />
        <stop offset="100%" style={{stopColor: '#4f46e5', stopOpacity: 1}} />
      </linearGradient>
    </defs>
    <g transform="translate(0, -1.5) scale(1, 1.375)">
        <path d="M4 4H8V20H4V4Z" fill="url(#logoGradient)" />
        <path d="M9 11L16 4L20 8L13 15V20H9V11Z" fill="url(#logoGradient)" />
    </g>
    <g transform="translate(28, 0)">
      <text y="16" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="bold" fill={textColor}>
        kayzera
      </text>
      <text y="26" fontFamily="Inter, sans-serif" fontSize="6" fontWeight="normal" fill={taglineColor}>
        Real estate, reimagined
      </text>
    </g>
  </svg>
);
const SparklesIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3Z"/>
    <path d="M3 21L4.5 16.5L9 15L4.5 13.5L3 9"/>
    <path d="M21 21L19.5 16.5L15 15L19.5 13.5L21 9"/>
  </svg>
);
const SendIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
);
const BotIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);

const BuildingIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16"/><path d="M2 11h20"/><path d="M3 22V6l8-4 8 4v16"/><path d="M15 22V11l-7-3.5L1 11v11"/><path d="M11 22V11"/><path d="m11 6.5-4 2"/><path d="m19 6.5-4 2"/></svg>
);
const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const DollarSignIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
const LogOutIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
const ArrowRightIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
const CheckCircleIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const ClockIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const TrendingUpIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);
const ZapIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);
const ShieldCheckIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);
const EyeIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const SettingsIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const RepeatIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
);
const WalletIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h12v-6"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
);
const ArrowDownLeftIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 17-10-10"/><path d="M17 7v10H7"/></svg>
);
const ArrowUpRightIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17V7h10"/><path d="M7 7l10 10"/></svg>
);
const ClipboardIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
);
const XIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const ArrowLeftIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const FileUpIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const LifeBuoyIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>
);
const ChevronDownIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);
const PaperclipIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
);

const DownloadLogoButton = () => {
    const handleDownload = (e) => {
        e.preventDefault();

        const svgString = `<svg viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg" style="font-family: Inter, sans-serif;"><defs><linearGradient id="logoGradientDownload" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color: #6366f1; stop-opacity: 1" /><stop offset="100%" style="stop-color: #4f46e5; stop-opacity: 1" /></linearGradient></defs><g transform="translate(0, -1.5) scale(1, 1.375)"><path d="M4 4H8V20H4V4Z" fill="url(#logoGradientDownload)" /><path d="M9 11L16 4L20 8L13 15V20H9V11Z" fill="url(#logoGradientDownload)" /></g><g transform="translate(28, 0)"><text y="16" font-size="14" font-weight="bold" fill="#1f2937">kayzera</text><text y="26" font-size="6" font-weight="normal" fill="#6b7280">Real estate, reimagined</text></g></svg>`;
        const dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // Increased scale for High-Definition output
        const scale = 5;
        canvas.width = 120 * scale;
        canvas.height = 28 * scale;

        img.onload = () => {
            // No background fill needed for PNG transparency
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const pngUrl = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = 'kayzera_logo_tagline_hd.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        img.src = dataUrl;
    };

    return (
        <a 
            href="#"
            onClick={handleDownload}
            className="inline-block mt-2 text-sm text-gray-400 hover:text-white underline transition-colors"
        >
            Download HD Logo (PNG)
        </a>
    );
};

const TwitterIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
);
const LinkedinIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);
const InstagramIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const MenuIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

const BellIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
);


const LockupTimer = ({ endDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    if (!Object.keys(timeLeft).length) {
        return <span className="text-green-600 font-semibold">Lockup Ended</span>;
    }

    return (
        <div className="text-sm text-gray-700 font-mono">
            <span>{String(timeLeft.days).padStart(2, '0')}d </span>
            <span>{String(timeLeft.hours).padStart(2, '0')}h </span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}m </span>
            <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
    );
};


// --- HELPER FUNCTIONS --- //
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

const formatNgnCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};


// --- UI COMPONENTS --- //

const Header = ({ page, currentUser, setPage, setCurrentUser }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        setCurrentUser(null);
        setPage('landing');
        setMobileMenuOpen(false);
    };

    const getDashboardLink = () => {
        if (!currentUser) return 'landing';
        switch (currentUser.type) {
            case 'investor': return 'investorDashboard';
            case 'developer': return 'developerDashboard';
            case 'admin': return 'adminDashboard';
            default: return 'landing';
        }
    };

    const handleNavItemClick = (pageName) => {
        setPage(pageName);
        setMobileMenuOpen(false);
    };

    const handleScrollTo = (id) => {
        if (page !== 'landing') {
            setPage('landing');
            // Wait for the landing page to render before scrolling
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <a href="#" onClick={() => handleNavItemClick('landing')} className="flex-shrink-0 flex items-center gap-2">
                           <KayzeraLogo className="h-12 w-auto"/>
                        </a>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <a href="#" onClick={() => handleNavItemClick('landing')} className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Home</a>
                            <a href="#featured-projects" onClick={(e) => { e.preventDefault(); handleScrollTo('featured-projects'); }} className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Projects</a>
                            <a href="#" onClick={() => handleNavItemClick('company')} className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">About Us</a>
                            <a href="#faq" onClick={(e) => { e.preventDefault(); handleScrollTo('faq'); }} className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">FAQ</a>
                            <a href="#compliance" onClick={(e) => { e.preventDefault(); handleScrollTo('compliance'); }} className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Compliance</a>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {currentUser ? (
                            <div className="flex items-center ml-4 md:ml-6">
                                <span className="text-gray-700 text-sm mr-4 hidden sm:block">Welcome, {currentUser.name.split(' ')[0]}</span>
                                <button onClick={() => handleNavItemClick(getDashboardLink())} className="p-2 rounded-full text-gray-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2">
                                    <UserIcon className="h-6 w-6" />
                                </button>
                                <button onClick={handleLogout} className="p-2 rounded-full text-gray-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <LogOutIcon className="h-6 w-6" />
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-2">
                                <button onClick={() => handleNavItemClick('login')} className="text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-md text-base font-medium">Log In</button>
                                <button onClick={() => handleNavItemClick('register')} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition duration-150">Sign Up</button>
                            </div>
                        )}
                         <div className="md:hidden ml-2">
                             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-gray-500 hover:text-gray-700">
                                 {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                             </button>
                         </div>
                    </div>
                </div>
            </nav>
            {/* Mobile Menu (Dropdown with Animation) */}
            <div
              className={`md:hidden bg-white border-t shadow-md origin-top transform transition-all duration-200 ease-out ${mobileMenuOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-95 pointer-events-none h-0 overflow-hidden"}`}
            >
              <div className="px-4 pt-4 pb-6 space-y-2">
                <a href="#" onClick={() => handleNavItemClick('landing')} className="block text-gray-700 hover:text-indigo-600">Home</a>
                <a href="#featured-projects" onClick={(e) => { e.preventDefault(); handleScrollTo('featured-projects'); }} className="block text-gray-700 hover:text-indigo-600">Projects</a>
                <a href="#" onClick={() => handleNavItemClick('company')} className="block text-gray-700 hover:text-indigo-600">About Us</a>
                <a href="#faq" onClick={(e) => { e.preventDefault(); handleScrollTo('faq'); }} className="block text-gray-700 hover:text-indigo-600">FAQ</a>
                <a href="#compliance" onClick={(e) => { e.preventDefault(); handleScrollTo('compliance'); }} className="block text-gray-700 hover:text-indigo-600">Compliance</a>
                <div className="border-t pt-4 mt-4 space-y-2">
                    {currentUser ? null : (
                        <>
                            <a href="#" onClick={() => handleNavItemClick('login')} className="block w-full text-center bg-gray-100 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-200">Log In</a>
                            <a href="#" onClick={() => handleNavItemClick('register')} className="block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700">Sign Up</a>
                        </>
                    )}
                </div>
              </div>
            </div>
        </header>
    );
};

const LandingPage = ({ setPage, projects }) => {
    return (
        <div className="bg-gray-50 flex flex-col flex-1">
            <div className="flex-grow">
                {/* Hero Section */}
                <section className="relative">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 items-center py-20 md:py-28">
                            {/* Text Content */}
                            <div className="text-center max-w-3xl mx-auto">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                    <span className="block">Invest in Nigeria's Future.</span>
                                    <span className="block text-indigo-600">Hedged in USD.</span>
                                </h1>
                                <p className="mt-6 text-lg md:text-xl text-gray-600">
                                    Kayzera is a tokenized real estate platform that allows you to buy fractional ownership in premium properties, protecting your capital from inflation.
                                </p>
                                <div className="mt-10 flex justify-center gap-4">
                                    <button onClick={() => setPage('register')} className="inline-flex items-center justify-center px-7 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-transform hover:scale-110">
                                        Get Started
                                        <ArrowRightIcon className="ml-2 h-5 w-5" />
                                    </button>
                                    <button onClick={() => document.getElementById('featured-projects')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center px-7 py-3 border border-indigo-200 text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 transition-transform hover:scale-110">
                                        View Projects
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <div className="py-16 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-extrabold text-gray-900">A New Era of Real Estate Investing</h2>
                            <p className="mt-2 text-lg text-gray-600">Accessible • Liquid • Secure</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="p-6">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                                    <DollarSignIcon className="h-6 w-6"/>
                                </div>
                                <h3 className="mt-5 text-lg font-medium text-gray-900">Inflation Hedge</h3>
                                <p className="mt-2 text-base text-gray-600">Invest and earn returns in USD stablecoins, mitigating local currency risks and preserving your wealth.</p>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                                    <ZapIcon className="h-6 w-6"/>
                                </div>
                                <h3 className="mt-5 text-lg font-medium text-gray-900">Instant Liquidity</h3>
                                <p className="mt-2 text-base text-gray-600">Our secondary market allows you to trade your "Market Tokens" with other investors before the project term ends.</p>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                                    <ShieldCheckIcon className="h-6 w-6"/>
                                </div>
                                <h3 className="mt-5 text-lg font-medium text-gray-900">Blockchain Transparency</h3>
                                <p className="mt-2 text-base text-gray-600">Every transaction is recorded on a secure ledger, ensuring complete transparency and trust for all parties.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HOW IT WORKS: DUAL TOKEN SYSTEM */}
                <div id="how-it-works" className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-extrabold text-gray-900">Unlock Liquidity with Our Dual-Token System</h2>
                            <p className="mt-2 text-lg text-gray-600">Every investment provides you with two distinct types of tokens, balancing long-term growth with immediate flexibility.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="bg-white p-8 rounded-lg shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="p-2 bg-indigo-100 rounded-full mr-4">
                                        <ShieldCheckIcon className="w-6 h-6 text-indigo-600"/>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Security Tokens</h3>
                                </div>
                                <p className="text-gray-600">This token represents your core ownership in the property. It is locked for the project's term and generates your monthly APY returns. Think of it as your proof of ownership and your key to long-term wealth building.</p>
                            </div>
                            <div className="bg-white p-8 rounded-lg shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="p-2 bg-indigo-100 rounded-full mr-4">
                                        <TrendingUpIcon className="w-6 h-6 text-indigo-600"/>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Market Tokens</h3>
                                </div>
                                <p className="text-gray-600">Paired 1:1 with your Security Tokens, these are designed for liquidity. You can sell your Market Tokens to other investors on our Secondary Market at any time, allowing you to exit your position before the project's lockup period ends.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI-Powered Features Section */}
                <div className="py-16 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                             <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
                                <SparklesIcon className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900">Powered by AI for Smarter Investing</h2>
                            <p className="mt-2 text-lg text-gray-600 max-w-3xl mx-auto">Kayzera leverages cutting-edge AI to provide deeper insights and streamline the investment process for everyone.</p>
                        </div>
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Due Diligence</h3>
                                <p className="text-gray-600">Powered by OpenAI’s most advanced intelligence, our platform delivers a meticulous, high-level analysis of every property—highlighting both opportunities and risks with unparalleled precision. Gain the clarity and confidence to act decisively and secure the most lucrative investments before anyone else.</p>
                            </div>
                            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Generative Project Proposals</h3>
                                <p className="text-gray-600">For developers, our platform leverages generative AI to transform your project details into polished, persuasive descriptions and proposals. Just share the essentials, and our AI crafts professional, investor-ready content—saving you hours and elevating your pitch.</p>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Featured Projects Section */}
                <div id="featured-projects" className="py-16 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-extrabold text-gray-900">Featured Investment Opportunities</h2>
                            <p className="mt-2 text-lg text-gray-600">Carefully vetted projects from reputable developers.</p>
                        </div>
                        <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                            {projects.filter(p => p.status === 'active' || p.status === 'funded').slice(0, 3).map(project => (
                                 <ProjectCard key={project.id} project={project} setPage={setPage} />
                            ))}
                        </div>
                    </div>
                </div>

                 {/* Compliance Section */}
                <div id="compliance" className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
                        <ShieldCheckIcon className="h-16 w-16 mx-auto text-indigo-600" />
                        <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Legal & Regulatory Compliance</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                            Operating with integrity and transparency is at the core of our mission.
                        </p>
                        <div className="mt-12 text-left space-y-8 text-lg text-gray-600">
                             <p>
                               We are committed to operating in full compliance with all relevant Nigerian laws and regulations. We believe that a strong regulatory framework is essential for building trust and ensuring the long-term success of our platform and the protection of our users.
                             </p>
                             <div className="p-6 bg-white rounded-lg border border-gray-200">
                                 <h3 className="font-bold text-xl text-gray-900 mb-2">Regulatory Engagement</h3>
                                 <p>
                                    We will work closely with the <span className="font-semibold">Securities and Exchange Commission (SEC) Nigeria</span> to ensure that our platform meets all of the requirements for a crowdfunding portal and that our tokenized offerings are structured as compliant securities.
                                 </p>
                             </div>
                             <div className="p-6 bg-white rounded-lg border border-gray-200">
                                  <h3 className="font-bold text-xl text-gray-900 mb-2">Security & User Protection</h3>
                                 <p>
                                    We will adhere to all <span className="font-semibold">Anti-Money Laundering (AML)</span> and <span className="font-semibold">Know Your Customer (KYC)</span> regulations. This involves a robust verification process for all users to prevent fraud and ensure a secure investment environment for everyone on the platform.
                                 </p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div id="faq" className="py-16 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
                            <p className="mt-2 text-lg text-gray-600">
                                Answers to common questions from our users.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Investor FAQ */}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center md:text-left">For Investors</h3>
                                <div className="space-y-2">
                                    <FaqItem question="How do I invest in a project?">
                                        <p>First, complete your KYC verification in the settings. Once verified, navigate to the "Marketplace" tab, select "Properties," and click on a project you're interested in. On the project details page, you can enter the amount you wish to invest and complete the transaction from your funded wallet.</p>
                                    </FaqItem>
                                     <FaqItem question="What is a Security Token?">
                                        <p>A Security Token represents your direct investment in a property. It is locked for the duration of the project term and entitles you to monthly APY (Annual Percentage Yield) payments, which you can claim from the "My Tokens" page in your dashboard.</p>
                                    </FaqItem>
                                     <FaqItem question="What is a Market Token?">
                                        <p>A Market Token is paired with your Security Token and provides liquidity. You can list this token for sale on our "Secondary Market" at any time, allowing you to exit your position before the project's lockup period ends.</p>
                                    </FaqItem>
                                </div>
                            </div>
                            {/* Developer FAQ */}
                             <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center md:text-left">For Developers</h3>
                                <div className="space-y-2">
                                     <FaqItem question="How do I submit a new project for funding?">
                                        <p>After creating a developer account, navigate to the "Create New Project" tab in your dashboard. You'll be guided through a form to provide project details, financial projections, legal documents, and property images. Our team will review your submission within 5-7 business days.</p>
                                    </FaqItem>
                                    <FaqItem question="What are the platform fees for developers?">
                                        <p>We charge a one-time platform fee of 3% on the total capital raised for your project. This fee is deducted automatically when you withdraw the funds after a successful funding round. There are no upfront costs to list a project.</p>
                                    </FaqItem>
                                    <FaqItem question="When can I withdraw the raised capital?">
                                        <p>You can initiate a withdrawal of the raised funds as soon as your project's funding goal is met. The funds, minus the platform fee, will be securely transferred to your verified company treasury address from the "Manage Project" page.</p>
                                    </FaqItem>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const AuthPage = ({ children, title, setPage }) => {
    return (
        <div className="bg-gray-100 flex flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <a href="#" onClick={(e) => { e.preventDefault(); setPage('landing'); }} className="flex justify-center items-center gap-2 no-underline">
                    <KayzeraLogo className="h-12 w-auto"/>
                </a>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{title}</h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
                    {children}
                </div>
            </div>
        </div>
    );
};

const LoginPage = ({ setPage, setCurrentUser, users }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = users[email];
        if (user && user.password === password) {
            setCurrentUser(user);
            switch (user.type) {
                case 'investor': setPage('investorDashboard'); break;
                case 'developer': setPage('developerDashboard'); break;
                case 'admin': setPage('adminDashboard'); break;
                default: setPage('landing');
            }
        } else {
            setError('Invalid email or password.');
        }
    };

    return (
        <AuthPage title="Sign in to your account" setPage={setPage}>
            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                    <div className="mt-1">
                        <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
                    <div className="mt-1">
                        <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <a href="#" onClick={() => setPage('forgotPassword')} className="font-medium text-indigo-600 hover:text-indigo-500">Forgot your password?</a>
                    </div>
                </div>
                <div>
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Sign in</button>
                </div>
            </form>
            <div className="text-sm text-center mt-4">
                <p className="text-gray-600">Don't have an account? <a href="#" onClick={() => setPage('register')} className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</a></p>
            </div>
        </AuthPage>
    );
};

const RegisterPage = ({ setPage }) => {
    const [accountType, setAccountType] = useState('investor');

    return (
        <AuthPage title="Create a new account" setPage={setPage}>
             <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Register as</label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setAccountType('investor')}
                            className={`w-full inline-flex justify-center items-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                                accountType === 'investor' 
                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <UserIcon className="w-5 h-5 mr-2" />
                            Investor
                        </button>
                        <button
                            type="button"
                            onClick={() => setAccountType('developer')}
                            className={`w-full inline-flex justify-center items-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                                accountType === 'developer' 
                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <BuildingIcon className="w-5 h-5 mr-2" />
                            Developer
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <input type="email" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input type="password" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                 <div>
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Create Account</button>
                </div>
            </form>
             <div className="text-sm text-center mt-4">
                <p className="text-gray-600">Already have an account? <a href="#" onClick={() => setPage('login')} className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</a></p>
            </div>
        </AuthPage>
    );
}

const ForgotPasswordPage = ({ setPage }) => {
    return (
        <AuthPage title="Reset your password" setPage={setPage}>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <input type="email" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                 <div>
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Send Reset Link</button>
                </div>
            </form>
             <div className="text-sm text-center mt-4">
                <p className="text-gray-600">Remembered your password? <a href="#" onClick={() => setPage('login')} className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</a></p>
            </div>
        </AuthPage>
    );
};


const ProjectCard = ({ project, setPage, onViewDetails }) => {
    const progress = (project.amountRaised / project.fundingGoal) * 100;

    const handleButtonClick = () => {
        if (onViewDetails) {
            onViewDetails(project);
        } else if (setPage) {
            setPage('login'); 
        } else {
            alert('View Project Details');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 group">
            <div className="relative">
                <img className="h-56 w-full object-cover" src={project.imageUrl} alt={project.title} />
                 <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 text-sm font-semibold rounded-bl-lg">
                    {project.apy}% APY
                </div>
            </div>
            <div className="p-6">
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">{project.location}</p>
                <h3 className="mt-2 text-xl font-bold text-gray-900">{project.title} ({project.tokenTicker})</h3>
                <p className="mt-2 text-gray-600 h-12 overflow-hidden">{project.description.substring(0, 80)}...</p>
                
                <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Raised: {formatCurrency(project.amountRaised)}</span>
                        <span>Goal: {formatCurrency(project.fundingGoal)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center text-sm text-gray-800">
                    <div className="flex items-center">
                        <ClockIcon className="w-5 h-5 mr-1 text-gray-500"/> {project.term} Months
                    </div>
                    <button onClick={handleButtonClick} className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                        View Details &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- DASHBOARD COMPONENTS --- //
const DashboardLayout = ({ children, sidebarItems, activeItem, setActiveItem, onLogout, currentUser, totalBalance }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notificationContainerRef = React.useRef(null);

    useEffect(() => {
        // Tailor notifications based on user type
        if (currentUser.type === 'admin') {
            setNotifications([
                { id: 1, text: 'New project "Ikeja Tech Hub" submitted for approval.', read: false, time: '5m ago' },
                { id: 2, text: 'User Bayo Adekunle has submitted KYC documents.', read: false, time: '1h ago' },
                { id: 3, text: 'Eko Atlantic Tower has reached 50% funding.', read: true, time: '4h ago' },
                { id: 4, text: 'New developer account created: Babbage Constructions Ltd.', read: true, time: '1d ago' },
                { id: 5, text: 'Large withdrawal request ($25,000) initiated by Ada Lovelace.', read: true, time: '2d ago' },
            ]);
        } else { // Default for investor/developer
            setNotifications([
                { id: 1, text: 'Your KYC has been approved.', read: false, time: '2h ago' },
                { id: 2, text: 'Lekki Pearl Residence is now fully funded!', read: false, time: '1d ago' },
                { id: 3, text: 'Welcome to Kayzera! Complete your profile to start investing.', read: true, time: '3d ago' },
            ]);
        }
    }, [currentUser.type]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationContainerRef.current && !notificationContainerRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNavItemClick = (itemName) => {
        setActiveItem(itemName);
        setIsMobileMenuOpen(false);
    };

    const SidebarContent = () => (
        <div className="flex-grow">
            <div className="p-6">
                 <div className="flex items-center gap-2">
                    <KayzeraLogo className="h-10 w-auto" />
                </div>
            </div>
            <nav className="mt-6">
                {sidebarItems.map(item => (
                    <a 
                        key={item.name} 
                        href="#" 
                        onClick={() => handleNavItemClick(item.name)} 
                        className={`flex items-center py-3 px-6 text-gray-600 transition-colors duration-200 ${activeItem === item.name ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-500' : 'hover:bg-gray-50'}`}
                    >
                        {item.icon}
                        <span className="mx-4 font-medium">{item.name}</span>
                    </a>
                ))}
            </nav>
        </div>
    );

    return (
        <div className="bg-gray-100 flex-1 flex">
            <div className="flex w-full">
                {/* Desktop Sidebar */}
                <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
                    <SidebarContent />
                </aside>

                {/* Mobile Sidebar */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
                )}
                <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-30 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
                     <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-1">
                        <XIcon className="h-6 w-6" />
                    </button>
                    <SidebarContent />
                </aside>


                {/* Main Content */}
                <main className="flex-1 flex flex-col h-screen">
                     <div className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10 border-b">
                        <div className="flex items-center">
                             <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden mr-4 p-2 rounded-full text-gray-500 hover:text-indigo-600">
                                <MenuIcon className="h-6 w-6"/>
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800">{activeItem}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="hidden sm:flex items-center gap-4">
                                <span className="text-gray-700 text-sm">Welcome, {currentUser.name.split(' ')[0]}</span>
                                {currentUser.wallet && (
                                     <div className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1.5 rounded-full">
                                        {formatCurrency(totalBalance)}
                                    </div>
                                )}
                            </div>
                            
                            <div className="relative" ref={notificationContainerRef}>
                                <button 
                                    onClick={() => setNotificationsOpen(prev => !prev)}
                                    className="relative p-2 rounded-full text-gray-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    title="Notifications"
                                >
                                    <BellIcon className="h-6 w-6" />
                                    {notifications.some(n => !n.read) && (
                                        <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                                    )}
                                </button>
                                {notificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20 border">
                                        <div className="p-4 flex justify-between items-center border-b">
                                            <h4 className="font-semibold text-gray-800">Notifications</h4>
                                            <button
                                                onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                                                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
                                                disabled={!notifications.some(n => !n.read)}
                                            >
                                                Mark all as read
                                            </button>
                                        </div>
                                        <div className="divide-y max-h-96 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map(notification => (
                                                    <div
                                                        key={notification.id}
                                                        onClick={() => setNotifications(notifications.map(n => n.id === notification.id ? { ...n, read: true } : n))}
                                                        className={`p-4 flex items-start cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-indigo-50' : ''}`}
                                                    >
                                                        <div className={`flex-shrink-0 w-2 h-2 mt-1.5 rounded-full ${!notification.read ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                                                        <div className="ml-3">
                                                            <p className="text-sm text-gray-700">{notification.text}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center text-gray-500 py-8">No new notifications.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={onLogout} 
                                className="p-2 rounded-full text-gray-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                title="Logout"
                            >
                                <LogOutIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-indigo-100 text-indigo-600 rounded-full p-3 mr-4">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const FaqItem = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b">
            <button onClick={() => setIsOpen(!isOpen)} className="flex justify-between items-center w-full py-5 text-left">
                <span className="font-semibold text-lg text-gray-900">{question}</span>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-5 pr-10 text-gray-600">
                    {children}
                </div>
            )}
        </div>
    );
};

const HelpAndSupport = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState('FAQ'); // 'FAQ' or 'Live Support'
    const [messages, setMessages] = useState([
        { id: 1, sender: 'support', text: "Welcome to live support! How can we help you today?" },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        
        const userMessage = { id: Date.now(), sender: 'user', text: newMessage };
        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');

        // Mock reply from support
        setTimeout(() => {
             const supportReply = { id: Date.now() + 1, sender: 'support', text: "Thank you for your message. An agent will be with you shortly." };
             setMessages(prev => [...prev, supportReply]);
        }, 1500);
    };

    const renderFaqContent = () => {
        if (currentUser.type === 'developer') {
            return (
                <>
                    <FaqItem question="How do I submit a new project for funding?">
                        <p>Navigate to the "Create New Project" tab in your dashboard. You'll be guided through a form to provide project details, financial projections, legal documents, and property images. Our team will review your submission within 5-7 business days.</p>
                    </FaqItem>
                    <FaqItem question="What are the platform fees for developers?">
                        <p>We charge a one-time platform fee of 3% on the total capital raised for your project. This fee is deducted automatically when you withdraw the funds after a successful funding round. There are no upfront costs to list a project.</p>
                    </FaqItem>
                    <FaqItem question="When can I withdraw the raised capital?">
                        <p>You can initiate a withdrawal of the raised funds as soon as your project's funding goal is met. The funds, minus the platform fee, will be securely transferred to your verified company treasury address from the "Manage Project" page.</p>
                    </FaqItem>
                     <FaqItem question="How is the APY for investors managed?">
                        <p>Each project has a dedicated wallet for APY payments. As the developer, you are responsible for ensuring this wallet is sufficiently funded to cover the monthly APY distributions to your investors. You can deposit funds into this wallet from the "Manage Project" page.</p>
                    </FaqItem>
                </>
            );
        }
        // Default to Investor FAQ
        return (
            <>
                <FaqItem question="How do I invest in a project?">
                    <p>Navigate to the "Marketplace" tab, select "Properties," and click on a project you're interested in. On the project details page, you can enter the amount you wish to invest and complete the transaction.</p>
                </FaqItem>
                 <FaqItem question="What is a Security Token?">
                    <p>A Security Token represents your direct investment in a property. It is locked for the duration of the project term and entitles you to monthly APY (Annual Percentage Yield) payments, which you can claim from the "My Tokens" page.</p>
                </FaqItem>
                 <FaqItem question="What is a Market Token?">
                    <p>A Market Token is paired with your Security Token and provides liquidity. You can list this token for sale on our "Secondary Market" at any time, allowing you to exit your position before the project's lockup period ends.</p>
                </FaqItem>
            </>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
             <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('FAQ')}
                        className={`${activeTab === 'FAQ' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        FAQ
                    </button>
                    <button
                        onClick={() => setActiveTab('Live Support')}
                        className={`${activeTab === 'Live Support' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Live Support
                    </button>
                </nav>
            </div>

            {activeTab === 'FAQ' && (
                 <div className="bg-white p-8 rounded-lg shadow-md">
                     <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
                     <div className="space-y-2">
                        {renderFaqContent()}
                     </div>
                </div>
            )}

            {activeTab === 'Live Support' && (
                <div className="bg-white rounded-lg shadow-md flex flex-col" style={{height: '600px'}}>
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Live Support Chat</h2>
                        <p className="text-sm text-green-500 flex items-center"><span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>Online</p>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        {messages.map(msg => (
                             <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {msg.text}
                                 </div>
                             </div>
                        ))}
                    </div>
                    <div className="p-4 bg-gray-50 border-t">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                             <button type="button" className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-200">
                                <PaperclipIcon className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 block w-full border-gray-300 rounded-full py-2 px-4 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-indigo-700">
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

// --- INVESTOR DASHBOARD --- //
// --- CHART COMPONENTS --- //
const PortfolioPerformanceChart = ({ data }) => {
    const width = 500;
    const height = 250;
    const padding = 50;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    
    const xScale = (index) => padding + (index / (data.length - 1)) * (width - 2 * padding);
    const yScale = (value) => height - padding - ((value - minValue) / (maxValue - minValue)) * (height - 2 * padding);
    
    const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`).join(' ');
    const areaPath = `${path} L ${xScale(data.length - 1)} ${height - padding} L ${xScale(0)} ${height - padding} Z`;

    const yAxisLabels = () => {
        const labels = [];
        const steps = 4;
        for (let i = 0; i <= steps; i++) {
            const value = minValue + (i / steps) * (maxValue - minValue);
            labels.push(
                <g key={i}>
                    <text x={padding - 10} y={yScale(value)} dy="0.35em" style={{ fontSize: '10px', fill: 'currentColor', textAnchor: 'end' }} className="text-gray-500">
                        ${(value / 1000).toFixed(1)}k
                    </text>
                     <line x1={padding} y1={yScale(value)} x2={width-padding} y2={yScale(value)} className="stroke-current text-gray-200" strokeDasharray="2,2"/>
                </g>
            );
        }
        return labels;
    };

    return (
        <div className="w-full h-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
                    </linearGradient>
                </defs>
                
                {/* Y-axis labels and grid lines */}
                {yAxisLabels()}

                {/* X-axis labels */}
                {data.map((d, i) => (
                    <text key={i} x={xScale(i)} y={height - padding + 15} style={{ fontSize: '10px', fill: 'currentColor', textAnchor: 'middle' }} className="text-gray-500">
                        {d.month}
                    </text>
                ))}

                {/* Area path */}
                <path d={areaPath} fill="url(#areaGradient)" />

                {/* Line path */}
                <path d={path} fill="none" stroke="#4f46e5" strokeWidth="2" />

                {/* Data points */}
                {data.map((d, i) => (
                    <circle key={i} cx={xScale(i)} cy={yScale(d.value)} r="4" fill="#fff" stroke="#4f46e5" strokeWidth="2" />
                ))}
            </svg>
        </div>
    );
};

const AssetAllocationChart = ({ data }) => {
    const size = 200;
    const strokeWidth = 25;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    let cumulativePercent = 0;

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 h-full">
            <div className="relative" style={{ width: size, height: size }}>
                <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                    />
                    {data.map((item, index) => {
                        const percent = (item.value / totalValue) * 100;
                        const offset = circumference - (cumulativePercent / 100) * circumference;
                        const dash = (percent / 100) * circumference;
                        cumulativePercent += percent;
                        return (
                            <circle
                                key={index}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${dash} ${circumference}`}
                                strokeDashoffset={-offset}
                                className="transition-all duration-500"
                            />
                        );
                    })}
                </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-xl font-bold text-gray-800">${(totalValue / 1000).toFixed(1)}k</span>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center text-sm">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-600 mr-2">{item.name}:</span>
                        <span className="font-semibold text-gray-800">{((item.value / totalValue) * 100).toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const InvestorDashboard = ({ currentUser, projects, portfolios, marketListings, onLogout, onClaimApy, onListToken, onInvest, totalBalance }) => {
    const [activeItem, setActiveItem] = useState('Dashboard');

    const sidebarItems = [
        { name: 'Dashboard', icon: <EyeIcon className="h-5 w-5" /> },
        { name: 'My Tokens', icon: <BuildingIcon className="h-5 w-5" /> },
        { name: 'Marketplace', icon: <TrendingUpIcon className="h-5 w-5" /> },
        { name: 'My Wallet', icon: <WalletIcon className="h-5 w-5" /> },
        { name: 'Settings', icon: <SettingsIcon className="h-5 w-5" /> },
        { name: 'Help & Support', icon: <LifeBuoyIcon className="h-5 w-5" /> },
    ];
    
    const renderContent = () => {
        const isKycVerified = currentUser.kycStatus === 'Verified';

        switch (activeItem) {
            case 'Dashboard': return <InvestorDashboardOverview currentUser={currentUser} projects={projects} portfolios={portfolios} />;
            case 'My Tokens': return <InvestorMyTokens currentUser={currentUser} projects={projects} portfolios={portfolios} onClaimApy={onClaimApy} onListToken={onListToken} />;
            case 'Marketplace': return <InvestorMarketplace currentUser={currentUser} marketListings={marketListings} projects={projects} onInvest={onInvest} />;
            case 'My Wallet': 
                return isKycVerified 
                    ? <InvestorWallet currentUser={currentUser} /> 
                    : <KycRequired setActiveDashboardItem={setActiveItem} />;
            case 'Settings': return <InvestorSettings currentUser={currentUser} />;
            case 'Help & Support': return <HelpAndSupport currentUser={currentUser} />;
            default: return <InvestorDashboardOverview currentUser={currentUser} projects={projects} portfolios={portfolios} />;
        }
    };

    return (
        <DashboardLayout currentUser={currentUser} sidebarItems={sidebarItems} activeItem={activeItem} setActiveItem={setActiveItem} onLogout={onLogout} totalBalance={totalBalance}>
            {renderContent()}
        </DashboardLayout>
    );
};

const InvestorDashboardOverview = ({ currentUser, projects, portfolios }) => {
    const userPortfolio = portfolios[currentUser.id] || { tokens: [] };

    const stats = useMemo(() => {
        const totalInvestment = userPortfolio.tokens
            .filter(t => t.type === 'SECURITY')
            .reduce((sum, token) => sum + token.amount, 0);

        // The portfolio value should represent the value of the underlying assets (security tokens).
        // Market tokens are for liquidity and don't add to the total value, as they represent the same asset.
        const portfolioValue = totalInvestment;
        
        const lifetimeApy = totalInvestment * 0.15 * 1.2; // Mock calculation for lifetime earnings

        const uniqueProjects = [...new Set(userPortfolio.tokens.map(t => t.projectId))].length;

        return { totalInvestment, portfolioValue, lifetimeApy, uniqueProjects };
    }, [userPortfolio.tokens]);
    
    const recentActivities = [
        { id: 1, type: 'Investment', project: 'Eko Atlantic Tower', amount: -10000, date: '2025-09-01' },
        { id: 2, type: 'APY Claim', project: 'Lekki Pearl Residence', amount: 62.50, date: '2025-08-05' },
        { id: 3, type: 'Deposit', project: 'USD Wallet', amount: 25000, date: '2025-07-15' },
    ];

    const cryptoBalance = currentUser.wallet.usdt + currentUser.wallet.usdc;

    const performanceData = [
      { month: 'Apr', value: 13000 },
      { month: 'May', value: 14500 },
      { month: 'Jun', value: 14000 },
      { month: 'Jul', value: 15500 },
      { month: 'Aug', value: 17000 },
      { month: 'Sep', value: 17500 },
    ];

    const allocationData = useMemo(() => {
        const allocation = {};
        userPortfolio.tokens
            .filter(token => token.type === 'SECURITY') // Filter for only security tokens
            .forEach(token => {
                const project = projects.find(p => p.id === token.projectId);
                if (project) {
                    if (!allocation[project.title]) {
                        allocation[project.title] = 0;
                    }
                    allocation[project.title] += token.amount;
                }
            });
        const colors = ['#4f46e5', '#818cf8', '#a78bfa', '#c4b5fd'];
        return Object.entries(allocation).map(([name, value], index) => ({
            name,
            value,
            color: colors[index % colors.length]
        }));
    }, [userPortfolio, projects]);


    return (
         <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Portfolio Value" value={formatCurrency(stats.portfolioValue)} icon={<WalletIcon className="w-6 h-6" />} />
                <StatCard title="NGN Balance" value={formatNgnCurrency(currentUser.wallet.ngn)} icon={<WalletIcon className="w-6 h-6" />} />
                <StatCard title="Crypto Balance" value={formatCurrency(cryptoBalance)} icon={<WalletIcon className="w-6 h-6" />} />
                <StatCard title="Lifetime APY Earned" value={formatCurrency(stats.lifetimeApy)} icon={<TrendingUpIcon className="w-6 h-6" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Portfolio Performance</h3>
                    <PortfolioPerformanceChart data={performanceData} />
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md flex flex-col">
                     <h3 className="text-xl font-bold text-gray-800 mb-4">Asset Allocation</h3>
                     <div className="flex-grow flex items-center justify-center">
                        <AssetAllocationChart data={allocationData} />
                     </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                 <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <tbody>
                            {recentActivities.map(activity => (
                                <tr key={activity.id} className="border-b last:border-0">
                                    <td className="py-3 px-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {activity.amount > 0 ? <ArrowDownLeftIcon className="w-5 h-5 text-green-600"/> : <ArrowUpRightIcon className="w-5 h-5 text-red-600"/>}
                                        </div>
                                    </td>
                                    <td className="py-3 px-2">
                                        <p className="font-semibold text-gray-800">{activity.type}</p>
                                        <p className="text-sm text-gray-500">{activity.project}</p>
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                        <p className={`font-semibold ${activity.amount > 0 ? 'text-green-600' : 'text-gray-800'}`}>{formatCurrency(activity.amount)}</p>
                                        <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

const InvestorMyTokens = ({ currentUser, projects, portfolios, onClaimApy, onListToken }) => {
    const userPortfolio = portfolios[currentUser.id] || { tokens: [] };
    const [listModalOpen, setListModalOpen] = useState(false);
    const [tokenToList, setTokenToList] = useState(null);

    const handleOpenListModal = (token) => {
        setTokenToList(token);
        setListModalOpen(true);
    };

    const handleCloseListModal = () => {
        setTokenToList(null);
        setListModalOpen(false);
    };

    const handleConfirmListing = (listingDetails) => {
        onListToken(listingDetails);
        handleCloseListModal();
    };
    
    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Token Holdings</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens Held</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value (USD)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APY</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lockup / Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {userPortfolio.tokens.map(token => {
                                 const project = projects.find(p => p.id === token.projectId);
                                 if (!project) return null;

                                 const isSecurityToken = token.type === 'SECURITY';
                                 let endDate;
                                 let canClaimApy = false;

                                 if (isSecurityToken) {
                                     const startDate = new Date(project.startDate);
                                     endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + project.term));
                                     
                                     const lastClaimDate = new Date(token.lastApyClaimDate);
                                     const now = new Date();
                                     // Allow claim if the current month is after the last claimed month.
                                     const lastClaim = new Date(token.lastApyClaimDate);
const nextClaimDate = new Date(lastClaim);
nextClaimDate.setMonth(nextClaimDate.getMonth() + 1);
if (endDate > now && now >= nextClaimDate) {
    canClaimApy = true;
}
                                 }
                                 
                                 return (
                                     <tr key={token.tokenId}>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.title} ({project.tokenTicker})</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm">
                                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isSecurityToken ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                 {token.type}
                                             </span>
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{token.amount.toLocaleString()}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{formatCurrency(token.amount)}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{project.apy}%</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                             {isSecurityToken && endDate ? <LockupTimer endDate={endDate} /> : <span className="text-gray-500 capitalize">{token.status}</span>}
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                             {isSecurityToken ? (
                                                <button 
                                                    disabled={!canClaimApy || currentUser.kycStatus !== 'Verified'} 
                                                    onClick={() => onClaimApy(token.tokenId, currentUser.id)}
                                                    className="bg-green-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                >
                                                    {currentUser.kycStatus !== 'Verified' ? 'Verify KYC' : 'Claim APY'}
                                                </button>
                                             ) : (
                                                <button 
                                                    onClick={() => handleOpenListModal(token)}
                                                    className="text-indigo-600 hover:text-indigo-900 text-xs font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    disabled={token.status === 'listed' || currentUser.kycStatus !== 'Verified'}
                                                >
                                                    {currentUser.kycStatus !== 'Verified' ? 'Verify KYC to List' : token.status === 'listed' ? 'Listed' : 'List for Sale'}
                                                </button>
                                             )}
                                         </td>
                                     </tr>
                                 );
                            })}
                             {userPortfolio.tokens.length === 0 && (
                                <tr><td colSpan="7" className="text-center py-8 text-gray-500">You do not own any tokens yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {listModalOpen && tokenToList && (
                <ListTokenModal 
                    isOpen={listModalOpen}
                    onClose={handleCloseListModal}
                    token={tokenToList}
                    project={projects.find(p => p.id === tokenToList.projectId)}
                    onConfirmList={handleConfirmListing}
                    currentUser={currentUser}
                />
            )}
        </>
    );
};

const ListTokenModal = ({ isOpen, onClose, token, project, onConfirmList, currentUser }) => {
    const [amount, setAmount] = useState('');
    const [totalPrice, setTotalPrice] = useState('');
    const [pricePerToken, setPricePerToken] = useState('');
    const [activeInput, setActiveInput] = useState('total'); // 'total' or 'perToken'
    const [error, setError] = useState('');
    const [step, setStep] = useState('input'); // 'input', 'confirm'

    const handleAmountChange = (value) => {
        setAmount(value);
        const numericAmount = parseFloat(value);
        if (activeInput === 'total') {
            const numericTotalPrice = parseFloat(totalPrice);
            if (numericAmount > 0 && numericTotalPrice > 0) {
                setPricePerToken((numericTotalPrice / numericAmount).toFixed(4));
            } else {
                setPricePerToken('');
            }
        } else { // activeInput === 'perToken'
            const numericPricePerToken = parseFloat(pricePerToken);
            if (numericAmount > 0 && numericPricePerToken > 0) {
                setTotalPrice((numericAmount * numericPricePerToken).toFixed(2));
            } else {
                setTotalPrice('');
            }
        }
    };

    const handleTotalPriceChange = (value) => {
        setActiveInput('total');
        setTotalPrice(value);
        const numericAmount = parseFloat(amount);
        const numericTotalPrice = parseFloat(value);
        if (numericAmount > 0 && numericTotalPrice >= 0) {
            setPricePerToken((numericTotalPrice / numericAmount).toFixed(4));
        } else {
            setPricePerToken('');
        }
    };

    const handlePricePerTokenChange = (value) => {
        setActiveInput('perToken');
        setPricePerToken(value);
        const numericAmount = parseFloat(amount);
        const numericPricePerToken = parseFloat(value);
        if (numericAmount > 0 && numericPricePerToken >= 0) {
            setTotalPrice((numericAmount * numericPricePerToken).toFixed(2));
        } else {
            setTotalPrice('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!amount || !totalPrice || +amount <= 0 || +totalPrice <= 0) {
            setError('Please enter a valid amount and price.');
            return;
        }
        if (+amount > token.amount) {
            setError(`You cannot list more than your token balance of ${token.amount}.`);
            return;
        }
        setStep('confirm');
    };

    const handleFinalConfirm = () => {
        const listingDetails = {
            tokenId: token.tokenId,
            sellerId: currentUser.id,
            projectId: token.projectId,
            amount: +amount,
            price: +totalPrice,
        };
        onConfirmList(listingDetails);
    }


    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setAmount('');
                setTotalPrice('');
                setPricePerToken('');
                setError('');
                setActiveInput('total');
                setStep('input');
            }, 300); // Delay reset to avoid flicker on close
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const fee = parseFloat(totalPrice) * 0.015;
    const netProceeds = parseFloat(totalPrice) - fee;

    return (
         <WalletModal isOpen={isOpen} onClose={onClose} title={`List Token for ${project.title} (${project.tokenTicker})`}>
            {step === 'input' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <p className="text-sm"><strong>Token Balance:</strong> {token.amount.toLocaleString()}</p>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Amount to Sell</label>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            placeholder="e.g., 1000"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Price / Token (USD)</label>
                            <input 
                                type="number" 
                                step="0.0001"
                                value={pricePerToken}
                                onChange={(e) => handlePricePerTokenChange(e.target.value)}
                                onFocus={() => setActiveInput('perToken')}
                                placeholder="e.g., 1.10"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Total Price (USD)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={totalPrice}
                                onChange={(e) => handleTotalPriceChange(e.target.value)}
                                onFocus={() => setActiveInput('total')}
                                placeholder="e.g., 1100"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            />
                        </div>
                    </div>
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="text-xs text-gray-500">
                        <p>A 1.5% transaction fee will be deducted upon sale.</p>
                    </div>
                     <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Confirm Listing</button>
                    </div>
                </form>
            )}

            {step === 'confirm' && (
                 <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Listing Details</h3>
                    <p className="text-gray-600 mb-4">Please review and confirm the details of your token listing.</p>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border">
                        <div className="flex justify-between"><span className="text-gray-600">Amount to List:</span><span className="font-bold">{parseInt(amount).toLocaleString()} {project.tokenTicker}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Asking Price:</span><span className="font-medium">{formatCurrency(parseFloat(totalPrice))}</span></div>
                        <div className="flex justify-between text-red-600"><span className="text-gray-600">Platform Fee (1.5%):</span><span className="font-medium">-{formatCurrency(fee)}</span></div>
                        <div className="flex justify-between border-t mt-2 pt-2"><span className="font-bold">Net Proceeds on Sale:</span><span className="font-bold text-green-600">{formatCurrency(netProceeds)}</span></div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button onClick={() => setStep('input')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Back</button>
                        <button onClick={handleFinalConfirm} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Confirm & List Token</button>
                    </div>
                </div>
            )}
        </WalletModal>
    );
};


const InvestorMarketplace = ({ currentUser, marketListings, projects, onInvest }) => {
    const [activeTab, setActiveTab] = useState('Properties');
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'Secondary Market':
                return <SecondaryMarket currentUser={currentUser} marketListings={marketListings} projects={projects} />;
            case 'Properties':
                return <PropertiesMarket projects={projects} currentUser={currentUser} onInvest={onInvest} />;
            case 'Currency Exchange':
                return <CurrencyExchange />;
            default:
                return null;
        }
    };

    return (
        <div>
             <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('Properties')}
                        className={`${activeTab === 'Properties' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Properties
                    </button>
                    <button
                        onClick={() => setActiveTab('Secondary Market')}
                        className={`${activeTab === 'Secondary Market' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Secondary Market
                    </button>
                    <button
                        onClick={() => setActiveTab('Currency Exchange')}
                        className={`${activeTab === 'Currency Exchange' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Currency Exchange
                    </button>
                </nav>
            </div>
            {renderTabContent()}
        </div>
    );
};

const InvestorWallet = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState('Crypto');

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Wallet</h2>
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('Crypto')}
                        className={`${activeTab === 'Crypto' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Crypto Wallet
                    </button>
                    <button
                        onClick={() => setActiveTab('Fiat')}
                        className={`${activeTab === 'Fiat' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Fiat Wallet (NGN)
                    </button>
                </nav>
            </div>
            {activeTab === 'Crypto' ? <CryptoWallet wallet={currentUser.wallet} /> : <FiatWallet wallet={currentUser.wallet} />}
        </div>
    );
};

const KycRequired = ({ setActiveDashboardItem }) => {
    return (
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <ShieldCheckIcon className="mx-auto h-16 w-16 text-yellow-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">Verification Required</h2>
            <p className="mt-2 text-gray-600">Please complete your KYC verification to access your wallet and start investing.</p>
            <button
                onClick={() => setActiveDashboardItem('Settings')}
                className="mt-6 inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
                Go to Verification
            </button>
        </div>
    );
};

const InvestorSettings = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState('KYC');

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Settings</h2>
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('KYC')}
                        className={`${activeTab === 'KYC' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        KYC Verification
                    </button>
                    <button
                        onClick={() => setActiveTab('2FA')}
                        className={`${activeTab === '2FA' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Two-Factor Auth
                    </button>
                </nav>
            </div>
            {activeTab === 'KYC' ? <InvestorKycSettings status={currentUser.kycStatus} /> : <TwoFactorAuthSettings enabled={currentUser.twoFactorEnabled} />}
        </div>
    );
};

const InvestorKycSettings = ({ status }) => {
    const [kycStatus, setKycStatus] = useState(status);

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, this would involve file uploads and API calls.
        setKycStatus('Pending');
    };

    if (kycStatus === 'Verified') {
        return (
            <div className="p-6 bg-green-50 rounded-lg border border-green-200 flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500 mr-4"/>
                <div>
                    <h3 className="text-lg font-semibold text-green-800">KYC Verified</h3>
                    <p className="text-green-700">Your account is fully verified. You have access to all platform features.</p>
                </div>
            </div>
        );
    }

    if (kycStatus === 'Pending') {
        return (
             <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center">
                <ClockIcon className="w-8 h-8 text-yellow-500 mr-4"/>
                <div>
                    <h3 className="text-lg font-semibold text-yellow-800">KYC Pending Review</h3>
                    <p className="text-yellow-700">Your documents have been submitted and are under review. This usually takes 24-48 hours.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Submit KYC Documents</h3>
            <p className="text-sm text-gray-600 mb-6">To access wallet features and start investing, please complete your KYC verification.</p>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Government-Issued ID</label>
                    <p className="text-xs text-gray-500 mb-2"> (e.g., National ID Card, Passport, Driver's License)</p>
                     <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <FileUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="id-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input id="id-upload" name="id-upload" type="file" className="sr-only"/>
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                        </div>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proof of Address</label>
                    <p className="text-xs text-gray-500 mb-2">(e.g., Utility Bill, Bank Statement)</p>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                             <FileUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="address-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                    <span>Upload a file</span>
                                    <input id="address-upload" name="address-upload" type="file" className="sr-only"/>
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                        </div>
                    </div>
                </div>
                 <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Submit for Verification</button>
                </div>
            </form>
        </div>
    );
};

const WalletModal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const CryptoWallet = ({ wallet }) => {
    const [modalConfig, setModalConfig] = useState({ isOpen: false, action: null, currency: null });

    const openModal = (action, currency) => setModalConfig({ isOpen: true, action, currency });
    const closeModal = () => setModalConfig({ isOpen: false, action: null, currency: null });

    const cryptoAssets = [
        { name: 'USDT', balance: wallet.usdt, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=023' },
        { name: 'USDC', balance: wallet.usdc, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=023' }
    ];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cryptoAssets.map(asset => (
                    <div key={asset.name} className="p-4 border rounded-lg">
                        <div className="flex items-center mb-4">
                            <img src={asset.logo} alt={`${asset.name} logo`} className="w-8 h-8 mr-3"/>
                            <h3 className="text-lg font-bold">{asset.name}</h3>
                        </div>
                        <p className="text-2xl font-semibold text-gray-800">{asset.balance.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Balance</p>
                        <div className="mt-4 flex space-x-2">
                             <button onClick={() => openModal('Deposit', asset.name)} className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                                <ArrowDownLeftIcon className="w-4 h-4 mr-1"/> Deposit
                            </button>
                            <button onClick={() => openModal('Withdraw', asset.name)} className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <ArrowUpRightIcon className="w-4 h-4 mr-1"/> Withdraw
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <WalletModal isOpen={modalConfig.isOpen} onClose={closeModal} title={`${modalConfig.action} ${modalConfig.currency}`}>
                {modalConfig.action === 'Deposit' && (
                    <div>
                        <p className="text-sm text-center text-gray-600 mb-4">Send {modalConfig.currency} to this address. Only send {modalConfig.currency} on the TRC20 network.</p>
                        <div className="bg-gray-100 p-3 rounded-md text-center">
                            <p className="text-xs text-gray-500 mb-1">Your {modalConfig.currency} Deposit Address</p>
                            <p className="font-mono break-all">TAbcdeFGHIjklmnoPQRSTuvwxyz12345</p>
                        </div>
                        <button className="mt-4 w-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                           <ClipboardIcon className="w-4 h-4 mr-2"/> Copy Address
                        </button>
                    </div>
                )}
                {modalConfig.action === 'Withdraw' && (
                    <form className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{modalConfig.currency} Address</label>
                            <input type="text" placeholder="Enter recipient address" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input type="number" placeholder="0.00" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                        </div>
                        <p className="text-xs text-gray-500">Fee: 0.5 {modalConfig.currency}</p>
                        <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Confirm Withdraw</button>
                    </form>
                )}
            </WalletModal>
        </div>
    );
};

const FiatWallet = ({ wallet }) => {
    const [modalConfig, setModalConfig] = useState({ isOpen: false, action: null });
    const [ngnAmount, setNgnAmount] = useState('');
    
    const openModal = (action) => {
        setNgnAmount(''); // Reset amount when opening modal
        setModalConfig({ isOpen: true, action });
    };
    const closeModal = () => setModalConfig({ isOpen: false, action: null });

    const handleNgnChange = (e) => {
        const value = e.target.value;
        // Remove all non-digit characters
        const numericString = value.replace(/[^0-9]/g, '');
        if (numericString) {
            // Format the number with commas
            const formattedValue = parseInt(numericString, 10).toLocaleString('en-US');
            setNgnAmount(formattedValue);
        } else {
            setNgnAmount('');
        }
    };

    return (
        <div>
            <div className="p-4 border rounded-lg max-w-md mx-auto">
                <h3 className="text-lg font-bold">NGN Wallet</h3>
                <p className="text-3xl font-semibold text-gray-800 mt-2">{formatNgnCurrency(wallet.ngn)}</p>
                <p className="text-sm text-gray-500">Available Balance</p>
                <div className="mt-4 flex space-x-2">
                    <button onClick={() => openModal('Deposit')} className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                        <ArrowDownLeftIcon className="w-4 h-4 mr-1"/> Deposit
                    </button>
                    <button onClick={() => openModal('Withdraw')} className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <ArrowUpRightIcon className="w-4 h-4 mr-1"/> Withdraw
                    </button>
                </div>
            </div>

            <WalletModal isOpen={modalConfig.isOpen} onClose={closeModal} title={`${modalConfig.action} NGN`}>
                {modalConfig.action === 'Deposit' && (
                    <div className="text-sm text-gray-700 space-y-3">
                        <p>To deposit NGN, please make a bank transfer to the following account:</p>
                        <div className="bg-gray-100 p-3 rounded-md">
                            <p><strong>Bank:</strong> Wema Bank</p>
                            <p><strong>Account Number:</strong> 0123456789</p>
                            <p><strong>Account Name:</strong> Kayzera Funding</p>
                        </div>
                        <p className="text-xs text-red-600"><strong>Important:</strong> Please use your email address as the transfer reference for faster processing.</p>
                    </div>
                )}
                {modalConfig.action === 'Withdraw' && (
                    <form className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                            <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                <option>GTBank</option>
                                <option>Zenith Bank</option>
                                <option>Access Bank</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Account Number</label>
                            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Amount (NGN)</label>
                            <input 
                                type="text" 
                                placeholder="0" 
                                value={ngnAmount}
                                onChange={handleNgnChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Request Withdrawal</button>
                    </form>
                )}
            </WalletModal>
        </div>
    );
};


const SecondaryMarket = ({ currentUser, marketListings, projects }) => {
    const camouflageName = (fullName) => {
        if (!fullName || typeof fullName !== 'string') return '*****';
        const parts = fullName.trim().split(' ');
        const name = parts[0]; // Just use the first name for simplicity
        if (name.length <= 4) {
            return `${name.substring(0, 1)}***`;
        }
        return `${name.substring(0, 2)}***${name.substring(name.length - 2)}`;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Secondary Market Listings</h2>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens For Sale</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price / Token</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price (USD)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {marketListings.map(listing => {
                            const project = projects.find(p => p.id === listing.projectId);
                            // Mock finding seller name
                             const sellerName = Object.values(initialUsers).find(u => u.id === listing.sellerId)?.name || 'Unknown';
                             const pricePerToken = listing.amount > 0 ? listing.price / listing.amount : 0;
                             return (
                                 <tr key={listing.listingId}>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project?.title} ({project?.tokenTicker})</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{listing.amount.toLocaleString()}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{formatCurrency(pricePerToken)}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatCurrency(listing.price)}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{camouflageName(sellerName)}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                         <button
                                            disabled={currentUser.id === listing.sellerId || currentUser.type === 'developer' || currentUser.kycStatus !== 'Verified'}
                                            className="bg-green-500 text-white px-4 py-1.5 rounded-md text-xs font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            {currentUser.kycStatus !== 'Verified' ? 'Verify KYC' : currentUser.id === listing.sellerId ? 'Your Listing' : 'Buy Now'}
                                         </button>
                                     </td>
                                 </tr>
                             );
                        })}
                        {marketListings.length === 0 && (
                            <tr><td colSpan="5" className="text-center py-8 text-gray-500">No tokens are currently listed on the market.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PropertiesMarket = ({ projects, currentUser, onInvest }) => {
    const [selectedProject, setSelectedProject] = useState(null);

    const handleViewDetails = (project) => {
        setSelectedProject(project);
    };

    const handleBack = () => {
        setSelectedProject(null);
    };

    if (selectedProject) {
        return <ProjectDetailsPage project={selectedProject} onBack={handleBack} currentUser={currentUser} onInvest={onInvest} />;
    }
    
    const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'funded');
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Available Properties for Investment</h2>
            <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                {activeProjects.map(project => (
                    <ProjectCard key={project.id} project={project} onViewDetails={handleViewDetails} />
                ))}
            </div>
        </div>
    );
};

const ProjectDetailsPage = ({ project, onBack, currentUser, onInvest }) => {
    const [mainImage, setMainImage] = useState(project.images[0]);
    const [investmentAmount, setInvestmentAmount] = useState('');
    const [isInvestmentModalOpen, setInvestmentModalOpen] = useState(false);
    
    const isKycVerified = currentUser.kycStatus === 'Verified';
    const stablecoinBalance = (currentUser.wallet.usdt || 0) + (currentUser.wallet.usdc || 0);
    const numericInvestmentAmount = parseFloat(investmentAmount.replace(/,/g, '')) || 0;
    const pricePerToken = project.fundingGoal > 0 && project.tokenSupply > 0 ? project.fundingGoal / project.tokenSupply : 1;
    const tokensToReceive = numericInvestmentAmount > 0 ? numericInvestmentAmount / pricePerToken : 0;
    const fee = numericInvestmentAmount * 0.015;
    const totalDebit = numericInvestmentAmount + fee;
    const progress = (project.amountRaised / project.fundingGoal) * 100;
    
    const isDeveloper = currentUser && currentUser.type === 'developer';
    const isFunded = project.status === 'funded';

    const handleAmountChange = (e) => {
        const value = e.target.value;
        const numericString = value.replace(/[^0-9]/g, '');
        let numericValue = parseInt(numericString, 10);

        if (isNaN(numericValue)) {
            setInvestmentAmount('');
            return;
        }

        // Calculate max investment considering the 1.5% fee
        const maxInvestment = Math.floor(stablecoinBalance / 1.015);

        if (numericValue > maxInvestment) {
            numericValue = maxInvestment;
        }
        
        setInvestmentAmount(numericValue > 0 ? numericValue.toLocaleString('en-US') : '');
    };

    const handleConfirmInvest = () => {
        onInvest(project.id, numericInvestmentAmount);
    };

    return (
        <div>
            <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Properties
            </button>
            
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <div className="p-4 md:p-6">
                        <img src={mainImage} alt="Main project view" className="w-full h-96 object-cover rounded-lg shadow-md"/>
                        <div className="flex space-x-2 mt-4">
                            {project.images.map((img, index) => (
                                <img 
                                    key={index}
                                    src={img} 
                                    alt={`Thumbnail ${index + 1}`}
                                    className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 transition-all ${mainImage === img ? 'border-indigo-500' : 'border-transparent hover:border-gray-300'}`}
                                    onClick={() => setMainImage(img)}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-4 md:p-6 flex flex-col">
                         <div className="flex-grow">
                            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">{project.location}</p>
                            <h1 className="mt-1 text-3xl font-bold text-gray-900">{project.title} ({project.tokenTicker})</h1>
                            <p className="mt-4 text-gray-600 text-base">{project.description}</p>
                            
                            <div className="mt-6 grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-gray-800 bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center font-semibold"><TrendingUpIcon className="w-5 h-5 mr-2 text-indigo-500"/>APY:<span className="ml-auto font-bold text-lg text-green-600">{project.apy}%</span></div>
                                <div className="flex items-center font-semibold"><ClockIcon className="w-5 h-5 mr-2 text-indigo-500"/>Term:<span className="ml-auto">{project.term} Months</span></div>
                                <div className="flex items-center font-semibold"><UserIcon className="w-5 h-5 mr-2 text-indigo-500"/>Developer:<span className="ml-auto">{project.developerName}</span></div>
                                <div className="flex items-center font-semibold"><CheckCircleIcon className="w-5 h-5 mr-2 text-indigo-500"/>Status:<span className="ml-auto capitalize">{project.status}</span></div>
                            </div>
                        </div>

                         <div className="mt-8">
                             <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                             <div className="flex justify-between text-sm text-gray-600 mb-4">
                                <span><strong>Raised:</strong> {formatCurrency(project.amountRaised)}</span>
                                <span><strong>Goal:</strong> {formatCurrency(project.fundingGoal)}</span>
                            </div>

                             <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                                 <h3 className="font-bold text-lg text-gray-800">Invest in this Project</h3>
                                 <div className="mt-4">
                                    <input 
                                        type="text"
                                        placeholder={isFunded ? "This project is fully funded" : "Enter amount (USD)"} 
                                        value={investmentAmount}
                                        onChange={handleAmountChange}
                                        className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                                        disabled={isFunded || isDeveloper}
                                    />
                                    <div className="mt-2 text-sm text-gray-500 text-right">
                                        Available Balance: <strong>{formatCurrency(stablecoinBalance)}</strong>
                                    </div>
                                 </div>
                                {investmentAmount > 0 && !isFunded && (
                                    <div className="mt-4 text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tokens to Receive:</span>
                                            <span className="font-bold text-indigo-600">{tokensToReceive.toLocaleString(undefined, { maximumFractionDigits: 2 })} {project.tokenTicker}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Investment Amount:</span>
                                            <span className="font-medium text-gray-800">{formatCurrency(numericInvestmentAmount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Platform Fee (1.5%):</span>
                                            <span className="font-medium text-gray-800">{formatCurrency(fee)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 mt-2">
                                            <span className="font-bold text-gray-800">Total Debit:</span>
                                            <span className="font-bold text-gray-900">{formatCurrency(totalDebit)}</span>
                                        </div>
                                    </div>
                                )}
                                 <div className="mt-4">
                                     <button 
                                        onClick={() => setInvestmentModalOpen(true)} 
                                        className="w-full bg-indigo-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={isDeveloper || isFunded || !investmentAmount || numericInvestmentAmount <= 0 || totalDebit > stablecoinBalance || !isKycVerified}
                                     >
                                        {isDeveloper ? "Developers cannot invest" : isFunded ? "Project Fully Funded" : !isKycVerified ? "Verify KYC to Invest" : "Invest Now"}
                                     </button>
                                     <button 
                                        className="mt-2 w-full flex items-center justify-center bg-transparent text-indigo-600 px-6 py-2 rounded-md font-semibold hover:bg-indigo-50 border border-indigo-200 transition-colors"
                                     >
                                        <SparklesIcon className="w-5 h-5 mr-2" /> ✨ Ask AI about this Property
                                     </button>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
             <InvestmentModal 
                isOpen={isInvestmentModalOpen}
                onClose={() => setInvestmentModalOpen(false)}
                onConfirm={handleConfirmInvest}
                project={project}
                details={{ numericInvestmentAmount, fee, totalDebit, tokensToReceive }}
            />
             <AIChatModal 
                project={project}
            />
        </div>
    );
};

const AIChatModal = ({ isOpen, onClose, project }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    useEffect(() => {
        if(isOpen) {
            // Reset state when modal opens
            setMessages([{ 
                sender: 'bot', 
                text: `Hi! I'm your AI assistant. How can I help you with the "${project.title}" property today? You can ask about the location, investment potential, or market trends.` 
            }]);
            setInput('');
            setIsLoading(false);
        }
    }, [isOpen, project.title]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const systemPrompt = `You are a helpful and knowledgeable real estate investment assistant for a platform called Kayzera. Your purpose is to answer user questions about a specific property to help them make an informed investment decision. You must be professional, encouraging, and base your answers on the provided context and grounded search results. Never give financial advice.

            Here is the context for the current property:
            - Title: ${project.title}
            - Location: ${project.location}
            - Description: ${project.description}
            - Funding Goal: ${formatCurrency(project.fundingGoal)}
            - APY: ${project.apy}%
            - Term: ${project.term} months
            - Status: ${project.status}
            `;

            

            const responseText = await callAIAPI({
    messages: [
        { role: 'system', content: "You are an AI assistant that helps with real estate due diligence and investment analysis." },
        { role: 'user', content: userPrompt }
    ]
});
            const botMessage = { sender: 'bot', text: responseText };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            const errorMessage = { sender: 'bot', text: "I'm sorry, I encountered an error while trying to get a response. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col" style={{height: '80vh', maxHeight: '700px'}}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <div className="flex items-center">
                         <SparklesIcon className="w-6 h-6 text-indigo-600 mr-3"/>
                        <div>
                             <h3 className="text-lg font-semibold text-gray-800">Ask AI about {project.title}</h3>
                             <p className="text-xs text-green-600 flex items-center"><span className="h-2 w-2 bg-green-500 rounded-full mr-1.5"></span>Online</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-100">
                    {messages.map((msg, index) => (
                         <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0">
                                    <BotIcon className="w-5 h-5" />
                                </div>
                            )}
                            <div className={`max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border'}`}>
                               <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                            </div>
                              {msg.sender === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                            )}
                         </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3 justify-start">
                             <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0">
                                <BotIcon className="w-5 h-5" />
                            </div>
                            <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-lg bg-white text-gray-800 rounded-bl-none border">
                               <div className="flex items-center space-x-1">
                                  <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                  <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                  <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-pulse"></span>
                               </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 bg-white border-t rounded-b-lg">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-1 block w-full border-gray-300 rounded-full py-2 px-4 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-full font-semibold hover:bg-indigo-700 disabled:bg-indigo-300" disabled={isLoading}>
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};


const InvestmentModal = ({ isOpen, onClose, onConfirm, project, details }) => {
    const [status, setStatus] = useState('confirm'); // confirm, processing, success, error

    const handleConfirm = () => {
        setStatus('processing');
        // Simulate network request
        setTimeout(() => {
            try {
                onConfirm();
                setStatus('success');
            } catch (e) {
                setStatus('error');
            }
        }, 2000);
    };

    const handleClose = () => {
        onClose();
        // Reset status for next time modal opens
        setTimeout(() => setStatus('confirm'), 300);
    };

    if (!isOpen) return null;

    const renderContent = () => {
        switch (status) {
            case 'processing':
                return (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <h4 className="font-semibold text-lg text-gray-800">Processing Transaction</h4>
                        <p className="text-gray-600">Please wait while we confirm your investment on the blockchain...</p>
                    </div>
                );
            case 'success':
                return (
                     <div className="text-center py-8">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h4 className="font-semibold text-lg text-gray-800">Investment Successful!</h4>
                        <p className="text-gray-600">Congratulations! You are now a fractional owner of {project.title}.</p>
                        <button onClick={handleClose} className="mt-6 bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700">View My Tokens</button>
                    </div>
                );
            case 'error':
                 return (
                     <div className="text-center py-8">
                        <XIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h4 className="font-semibold text-lg text-red-600">Investment Failed</h4>
                        <p className="text-gray-600">Something went wrong. Please try again.</p>
                        <button onClick={handleClose} className="mt-6 bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300">Close</button>
                    </div>
                );
            case 'confirm':
            default:
                return (
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Your Investment</h3>
                        <p className="text-gray-600 mb-4">You are about to invest in <strong>{project.title}</strong>. Please review the details below.</p>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border">
                            <div className="flex justify-between"><span className="text-gray-600">Investment Amount:</span><span className="font-medium">{formatCurrency(details.numericInvestmentAmount)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Platform Fee (1.5%):</span><span className="font-medium">{formatCurrency(details.fee)}</span></div>
                            <div className="flex justify-between border-t mt-2 pt-2"><span className="font-bold">Total Debit:</span><span className="font-bold">{formatCurrency(details.totalDebit)}</span></div>
                            <hr className="my-2"/>
                            <div className="flex justify-between"><span className="text-gray-600">Tokens to Receive:</span><span className="font-bold text-indigo-600">{details.tokensToReceive.toLocaleString(undefined, { maximumFractionDigits: 2 })} {project.tokenTicker}</span></div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={handleClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                            <button onClick={handleConfirm} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Confirm Investment</button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};


const CurrencyExchange = () => {
    const USD_NGN_RATE = 1500;
    const [fromAmount, setFromAmount] = useState('150,000');
    const [toAmount, setToAmount] = useState('100.00');
    const [fromCurrency, setFromCurrency] = useState('NGN');
    const [toCurrency, setToCurrency] = useState('USDT');

    const handleSwapCurrencies = () => {
        const oldFromAmount = fromAmount;
        setFromAmount(toAmount);
        setToAmount(oldFromAmount);
        
        const oldFromCurrency = fromCurrency;
        setFromCurrency(toCurrency);
        setToCurrency(oldFromCurrency);
    };

    useEffect(() => {
        const numericFrom = parseFloat(String(fromAmount).replace(/,/g, '')) || 0;
        if (numericFrom === 0) {
            setToAmount('');
            return;
        }

        let newToAmount;
        if (fromCurrency === 'NGN') { // NGN -> Crypto
            newToAmount = (numericFrom / USD_NGN_RATE).toFixed(2);
        } else { // Crypto -> NGN
            newToAmount = numericFrom * USD_NGN_RATE;
            newToAmount = newToAmount.toLocaleString('en-US', {maximumFractionDigits: 0});
        }
        setToAmount(newToAmount);

    }, [fromAmount, fromCurrency, toCurrency]);

    const handleFromAmountChange = (e) => {
        let value = e.target.value;
        if (fromCurrency === 'NGN') {
            const numericString = value.replace(/[^0-9]/g, '');
            setFromAmount(numericString ? parseInt(numericString, 10).toLocaleString('en-US') : '');
        } else { // It's Crypto
            let cleanValue = value.replace(/[^0-9.]/g, '');
            const parts = cleanValue.split('.');
            if (parts.length > 2) {
                cleanValue = parts[0] + '.' + parts.slice(1).join('');
            }
            setFromAmount(cleanValue);
        }
    };
    
    const renderCurrencySelector = (currency, setCurrency) => {
        const isCrypto = ['USDT', 'USDC'].includes(currency);
        
        if (isCrypto) {
            return (
                 <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)} 
                    className="text-xl font-semibold border-0 focus:ring-0 bg-gray-100 rounded-md p-2"
                >
                    <option>USDT</option>
                    <option>USDC</option>
                </select>
            );
        }
        return <span className="text-xl font-semibold bg-gray-100 rounded-md py-2 px-4">{currency}</span>
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Exchange NGN & Crypto</h2>
            <div className="space-y-2">
                {/* From Field */}
                <div className="p-4 border rounded-lg">
                     <label className="text-sm font-medium text-gray-500">You Pay</label>
                     <div className="flex items-center">
                        <input 
                            type="text" 
                            value={fromAmount}
                            onChange={handleFromAmountChange}
                            className="w-full text-3xl font-bold border-0 p-0 focus:ring-0 bg-transparent"
                            placeholder="0"
                        />
                        {renderCurrencySelector(fromCurrency, setFromCurrency)}
                    </div>
                </div>
                
                {/* Swap Button */}
                <div className="flex justify-center py-2">
                    <button onClick={handleSwapCurrencies} className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-indigo-600">
                        <RepeatIcon className="w-6 h-6"/>
                    </button>
                </div>

                {/* To Field */}
                <div className="p-4 border rounded-lg bg-gray-50">
                    <label className="text-sm font-medium text-gray-500">You Receive (approx.)</label>
                     <div className="flex items-center">
                        <input 
                            type="text" 
                            value={toAmount} 
                            readOnly
                            className="w-full text-3xl font-bold border-0 p-0 focus:ring-0 bg-transparent text-gray-700"
                            placeholder="0"
                        />
                        {renderCurrencySelector(toCurrency, setToCurrency)}
                    </div>
                </div>

                <div className="pt-2 text-sm text-gray-600 text-center">
                    <p>Exchange Rate: 1 {fromCurrency === 'NGN' ? toCurrency : fromCurrency} ≈ {USD_NGN_RATE.toLocaleString()} {fromCurrency === 'NGN' ? fromCurrency : toCurrency}</p>
                    <p>Fee: 0.5% (included in rate)</p>
                </div>
                <div className="pt-2">
                    <button
                        onClick={() => alert('Currency swap initiated!')}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Convert
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- DEVELOPER DASHBOARD --- //
const DeveloperDashboard = ({ currentUser, projects, portfolios, marketListings, onLogout, totalBalance }) => {
    const [activeItem, setActiveItem] = useState('Dashboard');
    const [managingProjectId, setManagingProjectId] = useState(null);

    const developerProjects = projects.filter(p => p.developerId === currentUser.id);

    const sidebarItems = [
        { name: 'Dashboard', icon: <EyeIcon className="h-5 w-5" /> },
        { name: 'My Projects', icon: <BuildingIcon className="h-5 w-5" /> },
        { name: 'Create New Project', icon: <CheckCircleIcon className="h-5 w-5" /> },
        { name: 'Marketplace', icon: <TrendingUpIcon className="h-5 w-5" /> },
        { name: 'Operational Wallet', icon: <WalletIcon className="h-5 w-5" /> },
        { name: 'Settings', icon: <SettingsIcon className="h-5 w-5" /> },
        { name: 'Help & Support', icon: <LifeBuoyIcon className="h-5 w-5" /> },
    ];
    
     const renderContent = () => {
        const developerMarketplaceOnInvest = () => alert("Developers are not permitted to invest in projects or purchase from the secondary market.");

        switch (activeItem) {
            case 'Dashboard': return <DeveloperDashboardOverview currentUser={currentUser} projects={developerProjects} portfolios={portfolios} />;
            case 'My Projects':
                const projectToManage = projects.find(p => p.id === managingProjectId);
                if (projectToManage) {
                    return <DeveloperManageProject project={projectToManage} onBack={() => setManagingProjectId(null)} />;
                }
                return <DeveloperMyProjects projects={developerProjects} onManageProject={setManagingProjectId} />;
            case 'Create New Project': return <DeveloperCreateProject />;
            case 'Marketplace': return <InvestorMarketplace currentUser={currentUser} marketListings={marketListings} projects={projects} onInvest={developerMarketplaceOnInvest} />;
            case 'Operational Wallet': return <DeveloperWallet currentUser={currentUser} />;
            case 'Settings': return <DeveloperSettings currentUser={currentUser} />;
            case 'Help & Support': return <HelpAndSupport currentUser={currentUser} />;
            default: return <DeveloperDashboardOverview currentUser={currentUser} projects={developerProjects} portfolios={portfolios} />;
        }
    };
    
    // Reset management view when switching sidebar tabs
    useEffect(() => {
        setManagingProjectId(null);
    }, [activeItem]);

    return (
        <DashboardLayout currentUser={currentUser} sidebarItems={sidebarItems} activeItem={activeItem} setActiveItem={setActiveItem} onLogout={onLogout} totalBalance={totalBalance}>
            {renderContent()}
        </DashboardLayout>
    );
};

const DeveloperDashboardOverview = ({ currentUser, projects, portfolios }) => {
    const stats = useMemo(() => {
        const totalCapitalRaised = projects.reduce((sum, p) => sum + p.amountRaised, 0);
        const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'funded').length;
        
        // Estimate unique investors in the developer's projects
        const projectIds = new Set(projects.map(p => p.id));
        const investorIds = new Set();
        Object.values(portfolios).forEach(portfolio => {
            portfolio.tokens.forEach(token => {
                if (projectIds.has(token.projectId)) {
                    investorIds.add(token.originalOwnerId);
                }
            });
        });
        const totalInvestors = investorIds.size;

        const upcomingPayout = projects.reduce((sum, p) => {
            if (p.status === 'active' || p.status === 'funded') {
                return sum + (p.amountRaised * (p.apy / 100)) / 12;
            }
            return sum;
        }, 0);

        return { totalCapitalRaised, activeProjects, totalInvestors, upcomingPayout };
    }, [projects, portfolios]);

    const cryptoBalance = currentUser.wallet.usdt + currentUser.wallet.usdc;

    const liveProject = projects.find(p => p.status === 'active' && p.amountRaised < p.fundingGoal);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Capital Raised" value={formatCurrency(stats.totalCapitalRaised)} icon={<DollarSignIcon className="w-6 h-6" />} />
                <StatCard title="Active Projects" value={stats.activeProjects} icon={<ZapIcon className="w-6 h-6" />} />
                <StatCard title="Total Investors" value={stats.totalInvestors} icon={<UserIcon className="w-6 h-6" />} />
                <StatCard title="Next Month APY Payout" value={formatCurrency(stats.upcomingPayout)} icon={<TrendingUpIcon className="w-6 h-6" />} />
                <StatCard title="NGN Balance" value={formatNgnCurrency(currentUser.wallet.ngn)} icon={<WalletIcon className="w-6 h-6" />} />
                <StatCard title="Crypto Balance" value={formatCurrency(cryptoBalance)} icon={<WalletIcon className="w-6 h-6" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Projects Summary</h3>
                    <div className="space-y-4">
                        {projects.length > 0 ? projects.map(project => {
                            const progress = project.fundingGoal > 0 ? (project.amountRaised / project.fundingGoal) * 100 : 0;
                            return (
                                <div key={project.id} className="border-b pb-4 last:border-b-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-gray-800">{project.title}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                             project.status === 'active' ? 'bg-green-100 text-green-800' :
                                             project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                             project.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                                             'bg-gray-100 text-gray-800'
                                         }`}>{project.status.toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                                        <span>{formatCurrency(project.amountRaised)} / {formatCurrency(project.fundingGoal)}</span>
                                        <span>{progress.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            )
                        }) : <p className="text-gray-500">You have not created any projects yet.</p>}
                    </div>
                </div>
                <div className="space-y-8">
                    {liveProject ? <LiveFundingCard project={liveProject} /> : 
                        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center">
                            <div className="text-center">
                                 <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Fundraising</h3>
                                 <p className="text-gray-500">None of your projects are currently in an active funding round.</p>
                            </div>
                        </div>
                    }
                    <UpcomingApyCard projects={projects} />
                </div>
            </div>
        </div>
    );
};

const UpcomingApyCard = ({ projects }) => {
    const upcomingPayments = useMemo(() => {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const payments = projects
            .filter(p => (p.status === 'active' || p.status === 'funded'))
            .map(project => {
                const paymentDay = new Date(project.startDate).getUTCDate();
                let nextPaymentDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), paymentDay));

                // This loop ensures the nextPaymentDate is in the future.
                while (nextPaymentDate < today) {
                    nextPaymentDate.setUTCMonth(nextPaymentDate.getUTCMonth() + 1);
                }

                if (nextPaymentDate <= thirtyDaysFromNow) {
                    return {
                        projectId: project.id,
                        projectName: project.title,
                        dueDate: nextPaymentDate,
                        amount: (project.amountRaised * (project.apy / 100)) / 12,
                    };
                }
                return null;
            })
            .filter(Boolean);

        return payments.sort((a, b) => a.dueDate - b.dueDate);
    }, [projects]);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming APY Payments</h3>
             <div className="space-y-3">
                {upcomingPayments.length > 0 ? upcomingPayments.map(payment => (
                    <div key={payment.projectId} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                        <div>
                            <p className="font-semibold text-gray-800">{payment.projectName}</p>
                            <p className="text-sm text-gray-500">Due: {formatDate(payment.dueDate)}</p>
                        </div>
                        <p className="font-semibold text-indigo-600">{formatCurrency(payment.amount)}</p>
                    </div>
                )) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No APY payments due in the next 30 days.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const LiveFundingCard = ({ project }) => {
    const progress = (project.amountRaised / project.fundingGoal) * 100;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Live Funding Activity</h3>
            <p className="text-sm text-gray-500 mb-4">Now funding: <strong>{project.title}</strong></p>
            
            <div className="mb-4">
                 <div className="flex justify-between text-sm text-gray-600 font-medium mb-1">
                    <span>{formatCurrency(project.amountRaised)}</span>
                    <span>{formatCurrency(project.fundingGoal)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div className="bg-green-500 h-4 rounded-full text-center text-white text-xs font-bold flex items-center justify-center" style={{ width: `${progress}%` }}>
                       {progress > 10 && `${progress.toFixed(1)}%`}
                    </div>
                </div>
            </div>

            <div className="border-t pt-4 h-40 relative overflow-y-auto">
                <h4 className="font-semibold text-gray-700 mb-2 sticky top-0 bg-white pb-2">Recent Investments</h4>
                <div className="space-y-2">
                    <p className="text-sm text-gray-500 text-center py-4">Live activity feed is currently paused.</p>
                </div>
            </div>
        </div>
    );
}


const DeveloperMyProjects = ({ projects, onManageProject }) => {
    return (
         <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Projects</h2>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funding Goal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Raised</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {projects.map(project => (
                             <tr key={project.id}>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.title} ({project.tokenTicker})</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(project.fundingGoal)}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(project.amountRaised)}</td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                         project.status === 'active' ? 'bg-green-100 text-green-800' :
                                         project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                         project.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                                         'bg-gray-100 text-gray-800'
                                     }`}>
                                         {project.status}
                                     </span>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                     <button onClick={() => onManageProject(project.id)} className="text-indigo-600 hover:text-indigo-900">Manage</button>
                                 </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const DeveloperManageProject = ({ project, onBack }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const isFullyFunded = project.amountRaised >= project.fundingGoal;
    const monthlyApyCost = (project.amountRaised * (project.apy / 100)) / 12;
    const listingFee = project.amountRaised * 0.03;
    const netWithdrawal = project.amountRaised - listingFee;

    const handleWithdraw = () => {
        alert(`Initiating withdrawal...\n\nTotal Raised: ${formatCurrency(project.amountRaised)}\nPlatform Fee (3%): -${formatCurrency(listingFee)}\n\nNet Payout to Treasury: ${formatCurrency(netWithdrawal)}`);
        // In a real app, this would trigger a secure backend transaction.
    };

    return (
        <div>
             <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Projects
            </button>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{project.title} ({project.tokenTicker})</h2>
                        <p className="text-gray-500">{project.location}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Project APY</p>
                        <p className="text-2xl font-bold text-green-600">{project.apy}%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Raised" value={formatCurrency(project.amountRaised)} icon={<DollarSignIcon className="w-6 h-6" />} />
                <StatCard title="Funding Goal" value={formatCurrency(project.fundingGoal)} icon={<CheckCircleIcon className="w-6 h-6" />} />
                <StatCard title="Tokens Minted" value={`${project.amountRaised.toLocaleString()} / ${project.tokenSupply.toLocaleString()}`} icon={<BuildingIcon className="w-6 h-6" />} />
                <StatCard title="APY Wallet Balance" value={formatCurrency(project.projectWalletBalance)} icon={<WalletIcon className="w-6 h-6" />} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h3 className="text-xl font-bold text-gray-800 mb-6">Project Actions</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* APY Management */}
                    <div className="border p-6 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">APY Distribution</h4>
                        <p className="text-sm text-gray-600 mb-4">Fund the project wallet to pay monthly returns to your investors.</p>
                        <div className="text-sm mb-4">
                            <p><strong>Est. Monthly APY Cost:</strong> {formatCurrency(monthlyApyCost)}</p>
                            <p className="text-xs text-gray-500">Based on current amount raised.</p>
                        </div>
                        <div className="flex space-x-2">
                             <button onClick={() => setModalOpen(true)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium">
                                Deposit Funds
                            </button>
                            <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium">
                                Pay Monthly APY
                            </button>
                        </div>
                    </div>

                    {/* Capital Management */}
                    <div className="border p-6 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Capital Management</h4>
                        <p className="text-sm text-gray-600 mb-4">Once your project is fully funded, you can withdraw the raised capital to begin development.</p>
                        <div className="text-sm mb-4 bg-gray-50 p-3 rounded-md border">
                            <div className="flex justify-between"><span>Total Raised:</span> <strong>{formatCurrency(project.amountRaised)}</strong></div>
                            <div className="flex justify-between text-red-600"><span>Platform Fee (3%):</span> <strong>-{formatCurrency(listingFee)}</strong></div>
                            <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Net Payout:</span> <strong>{formatCurrency(netWithdrawal)}</strong></div>
                        </div>
                        <button 
                            disabled={!isFullyFunded}
                            onClick={handleWithdraw}
                            className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {isFullyFunded ? `Withdraw Funds to Treasury` : 'Funding Goal Not Met'}
                        </button>
                         {isFullyFunded && <p className="text-xs text-center mt-2 text-green-600">Congratulations! Your project is fully funded.</p>}
                    </div>
                 </div>
            </div>

             <WalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Deposit to ${project.title} (${project.tokenTicker}) Wallet`}>
                 <form className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Amount (USD)</label>
                        <input type="number" placeholder="e.g., 5000" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                    </div>
                     <p className="text-xs text-gray-500">You will be prompted to confirm the transaction from your connected wallet.</p>
                    <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Proceed to Deposit</button>
                </form>
             </WalletModal>

        </div>
    );
};

const DeveloperWallet = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState('Crypto');

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Operational Wallet</h2>
            <p className="text-sm text-gray-600 mb-6">This is your main wallet for funding project APY payments and managing company funds.</p>
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('Crypto')}
                        className={`${activeTab === 'Crypto' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Crypto Wallet
                    </button>
                    <button
                        onClick={() => setActiveTab('Fiat')}
                        className={`${activeTab === 'Fiat' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Fiat Wallet (NGN)
                    </button>
                </nav>
            </div>
            {activeTab === 'Crypto' ? <CryptoWallet wallet={currentUser.wallet} /> : <FiatWallet wallet={currentUser.wallet} />}
        </div>
    );
};

const DeveloperSettings = ({ currentUser }) => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <CompanyProfileSettings profile={currentUser.companyProfile} />
            <TwoFactorAuthSettings enabled={currentUser.twoFactorEnabled} />
            <TreasuryAddressSettings address={currentUser.treasuryAddress} />
        </div>
    );
};

const CompanyProfileSettings = ({ profile }) => {
    const [companyProfile, setCompanyProfile] = useState(profile);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCompanyProfile(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Company Profile</h3>
            <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input type="text" name="name" value={companyProfile.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                        <input type="text" name="regNumber" value={companyProfile.regNumber} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Company Address</label>
                    <input type="text" name="address" value={companyProfile.address} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input type="url" name="website" value={companyProfile.website} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                </div>
                <div className="flex justify-end pt-2">
                    <button type="submit" onClick={(e) => e.preventDefault()} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

const TwoFactorAuthSettings = ({ enabled }) => {
    const [isEnabled, setIsEnabled] = useState(enabled);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Two-Factor Authentication (2FA)</h3>
            <div className="flex items-center justify-between">
                <p className="text-gray-600">Protect your account with an extra layer of security.</p>
                <button 
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`${isEnabled ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out`}
                >
                    <span className={`${isEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}/>
                </button>
            </div>
             {isEnabled && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-md border border-indigo-200">
                    <p className="text-sm text-indigo-800">2FA is now enabled. You will be asked for a verification code on your next login.</p>
                </div>
            )}
        </div>
    );
};

const TreasuryAddressSettings = ({ address }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-400">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Treasury Payout Address</h3>
            <p className="text-sm text-gray-600 mb-4">This is the secure, verified address where funds from your completed projects will be sent. Changing it is a high-security action.</p>
            <div className="bg-gray-100 p-3 rounded-md font-mono text-gray-700 break-all text-sm">
                {address}
            </div>
            <div className="mt-4 flex items-start space-x-3">
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 text-sm font-medium">
                    Request Address Change
                </button>
                <p className="text-xs text-gray-500 flex-1">
                    To change this address, you must contact support. This is to protect your funds from unauthorized access.
                </p>
            </div>
        </div>
    );
};

const DeveloperCreateProject = () => {
    const [formData, setFormData] = useState({
        projectTitle: '',
        location: '',
        description: '',
        fundingGoal: '',
        apy: '',
        term: '',
        tokenSupply: '',
        tokenTicker: '',
    });
    const [impliedPrice, setImpliedPrice] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState('');

    useEffect(() => {
        const goal = parseFloat(String(formData.fundingGoal).replace(/,/g, ''));
        const supply = parseFloat(String(formData.tokenSupply).replace(/,/g, ''));
        if (goal > 0 && supply > 0) {
            setImpliedPrice(goal / supply);
        } else {
            setImpliedPrice(0);
        }
    }, [formData.fundingGoal, formData.tokenSupply]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'tokenTicker') {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase().slice(0, 3) }));
        } else if (name === 'fundingGoal' || name === 'tokenSupply') {
            const numericString = value.replace(/[^0-9]/g, ''); // Remove all non-digits
            if (numericString) {
                const formattedValue = parseInt(numericString, 10).toLocaleString('en-US');
                setFormData(prev => ({ ...prev, [name]: formattedValue }));
            } else {
                setFormData(prev => ({ ...prev, [name]: '' }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleGenerateDescription = async () => {
        setIsGenerating(true);
        setGenerationError('');
        try {
             const userPrompt = `Generate a compelling and professional real estate project description based on the following key details. The tone should be enticing to potential investors on a real estate crowdfunding platform.
            
            - Project Title: ${formData.projectTitle || 'Unnamed Project'}
            - Location: ${formData.location || 'Not specified'}
            - Funding Goal: $${formData.fundingGoal || '0'}
            - Target APY: ${formData.apy || 'Not specified'}%
            - Investment Term: ${formData.term || 'Not specified'} months

            Highlight the key selling points and investment potential. Keep it to one or two paragraphs.`;

            
            const generatedText = await callAIAPI({
    messages: [
        { role: 'system', content: "You are an AI assistant that helps with real estate due diligence and investment analysis." },
        { role: 'user', content: userPrompt }
    ]
});
            
            setFormData(prev => ({...prev, description: generatedText }));

        } catch (error) {
            setGenerationError('Failed to generate description. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const FileUploadComponent = ({ label, description }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <p className="text-xs text-gray-500 mb-2">{description}</p>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <FileUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                            <span>Upload files</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
            </div>
        </div>
    );

    const handleSubmitForReview = async (e) => {
        e.preventDefault();
        // In a real application, this function would send the formData 
        // to a secure backend API endpoint, like '/api/projects'.
        
        console.log("Submitting project data to backend:", formData);

        // --- BACKEND PROCESS (SIMULATED) ---
        // 1. The backend server receives the formData.
        // 2. It generates a unique file number, e.g., 'PROJ-YYYYMMDD-###'.
        const fileNumber = `PROJ-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        
        // 3. It saves the project to the database with 'status: "pending"'.
        
        // 4. It uses an email service (like SendGrid, AWS SES) to send a formatted email to the admin.
        // The email content would be generated using a template like the one in 'admin_email_template.md'.
        console.log(`Email notification prepared for admin with File #: ${fileNumber}`);
        
        // 5. The backend returns a success message to the frontend.
        alert(`Project submitted successfully!\nYour reference file number is ${fileNumber}.\nThe admin team has been notified.`);

        // Here, you might clear the form or redirect the user.
    };


    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Submit New Project</h2>
                <p className="text-sm text-gray-500 mb-8">Complete the form below to submit your project for review and funding.</p>
                 <form className="space-y-10">
                    {/* Section 1: Project Information */}
                    <fieldset className="border p-6 rounded-lg space-y-6">
                        <legend className="text-lg font-semibold text-gray-800 px-2 -ml-2">Project Information</legend>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Project Title</label>
                                <input type="text" name="projectTitle" value={formData.projectTitle} onChange={handleInputChange} placeholder="e.g., Victoria Island Luxury Apartments" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., Victoria Island, Lagos" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Description</label>
                             <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" placeholder="e.g., A stunning collection of 2 and 3-bedroom apartments with waterfront views..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea>
                             <div className="mt-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleGenerateDescription}
                                    disabled={isGenerating}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
                                >
                                    <SparklesIcon className="w-4 h-4 mr-2" />
                                    {isGenerating ? 'Generating...' : '✨ Generate with AI'}
                                </button>
                             </div>
                             {generationError && <p className="text-red-500 text-xs mt-1">{generationError}</p>}
                        </div>

                        <FileUploadComponent label="Property Pictures" description="Upload images that will be displayed on the properties tab after approval." />
                    </fieldset>

                    {/* Section 2: Financials & Tokenomics */}
                    <fieldset className="border p-6 rounded-lg space-y-6">
                        <legend className="text-lg font-semibold text-gray-800 px-2 -ml-2">Financials & Tokenomics</legend>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Funding Goal (USD)</label>
                                <input type="text" name="fundingGoal" value={formData.fundingGoal} onChange={handleInputChange} placeholder="e.g., 500,000" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Project Annual APY (%)</label>
                                <input type="number" name="apy" value={formData.apy} onChange={handleInputChange} step="0.1" placeholder="e.g., 17.5" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Term (Months)</label>
                                <input type="number" name="term" value={formData.term} onChange={handleInputChange} placeholder="e.g., 36" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Total Token Supply</label>
                                <input type="text" name="tokenSupply" value={formData.tokenSupply} onChange={handleInputChange} placeholder="e.g., 500,000" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Token Ticker</label>
                                <input type="text" name="tokenTicker" value={formData.tokenTicker} onChange={handleInputChange} placeholder="e.g., VLA" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Implied Price Per Token</label>
                                 <div className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(impliedPrice)}
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FileUploadComponent label="Project Proposal Document" description="Upload your detailed project proposal."/>
                            <FileUploadComponent label="Other Legal Documents" description="e.g., permits, land titles, etc."/>
                        </div>
                    </fieldset>

                     <div className="flex justify-end pt-4">
                        <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-3 hover:bg-gray-300">Cancel</button>
                        <button type="submit" onClick={handleSubmitForReview} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Submit for Review</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- ADMIN DASHBOARD --- //

const AdminDashboardOverview = ({ users, projects, onSelectProject }) => {
    const stats = useMemo(() => {
        const totalUsers = Object.keys(users).length;
        const investorCount = Object.values(users).filter(u => u.type === 'investor').length;
        const developerCount = Object.values(users).filter(u => u.type === 'developer').length;

        const totalProjects = projects.length;
        const pendingProjects = projects.filter(p => p.status === 'pending').length;
        const activeProjects = projects.filter(p => p.status === 'active').length;
        const fundedProjects = projects.filter(p => p.status === 'funded').length;
        const totalValueLocked = projects.reduce((sum, p) => sum + p.amountRaised, 0);

        // Fee Calculations
        const totalInvestments = Object.values(initialPortfolios)
            .flatMap(p => p.tokens)
            .filter(t => t.type === 'SECURITY')
            .reduce((sum, t) => sum + t.amount, 0);

        const developerFees = projects.reduce((sum, p) => sum + (p.amountRaised * 0.03), 0);
        const investorFees = totalInvestments * 0.015;
        const marketFees = initialMarketListings.reduce((sum, l) => sum + (l.price * 0.015), 0);
        const totalFeesCollected = developerFees + investorFees + marketFees;
        const treasuryBalance = totalFeesCollected + 50000; // Starting with a base balance

        return {
            totalUsers,
            investorCount,
            developerCount,
            totalProjects,
            pendingProjects,
            activeProjects,
            fundedProjects,
            totalValueLocked,
            developerFees,
            investorFees,
            marketFees,
            totalFeesCollected,
            treasuryBalance,
        };
    }, [users, projects]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Value Locked (TVL)" value={formatCurrency(stats.totalValueLocked)} icon={<DollarSignIcon className="w-6 h-6" />} />
                <StatCard title="Total Users" value={stats.totalUsers} icon={<UserIcon className="w-6 h-6" />} />
                <StatCard title="Total Projects" value={stats.totalProjects} icon={<BuildingIcon className="w-6 h-6" />} />
                <StatCard title="Pending Projects" value={stats.pendingProjects} icon={<ClockIcon className="w-6 h-6" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-1 space-y-8">
                    {/* User Breakdown */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">User Breakdown</h3>
                         <div className="space-y-4">
                            <div className="flex items-center">
                                <span className="flex-1 text-gray-700">Investors</span>
                                <span className="font-bold">{stats.investorCount}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="flex-1 text-gray-700">Developers</span>
                                <span className="font-bold">{stats.developerCount}</span>
                            </div>
                        </div>
                    </div>
                    {/* Project Status */}
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Project Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <span className="h-3 w-3 rounded-full bg-yellow-400 mr-3"></span>
                                <span className="flex-1 text-gray-700">Pending</span>
                                <span className="font-bold">{stats.pendingProjects}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="h-3 w-3 rounded-full bg-green-500 mr-3"></span>
                                <span className="flex-1 text-gray-700">Active</span>
                                <span className="font-bold">{stats.activeProjects}</span>
                            </div>
                             <div className="flex items-center">
                                <span className="h-3 w-3 rounded-full bg-blue-500 mr-3"></span>
                                <span className="flex-1 text-gray-700">Funded</span>
                                <span className="font-bold">{stats.fundedProjects}</span>
                            </div>
                        </div>
                    </div>
                 </div>

                <div className="lg:col-span-1">
                    <AdminTreasuryCard stats={stats} />
                </div>
                
                <div className="lg:col-span-1">
                    <AdminLiveFundingMonitor allProjects={projects} onSelectProject={onSelectProject} />
                </div>
            </div>
        </div>
    );
};

const AdminTreasuryCard = ({ stats }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Platform Treasury & Fees</h3>
            <div className="bg-indigo-50 p-4 rounded-lg text-center mb-4 border border-indigo-200">
                <p className="text-sm text-indigo-800 font-semibold">Current Treasury Balance</p>
                <p className="text-3xl font-bold text-indigo-900">{formatCurrency(stats.treasuryBalance)}</p>
            </div>
            <div>
                <h4 className="font-semibold text-gray-700 mb-2">Total Fees Collected Breakdown</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Developer Platform Fees (3%)</span>
                        <span className="font-medium text-gray-800">{formatCurrency(stats.developerFees)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Investor Investment Fees (1.5%)</span>
                        <span className="font-medium text-gray-800">{formatCurrency(stats.investorFees)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Secondary Market Fees (1.5%)</span>
                        <span className="font-medium text-gray-800">{formatCurrency(stats.marketFees)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2 font-bold p-2">
                        <span className="text-gray-900">Total Fees</span>
                        <span className="text-gray-900">{formatCurrency(stats.totalFeesCollected)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminLiveFundingMonitor = ({ allProjects, onSelectProject }) => {
    const activeFundingProjects = allProjects.filter(p => p.status === 'active' && p.amountRaised < p.fundingGoal);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Active Funding Monitor</h3>
                {activeFundingProjects.length > 0 && (
                    <span className="flex items-center ml-3 text-sm font-medium text-green-600">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 mr-2"></span>
                        Active
                    </span>
                )}
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeFundingProjects.length > 0 ? activeFundingProjects.map(project => {
                    const progress = project.fundingGoal > 0 ? (project.amountRaised / project.fundingGoal) * 100 : 0;
                    return (
                        <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <span className="font-semibold text-gray-800">{project.title}</span>
                                <span className="text-gray-500">{project.developerName}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-green-500 h-2.5 rounded-full"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                             <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{formatCurrency(project.amountRaised)}</span>
                                <span>{progress.toFixed(1)}%</span>
                            </div>
                        </div>
                    );
                }) : <p className="text-gray-500 text-center py-12">No projects are actively fundraising at the moment.</p>}
            </div>
        </div>
    );
}

const AdminCompliance = ({ users }) => {
    const pendingKycUsers = useMemo(() => {
        return Object.values(users).filter(user => user.kycStatus === 'Pending' || user.kycStatus === 'Not Submitted');
    }, [users]);
    
    const handleApprove = (userId) => {
        // In a real app, you'd call an API. Here we just log it.
        console.log(`Approving KYC for user ID: ${userId}`);
        alert(`KYC for user ${userId} approved.`);
        // onUpdateKyc(userId, 'Verified'); // This would update the state
    };
    
    const handleReject = (userId) => {
        console.log(`Rejecting KYC for user ID: ${userId}`);
        alert(`KYC for user ${userId} rejected.`);
         // onUpdateKyc(userId, 'Rejected'); // This would update the state
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">KYC/AML Compliance Queue</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pendingKycUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                         user.kycStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                     }`}>
                                         {user.kycStatus}
                                     </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                     <button onClick={() => alert('Viewing documents for ' + user.name)} className="text-indigo-600 hover:text-indigo-900 text-xs">View Docs</button>
                                     <button onClick={() => handleApprove(user.id)} className="bg-green-500 text-white px-3 py-1.5 rounded-md text-xs hover:bg-green-600">Approve</button>
                                     <button onClick={() => handleReject(user.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-md text-xs hover:bg-red-600">Reject</button>
                                </td>
                            </tr>
                        ))}
                        {pendingKycUsers.length === 0 && (
                            <tr><td colSpan="4" className="text-center py-8 text-gray-500">No users are pending KYC verification.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PlatformTreasuryAddressSettings = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-400">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Platform Treasury Address</h3>
            <p className="text-sm text-gray-600 mb-4">This is the central address where all platform fees are collected. Changing this is a critical, high-security action.</p>
            <div className="bg-gray-100 p-3 rounded-md font-mono text-gray-700 break-all text-sm">
                0xPLATFORM_TREASURY_ADDRESS_1234567890ABCDEF
            </div>
            <div className="mt-4 flex items-start space-x-3">
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 text-sm font-medium">
                    Request Address Change
                </button>
                <p className="text-xs text-gray-500 flex-1">
                    Changing the platform treasury address requires multi-signature approval and must be initiated through a secure internal process.
                </p>
            </div>
        </div>
    );
};

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        platformFee: 3.0,
        marketFee: 1.5,
        investmentFee: 1.5,
        newRegistrations: true,
        withdrawalLock: false,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleSave = (e) => {
        e.preventDefault();
        alert('Platform settings have been updated!');
        console.log('Saving settings:', settings);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Platform Fee & Control Settings</h2>
                <form className="space-y-6" onSubmit={handleSave}>
                    {/* Fees Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="platformFee" className="block text-sm font-medium text-gray-700">Developer Platform Fee (%)</label>
                            <input
                                type="number"
                                name="platformFee"
                                id="platformFee"
                                value={settings.platformFee}
                                onChange={handleInputChange}
                                step="0.1"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            />
                             <p className="mt-1 text-xs text-gray-500">Fee on capital raised by developers.</p>
                        </div>
                         <div>
                            <label htmlFor="marketFee" className="block text-sm font-medium text-gray-700">Secondary Market Fee (%)</label>
                            <input
                                type="number"
                                name="marketFee"
                                id="marketFee"
                                value={settings.marketFee}
                                onChange={handleInputChange}
                                step="0.1"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            />
                             <p className="mt-1 text-xs text-gray-500">Fee on successful secondary market trades.</p>
                        </div>
                        <div>
                            <label htmlFor="investmentFee" className="block text-sm font-medium text-gray-700">Investor Investment Fee (%)</label>
                             <input
                                type="number"
                                name="investmentFee"
                                id="investmentFee"
                                value={settings.investmentFee}
                                onChange={handleInputChange}
                                step="0.1"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            />
                             <p className="mt-1 text-xs text-gray-500">Fee on every new investment.</p>
                        </div>
                    </div>
                    
                    <hr/>

                    {/* Toggles Section */}
                    <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-800">Allow New User Registrations</h4>
                                <p className="text-sm text-gray-500">Disable this to temporarily halt new sign-ups.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setSettings(p => ({...p, newRegistrations: !p.newRegistrations}))}
                                className={`${settings.newRegistrations ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
                            >
                                <span className={`${settings.newRegistrations ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-800">Emergency Withdrawal Lock</h4>
                                <p className="text-sm text-gray-500">Temporarily disable all fund withdrawals from the platform.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setSettings(p => ({...p, withdrawalLock: !p.withdrawalLock}))}
                                className={`${settings.withdrawalLock ? 'bg-red-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
                            >
                                <span className={`${settings.withdrawalLock ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                         <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-indigo-700">
                            Save Settings
                         </button>
                    </div>
                </form>
            </div>
            {/* Security Settings */}
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Security Settings</h2>
                <div className="space-y-6">
                    <TwoFactorAuthSettings enabled={true} />
                    <PlatformTreasuryAddressSettings />
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = ({ currentUser, projects, users, onLogout, totalBalance, onUpdateProjectStatus }) => {
     const [activeItem, setActiveItem] = useState('Dashboard');

    const sidebarItems = [
        { name: 'Dashboard', icon: <EyeIcon className="h-5 w-5" /> },
        { name: 'Project Approvals', icon: <CheckCircleIcon className="h-5 w-5" /> },
        { name: 'User Management', icon: <UserIcon className="h-5 w-5" /> },
        { name: 'Compliance', icon: <ShieldCheckIcon className="h-5 w-5" /> },
        { name: 'Settings', icon: <SettingsIcon className="h-5 w-5" /> },
    ];
    
     const renderContent = () => {
        switch (activeItem) {
            case 'Dashboard': return <AdminDashboardOverview users={users} projects={projects} />;
            case 'Project Approvals': return <AdminProjectApprovals projects={projects} onUpdateProjectStatus={onUpdateProjectStatus} />;
            case 'User Management': return <AdminUserManagement users={users} />;
            case 'Compliance': return <AdminCompliance users={users} />;
            case 'Settings': return <AdminSettings />;
            default: return <AdminDashboardOverview users={users} projects={projects} />;
        }
    };
    
    return (
         <DashboardLayout currentUser={currentUser} sidebarItems={sidebarItems} activeItem={activeItem} setActiveItem={setActiveItem} onLogout={onLogout} totalBalance={totalBalance}>
            {renderContent()}
        </DashboardLayout>
    );
};

const AdminProjectApprovals = ({ projects, onUpdateProjectStatus }) => {
    const [viewingProject, setViewingProject] = useState(null);
    const [activeSubTab, setActiveSubTab] = useState('Pending');

    if (viewingProject) {
        return (
            <AdminProjectDetails 
                project={viewingProject}
                onUpdateProjectStatus={onUpdateProjectStatus}
                onBack={() => setViewingProject(null)}
            />
        );
    }
    
    const pendingProjects = projects.filter(p => p.status === 'pending');
    const approvedProjects = projects.filter(p => ['active', 'funded', 'completed'].includes(p.status));

    const renderPendingTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Developer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funding Goal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                     {pendingProjects.map(project => (
                         <tr key={project.id}>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.title} ({project.tokenTicker})</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.developerName}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(project.fundingGoal)}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                 <button onClick={() => setViewingProject(project)} className="text-indigo-600 hover:text-indigo-900">View Details</button>
                             </td>
                         </tr>
                    ))}
                    {pendingProjects.length === 0 && (
                         <tr><td colSpan="4" className="text-center py-8 text-gray-500">No projects are pending approval.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderApprovedTable = () => (
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Developer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funding Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                     {approvedProjects.map(project => (
                         <tr key={project.id}>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.title} ({project.tokenTicker})</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.developerName}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(project.amountRaised)} / {formatCurrency(project.fundingGoal)}</td>
                             <td className="px-6 py-4 whitespace-nowrap">
                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                     project.status === 'active' ? 'bg-green-100 text-green-800' :
                                     project.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                                     'bg-gray-100 text-gray-800'
                                 }`}>
                                     {project.status}
                                 </span>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                 <button onClick={() => setViewingProject(project)} className="text-indigo-600 hover:text-indigo-900">Monitor</button>
                             </td>
                         </tr>
                    ))}
                    {approvedProjects.length === 0 && (
                         <tr><td colSpan="4" className="text-center py-8 text-gray-500">No projects have been approved yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Project Approvals</h2>
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveSubTab('Pending')}
                        className={`${activeSubTab === 'Pending' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Pending Approvals
                        {pendingProjects.length > 0 && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{pendingProjects.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveSubTab('Approved')}
                        className={`${activeSubTab === 'Approved' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Approved Projects
                    </button>
                </nav>
            </div>

            {activeSubTab === 'Pending' ? renderPendingTable() : renderApprovedTable()}
        </div>
    );
};

const AdminProjectDetails = ({ project, onUpdateProjectStatus, onBack }) => {
    const [mainImage, setMainImage] = useState(project.images[0]);
    const [summary, setSummary] = useState({ text: '', isLoading: false, error: '' });

    const handleApprove = () => {
        onUpdateProjectStatus(project.id, 'active');
        onBack();
    };
    
    const handleReject = () => {
        onUpdateProjectStatus(project.id, 'rejected');
        onBack();
    };
    
    const generateSummary = async () => {
        setSummary({ text: '', isLoading: true, error: '' });
        try {
            const systemPrompt = `You are a meticulous financial analyst and due diligence officer for a real estate crowdfunding platform named Kayzera. Your task is to review a new project submission and provide a concise summary and a risk analysis for the admin. Use the provided data and grounded search results to inform your analysis. Structure your response with a "Project Summary" section and a "Potential Risks & Due Diligence Points" section with bullet points.`;
            
            const userPrompt = `Please analyze the following project submission:
            - Project Title: ${project.title}
            - Developer: ${project.developerName}
            - Location: ${project.location}
            - Description: ${project.description}
            - Funding Goal: ${formatCurrency(project.fundingGoal)}
            - Proposed APY: ${project.apy}%
            - Term: ${project.term} months
            - Token Supply: ${project.tokenSupply.toLocaleString()}
            
            Based on this information and any publicly available data about the location or developer, generate a summary and risk analysis.`;

             
            const responseText = await callAIAPI({
    messages: [
        { role: 'system', content: "You are an AI assistant that helps with real estate due diligence and investment analysis." },
        { role: 'user', content: userPrompt }
    ]
});
            setSummary({ text: responseText, isLoading: false, error: '' });
        } catch(e) {
            setSummary({ text: '', isLoading: false, error: 'Failed to generate summary. Please check the connection and try again.' });
        }
    };

    return (
        <div>
            <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Project Approvals
            </button>
            
            <div>
               <div className="border-b pb-4 mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">{project.title}</h2>
                        <p className="text-md text-gray-500">Submitted by: <span className="font-semibold">{project.developerName}</span></p>
                    </div>
                    <button
                        onClick={generateSummary}
                        disabled={summary.isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                         <SparklesIcon className="w-5 h-5 mr-2" />
                        {summary.isLoading ? 'Analyzing...' : '✨ Generate Approval Summary'}
                    </button>
                </div>
                
                { (summary.isLoading || summary.text || summary.error) && (
                    <div className="mb-8 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Analysis</h3>
                         {summary.isLoading && (
                             <div className="flex items-center space-x-2 text-gray-600">
                                 <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin"></div>
                                 <span>Generating analysis...</span>
                             </div>
                         )}
                         {summary.error && <p className="text-red-600">{summary.error}</p>}
                         {summary.text && <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: summary.text.replace(/\n/g, '<br />').replace(/\* \b/g, '&bull; ') }} />}
                    </div>
                )}


                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Visuals & Description */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Project Visuals</h3>
                        <img src={mainImage} alt="Main project view" className="w-full h-80 object-cover rounded-lg shadow-md mb-4"/>
                        <div className="flex space-x-2">
                            {project.images.map((img, index) => (
                                <img 
                                    key={index}
                                    src={img} 
                                    alt={`Thumbnail ${index + 1}`}
                                    className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 transition-all ${mainImage === img ? 'border-indigo-500' : 'border-transparent hover:border-gray-300'}`}
                                    onClick={() => setMainImage(img)}
                                />
                            ))}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Project Description</h3>
                        <p className="text-gray-600">{project.description}</p>
                    </div>

                    {/* Right Column: Financials & Documents */}
                    <div>
                        <div className="bg-gray-50 p-6 rounded-lg border">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Financial & Tokenomics Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Funding Goal:</span><span className="font-bold">{formatCurrency(project.fundingGoal)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Proposed APY:</span><span className="font-bold text-green-600">{project.apy}%</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Project Term:</span><span className="font-bold">{project.term} Months</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Token Supply:</span><span className="font-bold">{project.tokenSupply.toLocaleString()}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Token Ticker:</span><span className="font-bold font-mono bg-gray-200 px-2 py-0.5 rounded">{project.tokenTicker}</span></div>
                            </div>
                        </div>

                        <div className="mt-8">
                             <h3 className="text-xl font-semibold text-gray-800 mb-4">Submitted Documents</h3>
                             <div className="space-y-3">
                                 <a href="#" className="flex items-center p-3 bg-white border rounded-md hover:bg-gray-50 transition-colors">
                                    <PaperclipIcon className="w-5 h-5 mr-3 text-gray-500"/>
                                    <span className="font-medium text-indigo-600">Project_Proposal.pdf</span>
                                    <span className="ml-auto text-sm text-gray-500">Download</span>
                                 </a>
                                  <a href="#" className="flex items-center p-3 bg-white border rounded-md hover:bg-gray-50 transition-colors">
                                    <PaperclipIcon className="w-5 h-5 mr-3 text-gray-500"/>
                                    <span className="font-medium text-indigo-600">Legal_Documents_Archive.zip</span>
                                     <span className="ml-auto text-sm text-gray-500">Download</span>
                                 </a>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="border-t mt-8 pt-6 flex justify-end space-x-4">
                    {project.status === 'pending' ? (
                        <>
                            <button onClick={handleReject} className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors">
                                Reject Project
                            </button>
                            <button onClick={handleApprove} className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors">
                                Approve Project
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => alert('This action is not yet implemented.')} className="bg-yellow-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-yellow-600 transition-colors">Flag for Review</button>
                            <button onClick={() => alert('This action is not yet implemented.')} className="bg-gray-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-600 transition-colors">View Transactions</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminUserManagement = ({ users }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">User Management</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {Object.values(users).map(user => (
                             <tr key={user.id}>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.type}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                     <button className="text-indigo-600 hover:text-indigo-900">View Details</button>
                                 </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- NEW COMPANY PAGE & FOOTER --- //
const CompanyPage = ({ setPage }) => {
    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">About Kayzera</h1>
                     <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
                        Democratizing real estate investment in Nigeria.
                    </p>
                </div>
                <div className="max-w-5xl mx-auto space-y-20">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
                        <p className="text-lg text-gray-700 leading-8 max-w-4xl mx-auto">
                            Our mission is to empower Nigerians to build wealth through property ownership, while also providing a vital source of capital for the real estate sector, contributing to the nation's economic growth.
                        </p>
                    </div>
                     <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Vision</h2>
                        <p className="text-lg text-gray-700 leading-8 max-w-4xl mx-auto">
                            To be the leading and most trusted tokenized real estate crowdfunding platform in Africa, known for our innovation, integrity, and commitment to creating value for our stakeholders.
                        </p>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Team</h2>
                            <p className="text-lg text-gray-700 leading-8">
                                Our team is composed of seasoned professionals with deep expertise in blockchain technology, property development, and legal compliance, ensuring a secure, transparent, and efficient platform for all our users.
                            </p>
                        </div>
                        <div>
                             <img 
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000" 
                                alt="A diverse group of professionals working collaboratively" 
                                className="rounded-xl shadow-2xl w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Footer = ({ setPage, page }) => {
    const handleScrollTo = (id) => {
        if (page !== 'landing') {
            setPage('landing');
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }
    };
    return (
        <footer className="bg-gray-800 text-white">
            <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-12 lg:col-span-4">
                        <div className="space-y-4">
                            <a href="#" onClick={() => setPage('landing')} className="flex-shrink-0 flex items-center gap-2">
                                <KayzeraLogo className="h-12 w-auto" textColor="white" taglineColor="#9ca3af"/>
                            </a>
                            <p className="text-gray-400 text-base max-w-xs">Democratizing real estate for everyone by making it accessible, transparent, and liquid.</p>
                            <DownloadLogoButton />
                        </div>
                    </div>
                    <div className="md:col-span-4 lg:col-span-2">
                        <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Solutions</h3>
                        <ul className="mt-4 space-y-4">
                            <li><a href="#faq" onClick={(e) => { e.preventDefault(); handleScrollTo('faq'); }} className="text-base text-gray-400 hover:text-white">For Investors</a></li>
                            <li><a href="#faq" onClick={(e) => { e.preventDefault(); handleScrollTo('faq'); }} className="text-base text-gray-400 hover:text-white">For Developers</a></li>
                        </ul>
                    </div>
                    <div className="md:col-span-4 lg:col-span-2">
                        <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
                        <ul className="mt-4 space-y-4">
                            <li><a href="#" onClick={() => setPage('company')} className="text-base text-gray-400 hover:text-white">About</a></li>
                            <li><a href="#" className="text-base text-gray-400 hover:text-white">Blog</a></li>
                            <li><a href="#compliance" onClick={(e) => { e.preventDefault(); handleScrollTo('compliance'); }} className="text-base text-gray-400 hover:text-white">Compliance</a></li>
                        </ul>
                    </div>
                    <div className="md:col-span-4 lg:col-span-2">
                         <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
                         <ul className="mt-4 space-y-4">
                             <li><a href="#" className="text-base text-gray-400 hover:text-white">Privacy</a></li>
                             <li><a href="#" className="text-base text-gray-400 hover:text-white">Terms</a></li>
                         </ul>
                    </div>
                    <div className="md:col-span-12 lg:col-span-2">
                         <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Connect With Us</h3>
                         <div className="mt-4 flex space-x-6">
                            <a href="#" className="text-gray-400 hover:text-white">
                                <span className="sr-only">Twitter</span>
                                <TwitterIcon className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white">
                                <span className="sr-only">LinkedIn</span>
                                <LinkedinIcon className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white">
                                <span className="sr-only">Instagram</span>
                                <InstagramIcon className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-8 text-center">
                    <p className="text-base text-gray-500">&copy; 2025 Kayzera. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};


// --- MAIN APP COMPONENT --- //
export default function App() {
    // Web3 context
    const { isConnected, userAddress, web3Service } = useWeb3();
    
    // State management
    const [page, setPage] = useState('landing'); // landing, login, register, forgotPassword, investorDashboard, etc.
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState(initialUsers);
    const [projects, setProjects] = useState(initialProjects);
    const [portfolios, setPortfolios] = useState(initialPortfolios);
    const [marketListings, setMarketListings] = useState(initialMarketListings);

    const USD_NGN_RATE = 1500;

    useEffect(() => {
        // --- Favicon Logic ---
        const svgString = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="logoGradientFavicon" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color: #6366f1; stop-opacity: 1" /><stop offset="100%" style="stop-color: #4f46e5; stop-opacity: 1" /></linearGradient></defs><path d="M4 4H8V20H4V4Z" fill="url(#logoGradientFavicon)" /><path d="M9 11L16 4L20 8L13 15V20H9V11Z" fill="url(#logoGradientFavicon)" /></svg>`;
        const dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;

        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const pngUrl = canvas.toDataURL('image/png');

            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = pngUrl;
        };
        img.src = dataUrl;

        // --- Title Animation Logic ---
        const originalTitle = document.title;
        const titleText = "Powered by AI for Smarter Investing";
        const fullTitle = titleText + ' .:. ';
        let i = 0;
        const titleInterval = setInterval(() => {
            document.title = fullTitle.substring(i) + fullTitle.substring(0, i);
            i = (i + 1) % fullTitle.length;
        }, 300);

        // --- Cleanup ---
        return () => {
            clearInterval(titleInterval);
            document.title = originalTitle; // Restore original title on unmount
        };
    }, []);

    // Effect to handle invalid user type safely without causing render loops
    useEffect(() => {
        if (currentUser && !['investor', 'developer', 'admin'].includes(currentUser.type)) {
            console.error("Unknown user type detected, logging out:", currentUser.type);
            setCurrentUser(null);
            setPage('login');
        }
    }, [currentUser]);

    const totalBalance = useMemo(() => {
        if (!currentUser || !currentUser.wallet) {
            return 0;
        }

        // 1. Portfolio Value for Investors
        let portfolioValue = 0;
        if (currentUser.type === 'investor') {
            const userPortfolio = portfolios[currentUser.id] || { tokens: [] };
            portfolioValue = userPortfolio.tokens
                .filter(t => t.type === 'SECURITY')
                .reduce((sum, token) => sum + token.amount, 0);
        }

        // 2. Wallet Value (Crypto + Fiat)
        const { ngn, usdt, usdc } = currentUser.wallet;
        const ngnInUsd = ngn / USD_NGN_RATE;
        const walletValue = usdt + usdc + ngnInUsd;

        return portfolioValue + walletValue;
    }, [currentUser, portfolios]);


    const handleLogout = () => {
        setCurrentUser(null);
        setPage('landing');
    };

    const handleUpdateProjectStatus = (projectId, newStatus) => {
        setProjects(prevProjects =>
            prevProjects.map(p =>
                p.id === projectId ? { ...p, status: newStatus } : p
            )
        );
        alert(`Project ID ${projectId} has been updated to "${newStatus}".`);
    };

    const handleClaimApy = (tokenId, userId) => {
        setPortfolios(prevPortfolios => {
            const newPortfolios = JSON.parse(JSON.stringify(prevPortfolios));
            const userPortfolio = newPortfolios[userId];
            if (!userPortfolio) return prevPortfolios;

            const token = userPortfolio.tokens.find(t => t.tokenId === tokenId);
            if (!token) return prevPortfolios;

            const project = projects.find(p => p.id === token.projectId);
            if (!project) return prevPortfolios;

            const monthlyApyAmount = (token.amount * (project.apy / 100)) / 12;

            // Update user's wallet
            const userToUpdate = users[currentUser.email];
            if (userToUpdate) {
                setUsers(prevUsers => {
    const userToUpdate = prevUsers[currentUser.email];
    if (!userToUpdate) return prevUsers;

    const updatedUser = {
        ...userToUpdate,
        wallet: {
            ...userToUpdate.wallet,
            usdt: (userToUpdate.wallet?.usdt || 0) + monthlyApyAmount
        }
    };

    return { ...prevUsers, [currentUser.email]: updatedUser };
});
            }
            
            // Update token's last claim date
            token.lastApyClaimDate = new Date().toISOString();
            
            alert(`Successfully claimed ${formatCurrency(monthlyApyAmount)} APY!`);

            return newPortfolios;
        });
    };

    const handleListToken = (listingDetails) => {
        setMarketListings(prevListings => {
            const newListings = [...prevListings, {
                listingId: prevListings.length + 1,
                ...listingDetails
            }];
            return newListings;
        });

        // Optional: Update the token status in the user's portfolio to 'listed'
        // This part is more complex if they can list partial amounts.
        // For simplicity here, we can mark the whole token stack as listed.
        setPortfolios(prev => {
            const newPortfolios = JSON.parse(JSON.stringify(prev));
            const userPortfolio = newPortfolios[listingDetails.sellerId];
            const token = userPortfolio.tokens.find(t => t.tokenId === listingDetails.tokenId);
            if (token) {
                 // A simple implementation might mark the whole token as listed.
                 // A more complex one would split the token stack.
                 // Here we'll just log it for now and add a status.
                 token.status = 'listed'; 
                 alert('Your token has been successfully listed on the secondary market.');
            }
            return newPortfolios;
        });

    };
    
    const handleInvest = async (projectId, amount) => {
        if (currentUser && currentUser.type === 'developer') {
            alert("Developers are not permitted to invest in projects.");
            return;
        }

        if (currentUser.kycStatus !== 'Verified') {
            alert("Investment failed. You must complete KYC verification before investing.");
            return;
        }

        if (!amount || amount <= 0) {
            alert("Please enter a valid investment amount.");
            return;
        }

        if (!isConnected) {
            alert("Please connect your wallet to make an investment.");
            return;
        }

        try {
            // Find the project to get its contract address
            const project = projects.find(p => p.id === projectId);
            if (!project || !project.contractAddress) {
                alert("Project contract address not found. Please try again.");
                return;
            }

            // Show loading state
            const loadingAlert = alert("Processing investment transaction...");

            // Call smart contract invest function
            const receipt = await web3Service.investInProject(project.contractAddress, amount);
            
            // Close loading alert
            if (loadingAlert) window.close();

            // Update local state to reflect the investment
            const fee = amount * 0.015;
            const totalDebit = amount + fee;
            const userWallet = users[currentUser.email].wallet;
            const totalStablecoin = userWallet.usdt + userWallet.usdc;

            if (totalStablecoin < totalDebit) {
                alert("Insufficient stablecoin balance (USDT/USDC) for this investment.");
                return;
            }

            let remainingDebit = totalDebit;
            let newUsdt = userWallet.usdt;
            let newUsdc = userWallet.usdc;

            if (newUsdt >= remainingDebit) {
                newUsdt -= remainingDebit;
                remainingDebit = 0;
            } else {
                remainingDebit -= newUsdt;
                newUsdt = 0;
            }

            if (remainingDebit > 0 && newUsdc >= remainingDebit) {
                newUsdc -= remainingDebit;
                remainingDebit = 0;
            }

            // Update user wallet
            const updatedUser = {
                ...users[currentUser.email],
                wallet: {
                    ...userWallet,
                    usdt: newUsdt,
                    usdc: newUsdc
                }
            };

            setCurrentUser(updatedUser);
            setUsers(prevUsers => ({
                ...prevUsers,
                [currentUser.email]: updatedUser
            }));

            // Update project's amount raised
            setProjects(prevProjects => prevProjects.map(p => 
                p.id === projectId 
                ? { ...p, amountRaised: p.amountRaised + amount, status: (p.amountRaised + amount) >= p.fundingGoal ? 'funded' : p.status } 
                : p
            ));

            // Create new tokens for the investor
            setPortfolios(prevPortfolios => {
                const newPortfolios = JSON.parse(JSON.stringify(prevPortfolios));
                const userPortfolio = newPortfolios[currentUser.id] || { tokens: [] };
                
                userPortfolio.tokens.push({
                    tokenId: `proj${projectId}-sec-${Date.now()}`,
                    projectId,
                    type: 'SECURITY',
                    amount,
                    originalOwnerId: currentUser.id,
                    lastApyClaimDate: new Date().toISOString(),
                });
                userPortfolio.tokens.push({
                    tokenId: `proj${projectId}-mkt-${Date.now()}`,
                    projectId,
                    type: 'MARKET',
                    amount,
                    ownerId: currentUser.id,
                    status: 'held',
                });
                newPortfolios[currentUser.id] = userPortfolio;
                return newPortfolios;
            });

            alert(`Investment successful! Transaction hash: ${receipt.transactionHash}`);
        } catch (error) {
            console.error('Investment failed:', error);
            alert(`Investment failed: ${error.message}`);
        }
    };

    const renderPage = () => {
        if (currentUser) {
            switch (currentUser.type) {
                case 'investor': return <InvestorDashboard currentUser={currentUser} projects={projects} portfolios={portfolios} marketListings={marketListings} onLogout={handleLogout} onClaimApy={handleClaimApy} onListToken={handleListToken} onInvest={handleInvest} totalBalance={totalBalance} />;
                case 'developer': return <DeveloperDashboard currentUser={currentUser} projects={projects} portfolios={portfolios} marketListings={marketListings} onLogout={handleLogout} totalBalance={totalBalance} />;
                case 'admin': return <AdminDashboard currentUser={currentUser} projects={projects} users={users} onLogout={handleLogout} totalBalance={totalBalance} onUpdateProjectStatus={handleUpdateProjectStatus} />;
                default:
                    // The useEffect above will handle logging out the user.
                    // Return null or a loading spinner to avoid rendering with an invalid user state.
                    return null;
            }
        }

        switch (page) {
            case 'login': return <LoginPage setPage={setPage} setCurrentUser={setCurrentUser} users={users} />;
            case 'register': return <RegisterPage setPage={setPage} />;
            case 'forgotPassword': return <ForgotPasswordPage setPage={setPage} />;
            case 'company': return <CompanyPage setPage={setPage} />;
            case 'landing':
            default:
                return <LandingPage setPage={setPage} projects={projects} />;
        }
    };
    
    // Determine if the header should be shown. Auth pages have their own minimal UI.
    const showHeader = !['login', 'register', 'forgotPassword'].includes(page) && !currentUser;
    const showFooter = ['landing', 'company'].includes(page) && !currentUser;

    return (
        <div className="font-sans antialiased text-gray-800 flex flex-col min-h-screen">
            {showHeader && <Header page={page} currentUser={currentUser} setPage={setPage} setCurrentUser={setCurrentUser} />}
            <main className="flex-1 flex flex-col">
                {renderPage()}
            </main>
            {showFooter && <Footer setPage={setPage} page={page} />}
        </div>
    );
}




































































