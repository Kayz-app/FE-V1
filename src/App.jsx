     

    import React, { useState, useEffect, useMemo, useRef } from 'react';

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
    isSuspended: false,
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
    isSuspended: false,
  },
  'admin@demo.com': { id: 3, type: 'admin', name: 'Admin Grace Hopper', email: 'admin@demo.com', password: 'password123', wallet: { ngn: 0, usdt: 0, usdc: 0 }, isSuspended: false },
  'buyer@demo.com': { 
    id: 4, 
    type: 'investor', 
    name: 'Bayo Adekunle', 
    email: 'buyer@demo.com', 
    password: 'password123', 
    wallet: { ngn: 2500000, usdt: 2000, usdc: 1500 },
    kycStatus: 'Verified',
    twoFactorEnabled: false,
    isSuspended: false,
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
    startDate: '2022-03-01T00:00:00Z', // MODIFIED: Set date to the past so term has ended
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


// --- MOCKED AI API INTEGRATION --- //
// In a real application, this function would make a secure call to a backend endpoint.
// Since this is a self-contained frontend prototype, we are mocking the AI response
// to prevent network errors and demonstrate the AI-powered features.
const getMockAIResponse = (promptText) => {
    const lowercasedPrompt = promptText.toLowerCase();

    if (lowercasedPrompt.includes('generate a compelling and professional real estate project description')) {
        return `This premier residential complex represents a unique investment opportunity in one of the city's most prestigious neighborhoods. Featuring state-of-the-art amenities and breathtaking views, the development is meticulously designed for modern living. It promises not only a high rental yield but also significant capital appreciation, making it a cornerstone asset for any forward-thinking investor's portfolio.`;
    }
    
    if (lowercasedPrompt.includes('financial analyst') && lowercasedPrompt.includes('risk analysis')) {
        return `### Project Summary

The project is well-positioned within a high-growth corridor, tapping into the consistent demand for premium residential and commercial spaces. The developer's strong track record and the project's solid financial modeling suggest a favorable risk-reward profile. The proposed APY is competitive and sustainable based on market comparables.

### Potential Risks & Due Diligence Points
- **Execution Risk:** As with any large-scale construction, there is a risk of timeline or budget overruns. Reviewing the developer's history with similar projects is advised.
- **Market Saturation:** A comprehensive analysis of the local market's absorption rate for new properties should be conducted to ensure demand remains high.
- **Economic Headwinds:** A broader economic downturn could affect property values and rental income. This risk is partially mitigated by the project's premium positioning.`;
    }
    
    if (lowercasedPrompt.includes('investment potential')) {
        return `The investment potential is significant, driven by three key factors: the strategic location in a rapidly developing area, the high quality of the build which commands premium rental and resale values, and the attractive APY which provides steady cash flow. While all investments carry risk, this project is structured to maximize returns.`;
    }

    if (lowercasedPrompt.includes('location') || lowercasedPrompt.includes('area')) {
         return `The property is located in a prime, high-demand area known for its excellent connectivity, social amenities, and security. This makes it highly attractive to potential tenants and buyers, which is a strong factor in its long-term value.`;
    }

    // Default chat response
    return "I can certainly help with that. Based on the provided project documents, the key strengths are its strategic location and the developer's established reputation. The financial projections indicate a solid return on investment. What specific aspect would you like to know more about?";
};

const callAIAPI = async (input, options = {}) => {
    console.log("--- Mock AI API Call Triggered ---");
    
    // Extract the main user prompt text regardless of input format
    let userPromptText = '';
    if (typeof input === "string") {
        userPromptText = input;
    } else if (input && Array.isArray(input.messages)) {
        // Find the user message, or join all messages as a fallback
        const userMessage = input.messages.find(m => m.role === 'user');
        userPromptText = userMessage ? userMessage.content : input.messages.map(m => m.content).join('\n');
    } else {
        // Fallback for unexpected formats
        userPromptText = JSON.stringify(input);
    }
    
    console.log("User Prompt:", userPromptText);

    return new Promise((resolve) => {
        // Simulate network latency for a more realistic feel
        setTimeout(() => {
            const mockResponse = getMockAIResponse(userPromptText);
            console.log("Generated Mock Response:", mockResponse);
            resolve(mockResponse);
        }, 1200 + Math.random() * 800); // 1.2s to 2s delay
    });
};




// --- SVG ICONS AS REACT COMPONENTS --- //
const KayzeraLogo = ({ textColor = "#1f2937", taglineColor = "#6b7280", uniqueId = "1", ...props }) => (
  <svg {...props} viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`logoGradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#6366f1', stopOpacity: 1}} />
        <stop offset="100%" style={{stopColor: '#4f46e5', stopOpacity: 1}} />
      </linearGradient>
    </defs>
    <g transform="translate(0, -1.5) scale(1, 1.375)">
        <path d="M4 4H8V20H4V4Z" fill={`url(#logoGradient-${uniqueId})`} />
        <path d="M9 11L16 4L20 8L13 15V20H9V11Z" fill={`url(#logoGradient-${uniqueId})`} />
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
                           <KayzeraLogo className="h-12 w-auto" uniqueId="header" />
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
                    <KayzeraLogo className="h-12 w-auto" uniqueId="auth"/>
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
            if (user.isSuspended) {
                setError('This account has been suspended.');
                return;
            }
            setCurrentUser(user);
            let dashboardPage;
            switch (user.type) {
                case 'investor': dashboardPage = 'investorDashboard'; break;
                case 'developer': dashboardPage = 'developerDashboard'; break;
                case 'admin': dashboardPage = 'adminDashboard'; break;
                default: dashboardPage = 'landing';
            }
            setPage(dashboardPage);
            
            if (dashboardPage.includes('Dashboard')) {
                localStorage.setItem('kayzeraUser', JSON.stringify({ email: user.email, page: dashboardPage }));
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

const RegisterPage = ({ setPage, onRegister, users }) => {
    const [accountType, setAccountType] = useState('investor');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!fullName || !email || !password || !confirmPassword) {
            setError('All fields are required.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (users[email]) {
            setError('An account with this email already exists.');
            return;
        }

        // Create new user object
        const newUser = {
            id: Object.keys(users).length + 1,
            type: accountType,
            name: fullName,
            email: email,
            password: password, // In a real app, this should be hashed on the backend
            wallet: { ngn: 0, usdt: 0, usdc: 0 },
            kycStatus: 'Not Submitted',
            twoFactorEnabled: false,
        };

        if (accountType === 'developer') {
            newUser.companyProfile = {
                name: '',
                regNumber: '',
                address: '',
                website: '',
            };
            newUser.treasuryAddress = '';
        }

        onRegister(newUser);
        alert('Registration successful! Please log in to continue.');
        setPage('login');
    };

    return (
        <AuthPage title="Create a new account" setPage={setPage}>
             <form className="space-y-6" onSubmit={handleRegister}>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
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
        const isDemoUser = ['investor@demo.com', 'developer@demo.com', 'admin@demo.com', 'buyer@demo.com'].includes(currentUser.email);

        if (!isDemoUser) {
            setNotifications([{ id: 1, text: 'Welcome to Kayzera! Complete your profile to start investing.', read: false, time: 'Just now' }]);
            return;
        }

        // Tailor notifications based on user type for demo accounts
        if (currentUser.type === 'admin') {
            setNotifications([
                { id: 1, text: 'New project "Ikeja Tech Hub" submitted for approval.', read: false, time: '5m ago' },
                { id: 2, text: 'User Bayo Adekunle has submitted KYC documents.', read: false, time: '1h ago' },
                { id: 3, text: 'Eko Atlantic Tower has reached 50% funding.', read: true, time: '4h ago' },
                { id: 4, text: 'New developer account created: Babbage Constructions Ltd.', read: true, time: '1d ago' },
                { id: 5, text: 'Large withdrawal request ($25,000) initiated by Ada Lovelace.', read: true, time: '2d ago' },
            ]);
        } else { // Default for investor/developer demo users
            setNotifications([
                { id: 1, text: 'Your KYC has been approved.', read: false, time: '2h ago' },
                { id: 2, text: 'Lekki Pearl Residence is now fully funded!', read: false, time: '1d ago' },
                { id: 3, text: 'Welcome to Kayzera! Complete your profile to start investing.', read: true, time: '3d ago' },
            ]);
        }
    }, [currentUser.email, currentUser.type]);


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

    const SidebarContent = ({ uniqueId }) => (
        <div className="flex-grow">
            <div className="p-6">
                 <div className="flex items-center gap-2">
                    <KayzeraLogo className="h-10 w-auto" uniqueId={uniqueId}/>
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
                    <SidebarContent uniqueId="desktop-sidebar"/>
                </aside>

                {/* Mobile Sidebar */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
                )}
                <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-30 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
                     <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-1">
                        <XIcon className="h-6 w-6" />
                    </button>
                    <SidebarContent uniqueId="mobile-sidebar"/>
                </aside>


                {/* Main Content */}
                <main className="flex-1 flex flex-col h-screen">
                     <div className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10 border-b">
                        <div className="flex items-center">
                             <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden mr-2 p-2 rounded-full text-gray-500 hover:text-indigo-600">
                                <MenuIcon className="h-6 w-6"/>
                            </button>
                            <div className="md:hidden">
                                <KayzeraLogo className="h-8 w-auto" uniqueId="mobile-header" />
                            </div>
                            <h1 className="hidden md:block text-2xl font-bold text-gray-800">{activeItem}</h1>
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
                            
                            {/* Mobile Total Balance Display */}
                            <div className="sm:hidden">
                                {currentUser.wallet && (
                                    <div className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1.5 rounded-full">
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
                <nav className="-mb-px flex flex-wrap space-x-2 sm:space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('FAQ')}
                        className={`${activeTab === 'FAQ' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
                    >
                        FAQ
                    </button>
                    <button
                        onClick={() => setActiveTab('Live Support')}
                        className={`${activeTab === 'Live Support' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
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
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [pathLength, setPathLength] = useState(0);
    const [isAnimated, setIsAnimated] = useState(false);
    const svgRef = useRef(null);
    const pathRef = useRef(null);

    const width = 500;
    const height = 250;
    const padding = { top: 20, right: 30, bottom: 40, left: 50 };

    useEffect(() => {
        if (pathRef.current) {
            const length = pathRef.current.getTotalLength();
            setPathLength(length);
            // Trigger animation after a short delay
            setTimeout(() => {
                setIsAnimated(true);
            }, 100);
        }
    }, [data]);


    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No performance data available.</div>;
    }

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = 0; // Start y-axis from 0 for better perspective
    
    const xScale = (index) => padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
    const yScale = (value) => {
        const valueRange = maxValue - minValue;
        if (valueRange === 0) return (height - padding.top - padding.bottom) / 2 + padding.top;
        return height - padding.bottom - ((value - minValue) / valueRange) * (height - padding.top - padding.bottom);
    };
    
    const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`).join(' ');
    const areaPath = `${path} L ${xScale(data.length - 1)} ${height - padding.bottom} L ${xScale(0)} ${height - padding.bottom} Z`;

    const yAxisLabels = () => {
        const labels = [];
        const steps = 4;
        const range = maxValue - minValue;
        if (range === 0) return null;

        for (let i = 0; i <= steps; i++) {
            const value = minValue + (i / steps) * range;
            labels.push(
                <g key={i}>
                    <text x={padding.left - 10} y={yScale(value)} dy="0.35em" style={{ fontSize: '10px', fill: 'currentColor', textAnchor: 'end' }} className="text-gray-500">
                        ${(value / 1000).toFixed(0)}k
                    </text>
                     <line x1={padding.left} y1={yScale(value)} x2={width-padding.right} y2={yScale(value)} className="stroke-current text-gray-200" strokeDasharray="2,2"/>
                </g>
            );
        }
        return labels;
    };
    
    const handleMouseEnter = (pointData, index) => {
        setHoveredPoint({ ...pointData, index });
    };

    const handleMouseLeave = () => {
        setHoveredPoint(null);
    };

    return (
        <div className="w-full h-full relative">
            <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" onMouseLeave={handleMouseLeave}>
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
                    </linearGradient>
                </defs>
                
                {yAxisLabels()}

                {data.map((d, i) => (
                    <text key={i} x={xScale(i)} y={height - padding.bottom + 20} style={{ fontSize: '10px', fill: 'currentColor', textAnchor: 'middle' }} className="text-gray-500">
                        {d.month}
                    </text>
                ))}

                <path 
                    d={areaPath} 
                    fill="url(#areaGradient)" 
                    className="transition-opacity duration-1000"
                    style={{ opacity: isAnimated ? 1 : 0 }}
                />
                <path 
                    ref={pathRef}
                    d={path} 
                    fill="none" 
                    stroke="#4f46e5" 
                    strokeWidth="2" 
                    strokeDasharray={pathLength}
                    strokeDashoffset={isAnimated ? 0 : pathLength}
                    style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                />

                {/* Interaction layer */}
                {isAnimated && data.map((d, i) => (
                    <g key={`interactive-${i}`} className="opacity-0 hover:opacity-100 transition-opacity">
                        <circle cx={xScale(i)} cy={yScale(d.value)} r="10" fill="transparent" onMouseEnter={() => handleMouseEnter(d, i)}/>
                    </g>
                ))}

                {/* Hover effects */}
                {hoveredPoint && (
                    <g className="pointer-events-none">
                        <line 
                            x1={xScale(hoveredPoint.index)} 
                            y1={yScale(hoveredPoint.value)} 
                            x2={xScale(hoveredPoint.index)} 
                            y2={height - padding.bottom} 
                            stroke="#4f46e5" 
                            strokeWidth="1" 
                            strokeDasharray="3,3" 
                        />
                        <circle 
                            cx={xScale(hoveredPoint.index)} 
                            cy={yScale(hoveredPoint.value)} 
                            r="6" 
                            fill="#4f46e5" 
                            stroke="#fff" 
                            strokeWidth="2"
                            className="transition-transform duration-200"
                        />
                    </g>
                )}
            </svg>
            {hoveredPoint && svgRef.current && (
                <div 
                    className="absolute bg-gray-800 text-white text-xs rounded-md p-2 shadow-lg pointer-events-none transition-all duration-200 opacity-100"
                    style={{
                        top: yScale(hoveredPoint.value) * (svgRef.current.clientHeight / height) - 40,
                        left: xScale(hoveredPoint.index) * (svgRef.current.clientWidth / width),
                        transform: 'translateX(-50%)',
                    }}
                >
                    <p className="font-bold">{hoveredPoint.month}</p>
                    <p>{formatCurrency(hoveredPoint.value)}</p>
                </div>
            )}
        </div>
    );
};

const AssetAllocationChart = ({ data }) => {
    const [hoveredSegment, setHoveredSegment] = useState(null);
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        // Trigger animation after component mounts
        const timer = setTimeout(() => setIsAnimated(true), 100);
        return () => clearTimeout(timer);
    }, [data]);

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
                        stroke="#e5e7eb" // Background ring
                        strokeWidth={strokeWidth}
                    />
                    {data.map((item, index) => {
                        const isHovered = hoveredSegment && hoveredSegment.name === item.name;
                        const currentStrokeWidth = isHovered ? strokeWidth + 5 : strokeWidth;
                        const currentRadius = (size - currentStrokeWidth) / 2;
                        const currentCircumference = 2 * Math.PI * currentRadius;

                        const percent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                        const dash = (percent / 100) * currentCircumference;
                        const offset = (cumulativePercent / 100) * currentCircumference;
                        cumulativePercent += percent;

                        return (
                            <circle
                                key={index}
                                cx={size / 2}
                                cy={size / 2}
                                r={currentRadius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth={currentStrokeWidth}
                                strokeDashoffset={isAnimated ? -offset : currentCircumference}
                                style={{
                                    strokeDasharray: `${dash} ${currentCircumference - dash}`,
                                    transition: 'stroke-dashoffset 1s ease-out, stroke-width 0.2s, r 0.2s',
                                    transitionDelay: `${index * 150}ms`,
                                }}
                                onMouseEnter={() => setHoveredSegment(item)}
                                onMouseLeave={() => setHoveredSegment(null)}
                                className="cursor-pointer"
                            />
                        );
                    })}
                </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                    {hoveredSegment ? (
                        <>
                           <span className="text-sm text-gray-600 font-semibold truncate max-w-[120px]">{hoveredSegment.name}</span>
                           <span className="text-xl font-bold text-gray-800">{formatCurrency(hoveredSegment.value)}</span>
                           <span className="text-xs text-gray-500">{totalValue > 0 ? ((hoveredSegment.value / totalValue) * 100).toFixed(1) : 0}%</span>
                        </>
                    ) : (
                        <>
                            <span className="text-xs text-gray-500">Total Value</span>
                            <span className="text-xl font-bold text-gray-800">{formatCurrency(totalValue)}</span>
                        </>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
                {data.map((item, index) => (
                    <div 
                        key={index} 
                        className="flex items-center text-sm p-1 rounded-md transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredSegment(item)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        style={{ backgroundColor: hoveredSegment && hoveredSegment.name === item.name ? item.color + '20' : 'transparent' }}
                    >
                        <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-600 mr-2 truncate">{item.name}:</span>
                        <span className="font-semibold text-gray-800 ml-auto">{totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const InvestorDashboard = ({ currentUser, projects, portfolios, marketListings, onLogout, onClaimApy, onListToken, onInvest, onRedeemPrincipal, totalBalance, activities, onExchange, onBuyFromMarket }) => {
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
            case 'Dashboard': return <InvestorDashboardOverview currentUser={currentUser} projects={projects} portfolios={portfolios} activities={activities} />;
            case 'My Tokens': return <InvestorMyTokens currentUser={currentUser} projects={projects} portfolios={portfolios} onClaimApy={onClaimApy} onListToken={onListToken} onRedeemPrincipal={onRedeemPrincipal} />;
            case 'Marketplace': return <InvestorMarketplace currentUser={currentUser} marketListings={marketListings} projects={projects} onInvest={onInvest} onExchange={onExchange} onBuyFromMarket={onBuyFromMarket} />;
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

const InvestorDashboardOverview = ({ currentUser, projects, portfolios, activities }) => {
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
    
    const recentActivities = activities || [];

    const cryptoBalance = currentUser.wallet.usdt + currentUser.wallet.usdc;

    const performanceData = useMemo(() => {
        // Only show mock performance data for demo accounts.
        if (currentUser.email === 'investor@demo.com' || currentUser.email === 'buyer@demo.com') {
            return [
              { month: 'Apr', value: 13000 },
              { month: 'May', value: 14500 },
              { month: 'Jun', value: 14000 },
              { month: 'Jul', value: 15500 },
              { month: 'Aug', value: 17000 },
              { month: 'Sep', value: 17500 },
            ];
        }
        return [];
    }, [currentUser.email]);

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
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {recentActivities.length > 0 ? recentActivities.map(activity => {
                        const isDebit = activity.amount < 0;
                        const isFinancial = activity.amount !== 0 || (activity.amount === 0 && activity.type.includes('Investment')); // Investments can be 0 but still financial
                        return (
                            <div key={activity.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-full mr-4 ${
                                        isFinancial ? (isDebit ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600') : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {isFinancial ? (isDebit ? <ArrowUpRightIcon className="w-5 h-5" /> : <ArrowDownLeftIcon className="w-5 h-5" />) : <RepeatIcon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{activity.type}</p>
                                        <p className="text-sm text-gray-500">{activity.project || activity.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                     {isFinancial && <p className={`font-semibold ${isDebit ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(activity.amount)}</p>}
                                     <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="text-center text-gray-500 py-4">No recent activity to display.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const InvestorMyTokens = ({ currentUser, projects, portfolios, onClaimApy, onListToken, onRedeemPrincipal }) => {
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

    const groupedTokens = useMemo(() => {
        const groups = {};
        if (userPortfolio.tokens) {
            userPortfolio.tokens.forEach(token => {
                const project = projects.find(p => p.id === token.projectId);
                if (!project) return;

                if (!groups[token.projectId]) {
                    groups[token.projectId] = {
                        project: project,
                        securityToken: null,
                        marketToken: null,
                    };
                }
                if (token.type === 'SECURITY') {
                    groups[token.projectId].securityToken = token;
                } else if (token.type === 'MARKET') {
                    groups[token.projectId].marketToken = token;
                }
            });
        }
        return Object.values(groups);
    }, [userPortfolio.tokens, projects]);
    
    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Token Holdings</h2>
                {/* Desktop Table */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APY</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Security Tokens (Value)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Tokens (Status)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lockup Ends</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {groupedTokens.length > 0 ? groupedTokens.map(({ project, securityToken, marketToken }) => {
                                const startDate = new Date(project.startDate);
                                const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + project.term));
                                const isTermEnded = new Date() > endDate;
                                
                                let canClaimApy = false;
                                if (securityToken) {
                                    const lastClaimDate = new Date(securityToken.lastApyClaimDate);
                                    const now = new Date();
                                    if (endDate > now && (now.getFullYear() > lastClaimDate.getFullYear() || now.getMonth() > lastClaimDate.getMonth())) {
                                        canClaimApy = true;
                                    }
                                }
                                
                                return (
                                    <tr key={project.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{project.title}</div>
                                            <div className="text-xs text-gray-500">{project.tokenTicker}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{project.apy}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {securityToken ? (
                                                <>
                                                    <div>{securityToken.amount.toLocaleString()}</div>
                                                    <div className="text-xs text-gray-500">{formatCurrency(securityToken.amount)}</div>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {marketToken ? (
                                                <>
                                                    <div>{marketToken.amount.toLocaleString()}</div>
                                                    <div className="text-xs capitalize">{marketToken.status}</div>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {securityToken && <LockupTimer endDate={endDate} />}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {isTermEnded && securityToken ? (
                                                <button
                                                    onClick={() => onRedeemPrincipal(currentUser.id, project.id)}
                                                    disabled={currentUser.kycStatus !== 'Verified'}
                                                    className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed w-28 text-center"
                                                >
                                                    {currentUser.kycStatus !== 'Verified' ? 'Verify KYC' : 'Redeem Principal'}
                                                </button>
                                            ) : (
                                                <div className="flex flex-col space-y-2">
                                                    {securityToken && (
                                                        <button 
                                                            disabled={!canClaimApy || currentUser.kycStatus !== 'Verified'} 
                                                            onClick={() => onClaimApy(securityToken.tokenId, currentUser.id)}
                                                            className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium hover:bg-green-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed w-28 text-center"
                                                        >
                                                            {currentUser.kycStatus !== 'Verified' ? 'Verify KYC' : 'Claim APY'}
                                                        </button>
                                                    )}
                                                    {marketToken && (
                                                        <button 
                                                            onClick={() => handleOpenListModal(marketToken)}
                                                            className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-xs font-medium hover:bg-indigo-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed w-28 text-center"
                                                            disabled={marketToken.status === 'listed' || currentUser.kycStatus !== 'Verified'}
                                                        >
                                                            {currentUser.kycStatus !== 'Verified' ? 'Verify KYC' : marketToken.status === 'listed' ? 'Listed' : 'List for Sale'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">You do not own any tokens yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {groupedTokens.length > 0 ? groupedTokens.map(({ project, securityToken, marketToken }) => {
                        const startDate = new Date(project.startDate);
                        const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + project.term));
                        const isTermEnded = new Date() > endDate;
                        
                        let canClaimApy = false;
                        if (securityToken) {
                            const lastClaimDate = new Date(securityToken.lastApyClaimDate);
                            const now = new Date();
                            if (endDate > now && (now.getFullYear() > lastClaimDate.getFullYear() || now.getMonth() > lastClaimDate.getMonth())) {
                                canClaimApy = true;
                            }
                        }
                        
                        return (
                            <div key={project.id} className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex justify-between items-center mb-3 pb-3 border-b">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{project.title}</h3>
                                        <p className="text-xs text-gray-500">{project.tokenTicker} - {project.apy}% APY</p>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                        <span>Lockup Ends:</span>
                                        {securityToken && <LockupTimer endDate={endDate} />}
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {isTermEnded && securityToken ? (
                                       <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                                           <div className="flex justify-between items-center text-sm">
                                               <span className="font-semibold text-blue-800">Investment Complete</span>
                                               <div>
                                                   <p className="font-bold">{securityToken.amount.toLocaleString()}</p>
                                                   <p className="text-xs text-right text-gray-500">{formatCurrency(securityToken.amount)}</p>
                                               </div>
                                           </div>
                                           <button 
                                               onClick={() => onRedeemPrincipal(currentUser.id, project.id)}
                                               disabled={currentUser.kycStatus !== 'Verified'}
                                               className="mt-2 w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                           >
                                               {currentUser.kycStatus !== 'Verified' ? 'Verify KYC' : 'Redeem Principal'}
                                           </button>
                                       </div>
                                    ) : (
                                        <>
                                            {securityToken && (
                                                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="font-semibold text-green-800">Security Tokens (APY)</span>
                                                        <div>
                                                            <p className="font-bold">{securityToken.amount.toLocaleString()}</p>
                                                            <p className="text-xs text-right text-gray-500">{formatCurrency(securityToken.amount)}</p>
                                                        </div>
                                                    </div>
                                                     <button 
                                                        disabled={!canClaimApy || currentUser.kycStatus !== 'Verified'} 
                                                        onClick={() => onClaimApy(securityToken.tokenId, currentUser.id)}
                                                        className="mt-2 w-full text-center text-green-800 bg-green-100 border border-green-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                                    >
                                                        {currentUser.kycStatus !== 'Verified' ? 'Verify KYC' : 'Claim APY'}
                                                    </button>
                                                </div>
                                            )}
                                            {marketToken && (
                                                <div className="p-3 bg-indigo-50 rounded-md border border-indigo-200">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="font-semibold text-indigo-800">Market Tokens</span>
                                                        <div>
                                                            <p className="font-bold">{marketToken.amount.toLocaleString()}</p>
                                                            <p className="text-xs text-right capitalize text-gray-500">{marketToken.status}</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleOpenListModal(marketToken)}
                                                        className="mt-2 w-full text-center text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100"
                                                        disabled={marketToken.status === 'listed' || currentUser.kycStatus !== 'Verified'}
                                                    >
                                                        {currentUser.kycStatus !== 'Verified' ? 'Verify KYC' : marketToken.status === 'listed' ? 'Listed' : 'List for Sale'}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="text-center py-8 text-gray-500">You do not own any tokens yet.</p>
                    )}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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


const InvestorMarketplace = ({ currentUser, marketListings, projects, onInvest, onExchange, onBuyFromMarket }) => {
    const [activeTab, setActiveTab] = useState('Properties');
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [listingToBuy, setListingToBuy] = useState(null);

    const handleOpenBuyModal = (listing) => {
        setListingToBuy(listing);
        setBuyModalOpen(true);
    };

    const handleCloseBuyModal = () => {
        setListingToBuy(null);
        setBuyModalOpen(false);
    };

    const handleConfirmBuy = (listingId, amount) => {
        onBuyFromMarket(listingId, amount);
        handleCloseBuyModal();
    };
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'Secondary Market':
                return <SecondaryMarket currentUser={currentUser} marketListings={marketListings} projects={projects} onOpenBuyModal={handleOpenBuyModal} />;
            case 'Properties':
                return <PropertiesMarket projects={projects} currentUser={currentUser} onInvest={onInvest} />;
            case 'Currency Exchange':
                return <CurrencyExchange currentUser={currentUser} onExchange={onExchange} />;
            default:
                return null;
        }
    };

    const selectedProjectForModal = listingToBuy ? projects.find(p => p.id === listingToBuy.projectId) : null;

    return (
        <div>
             <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex flex-wrap space-x-2 sm:space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('Properties')}
                        className={`${activeTab === 'Properties' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
                    >
                        Properties
                    </button>
                    <button
                        onClick={() => setActiveTab('Secondary Market')}
                        className={`${activeTab === 'Secondary Market' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
                    >
                        Secondary Market
                    </button>
                    <button
                        onClick={() => setActiveTab('Currency Exchange')}
                        className={`${activeTab === 'Currency Exchange' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
                    >
                        Currency Exchange
                    </button>
                </nav>
            </div>
            {renderTabContent()}
            {buyModalOpen && listingToBuy && selectedProjectForModal && (
                <BuyTokenModal
                    isOpen={buyModalOpen}
                    onClose={handleCloseBuyModal}
                    listing={listingToBuy}
                    project={selectedProjectForModal}
                    currentUser={currentUser}
                    onConfirmBuy={handleConfirmBuy}
                />
            )}
        </div>
    );
};

const InvestorWallet = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState('Crypto');

    const walletData = currentUser.wallet;

    if (!walletData) {
         return (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto text-center">
                 <p className="text-gray-600">No wallet data available.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Wallet</h2>
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex flex-wrap space-x-2 sm:space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('Crypto')}
                        className={`${activeTab === 'Crypto' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
                    >
                        Crypto Wallet
                    </button>
                    <button
                        onClick={() => setActiveTab('Fiat')}
                        className={`${activeTab === 'Fiat' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
                    >
                        Fiat Wallet (NGN)
                    </button>
                </nav>
            </div>
            {activeTab === 'Crypto' ? <CryptoWallet wallet={walletData} /> : <FiatWallet wallet={walletData} />}
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
    const [activeTab, setActiveTab] = useState('Profile');

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Settings</h2>
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex flex-wrap space-x-2 sm:space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('Profile')}
                        className={`${activeTab === 'Profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('KYC')}
                        className={`${activeTab === 'KYC' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
                    >
                        KYC Verification
                    </button>
                    <button
                        onClick={() => setActiveTab('2FA')}
                        className={`${activeTab === '2FA' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
                    >
                        Two-Factor Auth
                    </button>
                </nav>
            </div>
            {activeTab === 'Profile' && <InvestorProfileSettings currentUser={currentUser} />}
            {activeTab === 'KYC' && <InvestorKycSettings status={currentUser.kycStatus} />}
            {activeTab === '2FA' && <TwoFactorAuthSettings enabled={currentUser.twoFactorEnabled} />}
        </div>
    );
};

const InvestorProfileSettings = ({ currentUser }) => {
    const [password, setPassword] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPassword(prev => ({...prev, [name]: value}));
    }

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (password.new !== password.confirm) {
            alert('New passwords do not match.');
            return;
        }
        if (!password.new) {
            alert('New password cannot be empty.');
            return;
        }
        // In a real app, call API to update password
        alert('Password updated successfully!');
        setPassword({ current: '', new: '', confirm: '' });
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="name" value={currentUser.name} disabled className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 cursor-not-allowed"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" value={currentUser.email} disabled className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 cursor-not-allowed"/>
                    </div>
                </div>
            </div>

            <hr />

            <form onSubmit={handlePasswordSubmit}>
                 <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input type="password" name="current" value={password.current} onChange={handlePasswordChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" autoComplete="current-password"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input type="password" name="new" value={password.new} onChange={handlePasswordChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" autoComplete="new-password"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input type="password" name="confirm" value={password.confirm} onChange={handlePasswordChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" autoComplete="new-password"/>
                    </div>
                 </div>
                 <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Update Password</button>
                </div>
            </form>
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
    const [withdrawalStatus, setWithdrawalStatus] = useState('idle'); // idle, processing, success, error
    const [withdrawalError, setWithdrawalError] = useState('');
    const [withdrawalDetails, setWithdrawalDetails] = useState({ address: '', amount: '' });


    const openModal = (action, currency) => {
        setWithdrawalStatus('idle');
        setWithdrawalError('');
        setWithdrawalDetails({ address: '', amount: ''});
        setModalConfig({ isOpen: true, action, currency });
    }
    const closeModal = () => setModalConfig({ isOpen: false, action: null, currency: null });

    const handleWithdrawalChange = (e) => {
        const { name, value } = e.target;
        setWithdrawalDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleWithdrawalRequest = async (e) => {
        e.preventDefault();
        setWithdrawalError('');
        const numericAmount = parseFloat(withdrawalDetails.amount);
        const balance = modalConfig.currency === 'USDT' ? wallet.usdt : wallet.usdc;

        if (!withdrawalDetails.address.startsWith('T') || withdrawalDetails.address.length < 26) {
            setWithdrawalError('Please enter a valid TRC20 address.');
            return;
        }
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setWithdrawalError('Please enter a valid amount.');
            return;
        }
        if (numericAmount > balance) {
            setWithdrawalError('Withdrawal amount cannot exceed your balance.');
            return;
        }
        
        setWithdrawalStatus('processing');
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (numericAmount > 5000) { // Arbitrary error condition for demo
                throw new Error("Transaction failed. Amount exceeds daily limit.");
            }
            setWithdrawalStatus('success');
        } catch(err) {
            setWithdrawalError(err.message);
            setWithdrawalStatus('error');
        }
    };


    const renderWithdrawalModalContent = () => {
        switch (withdrawalStatus) {
            case 'processing':
                return (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <h4 className="font-semibold text-lg text-gray-800">Processing Withdrawal</h4>
                        <p className="text-gray-600">Please wait while we process your request...</p>
                    </div>
                );
            case 'success':
                 return (
                    <div className="text-center py-8">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h4 className="font-semibold text-lg text-gray-800">Withdrawal Request Successful</h4>
                        <p className="text-gray-600">You have successfully withdrawn {withdrawalDetails.amount} {modalConfig.currency}. The funds are on their way to your address.</p>
                        <button onClick={closeModal} className="mt-6 bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700">Done</button>
                    </div>
                );
            case 'error':
                 return (
                     <div className="text-center py-8">
                        <XIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h4 className="font-semibold text-lg text-red-600">Withdrawal Failed</h4>
                        <p className="text-gray-600 mb-4">{withdrawalError}</p>
                        <button onClick={() => { setWithdrawalStatus('idle'); setWithdrawalError(''); }} className="mt-6 bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300">Try Again</button>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <form className="space-y-4" onSubmit={handleWithdrawalRequest}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{modalConfig.currency} Address</label>
                            <input 
                                type="text" 
                                name="address"
                                value={withdrawalDetails.address}
                                onChange={handleWithdrawalChange}
                                placeholder="Enter recipient TRC20 address" 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input 
                                type="number"
                                name="amount"
                                value={withdrawalDetails.amount}
                                onChange={handleWithdrawalChange}
                                placeholder="0.00" 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            />
                             {withdrawalError && <p className="text-red-500 text-xs mt-1">{withdrawalError}</p>}
                        </div>
                        <p className="text-xs text-gray-500">Fee: 0.5 {modalConfig.currency}</p>
                        <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Confirm Withdraw</button>
                    </form>
                );
        }
    };


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
                    renderWithdrawalModalContent()
                )}
            </WalletModal>
        </div>
    );
};

const FiatWallet = ({ wallet }) => {
    const [modalConfig, setModalConfig] = useState({ isOpen: false, action: null });
    const [ngnAmount, setNgnAmount] = useState('');
    const [withdrawalStatus, setWithdrawalStatus] = useState('idle'); // idle, processing, success, error
    const [withdrawalError, setWithdrawalError] = useState('');
    
    const openModal = (action) => {
        setNgnAmount(''); // Reset amount when opening modal
        setWithdrawalStatus('idle');
        setWithdrawalError('');
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

    const handleWithdrawalRequest = async (e) => {
        e.preventDefault();
        setWithdrawalError('');
        const numericAmount = parseFloat(ngnAmount.replace(/,/g, ''));

        if (isNaN(numericAmount) || numericAmount <= 0) {
            setWithdrawalError('Please enter a valid amount.');
            return;
        }

        if (numericAmount > wallet.ngn) {
            setWithdrawalError('Withdrawal amount cannot exceed your balance.');
            return;
        }

        setWithdrawalStatus('processing');
        try {
            // Simulate a 2-second backend request
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulate a potential error
            if (numericAmount > 10000000) { // Arbitrary error condition
                 throw new Error("Withdrawal limit exceeded for this transaction.");
            }
            
            // In a real app, you would call the backend here and update the global state upon success.
            // For this mock, we'll just show the success message.
            setWithdrawalStatus('success');
        } catch (err) {
            setWithdrawalError(err.message);
            setWithdrawalStatus('error');
        }
    };

    const renderWithdrawalModalContent = () => {
        switch (withdrawalStatus) {
            case 'processing':
                return (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <h4 className="font-semibold text-lg text-gray-800">Processing Withdrawal</h4>
                        <p className="text-gray-600">Please wait...</p>
                    </div>
                );
            case 'success':
                return (
                    <div className="text-center py-8">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h4 className="font-semibold text-lg text-gray-800">Withdrawal Successful</h4>
                        <p className="text-gray-600">Your withdrawal of {formatNgnCurrency(parseFloat(ngnAmount.replace(/,/g, '')))} was successful. The funds have been sent to your bank account and should reflect instantly.</p>
                        <button onClick={closeModal} className="mt-6 bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700">Done</button>
                    </div>
                );
            case 'error':
                 return (
                     <div className="text-center py-8">
                        <XIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h4 className="font-semibold text-lg text-red-600">Withdrawal Failed</h4>
                        <p className="text-gray-600 mb-4">{withdrawalError}</p>
                        <button onClick={() => { setWithdrawalStatus('idle'); setWithdrawalError(''); }} className="mt-6 bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300">Try Again</button>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <form className="space-y-4" onSubmit={handleWithdrawalRequest}>
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
                            {withdrawalError && <p className="text-red-500 text-xs mt-1">{withdrawalError}</p>}
                       </div>
                       <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Request Withdrawal</button>
                   </form>
                );
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
                    renderWithdrawalModalContent()
                )}
            </WalletModal>
        </div>
    );
};


const SecondaryMarket = ({ currentUser, marketListings, projects, onOpenBuyModal }) => {
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
             {/* Desktop Table */}
             <div className="overflow-x-auto hidden md:block">
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
                                            onClick={() => onOpenBuyModal(listing)}
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
                            <tr><td colSpan="6" className="text-center py-8 text-gray-500">No tokens are currently listed on the market.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                 {marketListings.length > 0 ? marketListings.map(listing => {
                    const project = projects.find(p => p.id === listing.projectId);
                    const sellerName = Object.values(initialUsers).find(u => u.id === listing.sellerId)?.name || 'Unknown';
                    const pricePerToken = listing.amount > 0 ? listing.price / listing.amount : 0;
                    return (
                        <div key={listing.listingId} className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex justify-between items-center mb-3 pb-3 border-b">
                                <div>
                                    <h3 className="font-bold text-gray-800">{project?.title}</h3>
                                    <p className="text-xs text-gray-500">Seller: {camouflageName(sellerName)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-green-600">{formatCurrency(listing.price)}</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(pricePerToken)} / token</p>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm items-center mb-4">
                                <span className="text-gray-600">Tokens for Sale:</span>
                                <span className="font-semibold text-gray-800">{listing.amount.toLocaleString()} {project?.tokenTicker}</span>
                            </div>
                             <button
                                onClick={() => onOpenBuyModal(listing)}
                                disabled={currentUser.id === listing.sellerId || currentUser.type === 'developer' || currentUser.kycStatus !== 'Verified'}
                                className="w-full bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {currentUser.kycStatus !== 'Verified' ? 'Verify KYC' : currentUser.id === listing.sellerId ? 'Your Listing' : 'Buy Now'}
                            </button>
                        </div>
                    );
                }) : (
                     <p className="text-center py-8 text-gray-500">No tokens are currently listed on the market.</p>
                )}
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

const BuyTokenModal = ({ isOpen, onClose, listing, project, currentUser, onConfirmBuy }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState('input');

    const stablecoinBalance = (currentUser.wallet.usdt || 0) + (currentUser.wallet.usdc || 0);
    const pricePerToken = listing.price / listing.amount;
    const numericAmount = parseFloat(amount) || 0;
    const subtotal = numericAmount * pricePerToken;
    const fee = subtotal * 0.015; // Assuming 1.5% fee for buyer as well
    const totalCost = subtotal + fee;

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setAmount('');
                setError('');
                setStep('input');
            }, 300);
        }
    }, [isOpen]);

    const handleAmountChange = (value) => {
        setError('');
        if (value > listing.amount) {
            setError(`Cannot buy more than the ${listing.amount.toLocaleString()} tokens available.`);
        } else if ((parseFloat(value) * pricePerToken * 1.015) > stablecoinBalance) {
            setError('Total cost exceeds your available stablecoin balance.');
        }
        setAmount(value);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (error || numericAmount <= 0) {
            setError(error || 'Please enter a valid amount.');
            return;
        }
        setStep('confirm');
    };

    const handleFinalConfirm = () => {
        onConfirmBuy(listing.listingId, numericAmount);
    };

    if (!isOpen) return null;

    return (
        <WalletModal isOpen={isOpen} onClose={onClose} title={`Buy Token for ${project.title}`}>
            {step === 'input' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <p className="text-sm"><strong>Available Tokens:</strong> {listing.amount.toLocaleString()} {project.tokenTicker}</p>
                        <p className="text-sm"><strong>Price / Token:</strong> {formatCurrency(pricePerToken)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount to Buy</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            max={listing.amount}
                            placeholder="e.g., 500"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        />
                         {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                    {numericAmount > 0 && (
                        <div className="mt-4 text-sm space-y-2 bg-gray-50 p-3 rounded-md border">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Platform Fee (1.5%):</span>
                                <span className="font-medium text-gray-800">{formatCurrency(fee)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-bold text-gray-800">Total Cost:</span>
                                <span className="font-bold text-gray-900">{formatCurrency(totalCost)}</span>
                            </div>
                        </div>
                    )}
                    <div className="text-right text-xs text-gray-500">
                        Available Balance: {formatCurrency(stablecoinBalance)}
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={!!error || numericAmount <= 0} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">Review Purchase</button>
                    </div>
                </form>
            )}
             {step === 'confirm' && (
                 <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Purchase</h3>
                    <p className="text-gray-600 mb-4">You are about to purchase tokens from the secondary market. Please review the details.</p>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border">
                        <div className="flex justify-between"><span className="text-gray-600">Amount to Buy:</span><span className="font-bold">{numericAmount.toLocaleString()} {project.tokenTicker}</span></div>
                        <div className="flex justify-between border-t pt-2 mt-2"><span className="font-bold">Total Cost:</span><span className="font-bold">{formatCurrency(totalCost)}</span></div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button onClick={() => setStep('input')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Back</button>
                        <button onClick={handleFinalConfirm} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Confirm & Buy</button>
                    </div>
                </div>
            )}
        </WalletModal>
    );
};


const ProjectDetailsPage = ({ project, onBack, currentUser, onInvest }) => {
    const [mainImage, setMainImage] = useState(project.images[0]);
    const [investmentAmount, setInvestmentAmount] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [investmentDetails, setInvestmentDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('Overview');
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);


    const stablecoinBalance = currentUser ? (currentUser.wallet.usdt || 0) + (currentUser.wallet.usdc || 0) : 0;
    const progress = (project.amountRaised / project.fundingGoal) * 100;

    const handleInvestmentChange = (e) => {
        const value = e.target.value;
        const numericValue = parseFloat(value.replace(/,/g, ''));
        setError('');

        if (value === '') {
            setInvestmentAmount('');
            return;
        }

        if (!isNaN(numericValue)) {
            const fee = numericValue * 0.015;
            const totalDebit = numericValue + fee;
            if (totalDebit > stablecoinBalance) {
                setError('Investment amount exceeds your available stablecoin balance.');
            }
            setInvestmentAmount(numericValue.toLocaleString('en-US'));
        }
    };

    const handleInvestClick = () => {
        const numericInvestmentAmount = parseFloat(investmentAmount.replace(/,/g, ''));
        if (isNaN(numericInvestmentAmount) || numericInvestmentAmount <= 0) {
            setError('Please enter a valid investment amount.');
            return;
        }

        const fee = numericInvestmentAmount * 0.015;
        const totalDebit = numericInvestmentAmount + fee;
        const pricePerToken = project.fundingGoal / project.tokenSupply;
        const tokensToReceive = numericInvestmentAmount / pricePerToken;

        setInvestmentDetails({
            numericInvestmentAmount,
            fee,
            totalDebit,
            tokensToReceive
        });
        setIsModalOpen(true);
    };

    const confirmInvestment = () => {
        onInvest(project.id, investmentDetails.numericInvestmentAmount);
        setIsModalOpen(false); // Modal will show success message and then close
    };

    const handleAiQuery = async (e) => {
        e.preventDefault();
        if (!aiQuery.trim()) return;

        setIsAiLoading(true);
        setAiResponse('');
        
        try {
            const prompt = `As an AI investment assistant for Kayzera, answer the following user question about the "${project.title}" project.
            
            User Question: "${aiQuery}"
            
            Project Data:
            - Description: ${project.description}
            - Location: ${project.location}
            - Funding Goal: ${formatCurrency(project.fundingGoal)}
            - APY: ${project.apy}%
            - Term: ${project.term} months
            
            Provide a concise and helpful response based *only* on the provided data.`;

            const response = await callAIAPI(prompt);
            setAiResponse(response);
        } catch (error) {
            setAiResponse('Sorry, I was unable to process your request at this time.');
        } finally {
            setIsAiLoading(false);
        }
    };


    return (
        <>
            <div className="max-w-6xl mx-auto">
                <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Marketplace
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column (Main Content) */}
                    <div className="lg:col-span-3 space-y-8">
                         {/* Image Gallery */}
                        <div>
                             <img src={mainImage} alt="Main project view" className="w-full h-96 object-cover rounded-lg shadow-lg mb-4"/>
                             <div className="flex space-x-2 overflow-x-auto pb-2">
                                {project.images.map((img, index) => (
                                    <img 
                                        key={index}
                                        src={img} 
                                        alt={`Thumbnail ${index + 1}`}
                                        className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 transition-all ${mainImage === img ? 'border-indigo-500 scale-105' : 'border-transparent hover:border-gray-300'}`}
                                        onClick={() => setMainImage(img)}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        {/* Tabs */}
                        <div className="border-b">
                             <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button onClick={() => setActiveTab('Overview')} className={`${activeTab === 'Overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Overview</button>
                                <button onClick={() => setActiveTab('AI_Assistant')} className={`${activeTab === 'AI_Assistant' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>AI Assistant</button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div>
                            {activeTab === 'Overview' && (
                                <div className="space-y-6">
                                    <h1 className="text-4xl font-extrabold text-gray-900">{project.title}</h1>
                                    <p className="text-lg text-gray-600 leading-relaxed">{project.description}</p>
                                </div>
                            )}

                            {activeTab === 'AI_Assistant' && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-gray-800">AI Investment Assistant</h2>
                                    <p className="text-gray-600">Ask a question about this project, and our AI will provide insights based on the available data.</p>
                                    <form onSubmit={handleAiQuery} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={aiQuery}
                                            onChange={(e) => setAiQuery(e.target.value)}
                                            placeholder="e.g., What is the investment potential?"
                                            className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <button type="submit" disabled={isAiLoading} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300">
                                            {isAiLoading ? 'Asking...' : 'Ask AI'}
                                        </button>
                                    </form>
                                     {isAiLoading && <p className="text-sm text-gray-500">Thinking...</p>}
                                     {aiResponse && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                            <p className="text-gray-800">{aiResponse}</p>
                                        </div>
                                     )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column (Investment Card) */}
                     <div className="lg:col-span-2">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-xl border">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Invest in this Project</h2>
                                
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Raised: {formatCurrency(project.amountRaised)}</span>
                                        <span className="font-semibold">{progress.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-center my-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Annual APY</p>
                                        <p className="text-2xl font-bold text-green-600">{project.apy}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Term</p>
                                        <p className="text-2xl font-bold">{project.term} Months</p>
                                    </div>
                                </div>
                                
                                {progress < 100 ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="investment" className="block text-sm font-medium text-gray-700">Investment Amount (USD)</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">$</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="investment"
                                                    id="investment"
                                                    value={investmentAmount}
                                                    onChange={handleInvestmentChange}
                                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                                    placeholder="0.00"
                                                    disabled={currentUser.type === 'developer' || currentUser.kycStatus !== 'Verified'}
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-right text-gray-500">Available: {formatCurrency(stablecoinBalance)}</p>
                                            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                                        </div>
                                        <button 
                                            onClick={handleInvestClick}
                                            disabled={!!error || !investmentAmount || currentUser.type === 'developer' || currentUser.kycStatus !== 'Verified'}
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {currentUser.kycStatus !== 'Verified' ? 'Verify KYC to Invest' : 'Invest Now'}
                                        </button>
                                         <p className="text-xs text-center text-gray-500">A 1.5% platform fee will be added to your investment.</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-blue-50 rounded-lg">
                                        <h3 className="text-lg font-bold text-blue-800">Project Fully Funded!</h3>
                                        <p className="text-sm text-blue-700">Thank you to all our investors.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <InvestmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmInvestment}
                project={project}
                details={investmentDetails}
            />
        </>
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


const CurrencyExchange = ({ currentUser, onExchange }) => {
    const USD_NGN_RATE = 1500;
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('NGN');
    const [toCurrency, setToCurrency] = useState('USDT');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fromBalance = useMemo(() => {
        if (!currentUser) return 0;
        switch (fromCurrency) {
            case 'NGN': return currentUser.wallet.ngn;
            case 'USDT': return currentUser.wallet.usdt;
            case 'USDC': return currentUser.wallet.usdc;
            default: return 0;
        }
    }, [fromCurrency, currentUser]);

    const handleSwapCurrencies = () => {
        setFromAmount(toAmount);
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
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
        setSuccess('');
        setError('');
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

    const handleConvert = () => {
        setError('');
        setSuccess('');
        const numericFrom = parseFloat(String(fromAmount).replace(/,/g, '')) || 0;
        const numericTo = parseFloat(String(toAmount).replace(/,/g, '')) || 0;

        if (numericFrom <= 0) {
            setError('Please enter a valid amount to convert.');
            return;
        }
        
        const result = onExchange(currentUser.id, fromCurrency, numericFrom, toCurrency, numericTo);

        if (result.success) {
            setSuccess(result.message);
            setFromAmount('');
            setToAmount('');
        } else {
            setError(result.message);
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

    const numericFromAmount = parseFloat(String(fromAmount).replace(/,/g, '')) || 0;
    const isButtonDisabled = numericFromAmount <= 0 || numericFromAmount > fromBalance || currentUser.kycStatus !== 'Verified';
    
    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Exchange NGN & Crypto</h2>
            <div className="space-y-2">
                {/* From Field */}
                <div className="p-4 border rounded-lg">
                     <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                        <span>You Pay</span>
                         <span>Balance: {fromBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                     </div>
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

                {error && <p className="text-center text-red-500 text-sm mt-2">{error}</p>}
                {success && <p className="text-center text-green-600 text-sm mt-2">{success}</p>}

                <div className="pt-2">
                    <button
                        onClick={handleConvert}
                        disabled={isButtonDisabled}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {currentUser.kycStatus !== 'Verified' ? 'Verify KYC to Exchange' : 'Convert'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- DEVELOPER DASHBOARD --- //
const DeveloperDashboard = ({ currentUser, projects, portfolios, marketListings, onLogout, totalBalance, activities, onCreateProject, onWithdrawFunds, onDepositApyFunds }) => {
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
            case 'Dashboard': return <DeveloperDashboardOverview currentUser={currentUser} projects={developerProjects} portfolios={portfolios} activities={activities} />;
            case 'My Projects':
                const projectToManage = projects.find(p => p.id === managingProjectId);
                if (projectToManage) {
                    return <DeveloperManageProject project={projectToManage} onBack={() => setManagingProjectId(null)} onWithdrawFunds={onWithdrawFunds} onDepositApyFunds={onDepositApyFunds} />;
                }
                return <DeveloperMyProjects projects={developerProjects} onManageProject={setManagingProjectId} />;
            case 'Create New Project': return <DeveloperCreateProject onCreateProject={onCreateProject} />;
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

const DeveloperDashboardOverview = ({ currentUser, projects, portfolios, activities }) => {
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

            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {activities && activities.length > 0 ? activities.map(activity => {
                        const isCredit = activity.amount > 0;
                        const isDebit = activity.amount < 0;
                        const isFinancial = activity.amount !== 0;

                        let icon;
                        let colors;

                        if (isFinancial) {
                            if (isCredit) { // e.g., Funds withdrawn to treasury
                                icon = <ArrowDownLeftIcon className="w-5 h-5" />;
                                colors = 'bg-green-100 text-green-600';
                            } else { // isDebit, e.g., APY wallet deposit
                                icon = <ArrowUpRightIcon className="w-5 h-5" />;
                                colors = 'bg-red-100 text-red-600';
                            }
                        } else { // Neutral/Informational
                            icon = <ClipboardIcon className="w-5 h-5" />;
                            colors = 'bg-gray-100 text-gray-600';
                        }
                        
                        return (
                            <div key={activity.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-full mr-4 ${colors}`}>
                                        {icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{activity.type}</p>
                                        <p className="text-sm text-gray-500">{activity.project || activity.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                     {isFinancial && <p className={`font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(activity.amount)}</p>}
                                     <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="text-center text-gray-500 py-4">No recent activity to display.</p>
                    )}
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
    const getStatusClass = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'funded': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
         <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Projects</h2>
             {/* Desktop Table */}
             <div className="overflow-x-auto hidden md:block">
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
                        {projects.length > 0 ? projects.map(project => (
                             <tr key={project.id}>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.title} ({project.tokenTicker})</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(project.fundingGoal)}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(project.amountRaised)}</td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(project.status)}`}>
                                         {project.status}
                                     </span>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                     <button onClick={() => onManageProject(project.id)} className="text-indigo-600 hover:text-indigo-900">Manage</button>
                                 </td>
                             </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center py-8 text-gray-500">You have not created any projects yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {projects.length > 0 ? projects.map(project => (
                    <div key={project.id} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-center mb-3 pb-3 border-b">
                            <div>
                                <h3 className="font-bold text-gray-800">{project.title}</h3>
                                <p className="text-xs text-gray-500">{project.tokenTicker}</p>
                            </div>
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(project.status)}`}>
                                {project.status}
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Raised:</span> <span className="font-semibold">{formatCurrency(project.amountRaised)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Goal:</span> <span className="font-semibold">{formatCurrency(project.fundingGoal)}</span></div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <button onClick={() => onManageProject(project.id)} className="w-full text-center bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                                Manage Project
                            </button>
                        </div>
                    </div>
                )) : (
                    <p className="text-center py-4 text-gray-500">You have not created any projects yet.</p>
                )}
            </div>
        </div>
    );
};

const DeveloperManageProject = ({ project, onBack, onWithdrawFunds, onDepositApyFunds }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const isFullyFunded = project.amountRaised >= project.fundingGoal;
    const monthlyApyCost = (project.amountRaised * (project.apy / 100)) / 12;
    const listingFee = project.amountRaised * 0.03;
    const netWithdrawal = project.amountRaised - listingFee;

    const handleWithdraw = () => {
        onWithdrawFunds(project.id);
    };

    const handleDepositSubmit = (e) => {
        e.preventDefault();
        onDepositApyFunds(project.id, depositAmount);
        setModalOpen(false);
        setDepositAmount('');
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
                            disabled={!isFullyFunded || project.fundsWithdrawn}
                            onClick={handleWithdraw}
                            className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {project.fundsWithdrawn ? 'Funds Already Withdrawn' : isFullyFunded ? `Withdraw Funds to Treasury` : 'Funding Goal Not Met'}
                        </button>
                         {isFullyFunded && !project.fundsWithdrawn && <p className="text-xs text-center mt-2 text-green-600">Congratulations! Your project is fully funded.</p>}
                    </div>
                 </div>
            </div>

             <WalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Deposit to ${project.title} (${project.tokenTicker}) Wallet`}>
                 <form onSubmit={handleDepositSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Amount (USD)</label>
                        <input
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="e.g., 5000"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        />
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
                <nav className="-mb-px flex flex-wrap space-x-2 sm:space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('Crypto')}
                        className={`${activeTab === 'Crypto' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
                    >
                        Crypto Wallet
                    </button>
                    <button
                        onClick={() => setActiveTab('Fiat')}
                        className={`${activeTab === 'Fiat' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
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

const DeveloperCreateProject = ({ onCreateProject }) => {
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

            
            const generatedText = await callAIAPI(userPrompt);
            
            setFormData(prev => ({...prev, description: generatedText }));

        } catch (error) {
            setGenerationError(error.message || 'Failed to generate description. Please try again.');
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
        
        e.preventDefault();
        
        if (!formData.projectTitle || !formData.fundingGoal || !formData.apy || !formData.term || !formData.tokenSupply || !formData.tokenTicker) {
            alert("Please fill out all project information and financial fields before submitting.");
            return;
        }

        const projectData = {
            title: formData.projectTitle,
            location: formData.location,
            description: formData.description,
            fundingGoal: parseFloat(String(formData.fundingGoal).replace(/,/g, '')),
            apy: parseFloat(formData.apy),
            term: parseInt(formData.term),
            tokenSupply: parseFloat(String(formData.tokenSupply).replace(/,/g, '')),
            tokenTicker: formData.tokenTicker,
        };
        
        onCreateProject(projectData);
        
        setFormData({
            projectTitle: '',
            location: '',
            description: '',
            fundingGoal: '',
            apy: '',
            term: '',
            tokenSupply: '',
            tokenTicker: '',
        });
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

const AdminDashboard = ({ currentUser, projects, users, onLogout, totalBalance, onUpdateProjectStatus, onUpdateUser }) => {
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
            case 'User Management': return <AdminUserManagement users={users} onUpdateUser={onUpdateUser} />;
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
                <nav className="-mb-px flex flex-wrap space-x-2 sm:space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveSubTab('Pending')}
                        className={`${activeSubTab === 'Pending' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
                    >
                        Pending Approvals
                        {pendingProjects.length > 0 && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{pendingProjects.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveSubTab('Approved')}
                        className={`${activeSubTab === 'Approved' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-4 px-2 sm:px-4 border-b-2 font-medium text-sm`}
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
            const systemPrompt = `You are a meticulous financial analyst and due diligence officer for a real estate crowdfunding platform named Kayzera. Your task is to review a new project submission and provide a concise summary and a risk analysis for the admin. Use the provided data and grounded search results to inform your analysis. Structure your response with a "Project Summary" section and a "Potential Risks & Due diligence Points" section with bullet points.`;
            
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

             
            const responseText = await callAIAPI({ messages: [ { role: "system", content: systemPrompt }, { role: "user", content: userPrompt } ] });
            setSummary({ text: responseText, isLoading: false, error: '' });
        } catch(e) {
            setSummary({ text: '', isLoading: false, error: e.message || 'Failed to generate summary. Please try again.' });
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

const AdminUserManagement = ({ users, onUpdateUser }) => {
    const [selectedUser, setSelectedUser] = useState(null);

    return (
        <>
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
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                        {user.name}
                                        {user.isSuspended && <span className="ml-2 text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Suspended</span>}
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.type}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                         <button onClick={() => setSelectedUser(user)} className="text-indigo-600 hover:text-indigo-900">View Details</button>
                                     </td>
                                 </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedUser && (
                <AdminUserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} onUpdateUser={onUpdateUser} />
            )}
        </>
    );
};

const AdminUserDetailsModal = ({ user, onClose, onUpdateUser }) => {
    const [actionFeedback, setActionFeedback] = useState('');

    useEffect(() => {
        // Reset feedback when the modal is opened with a new user
        setActionFeedback('');
    }, [user]);

    if (!user) return null;

    const handleSuspend = () => {
        if (user.type === 'admin') {
            setActionFeedback('Admin accounts cannot be suspended.');
            return;
        }
        onUpdateUser(user.id, { isSuspended: true });
        setActionFeedback(`User ${user.name} has been suspended.`);
    };

    const handleUnsuspend = () => {
        onUpdateUser(user.id, { isSuspended: false });
        setActionFeedback(`User ${user.name} has been unsuspended.`);
    };

    const handleResetPassword = () => {
        setActionFeedback(`Password reset link sent to ${user.email}.`);
    };

    const kycStatusClasses = {
        'Verified': 'bg-green-100 text-green-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Not Submitted': 'bg-gray-100 text-gray-800',
        'Rejected': 'bg-red-100 text-red-800'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">{user.name}'s Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="text-md font-bold text-gray-700 mb-2">User Information</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border">
                            <div className="flex justify-between"><span className="text-gray-600">Email:</span><span className="font-medium">{user.email}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Role:</span><span className="font-medium capitalize">{user.type}</span></div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">KYC Status:</span>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${kycStatusClasses[user.kycStatus] || kycStatusClasses['Not Submitted']}`}>
                                    {user.kycStatus}
                                </span>
                            </div>
                            <div className="flex justify-between"><span className="text-gray-600">2FA Enabled:</span><span className="font-medium">{user.twoFactorEnabled ? 'Yes' : 'No'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className={`font-medium ${user.isSuspended ? 'text-red-600' : 'text-green-600'}`}>{user.isSuspended ? 'Suspended' : 'Active'}</span></div>
                        </div>
                    </div>
                    {user.wallet && (
                         <div>
                            <h4 className="text-md font-bold text-gray-700 mb-2">Wallet Balances</h4>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border">
                                <div className="flex justify-between"><span className="text-gray-600">NGN:</span><span className="font-medium">{formatNgnCurrency(user.wallet.ngn)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">USDT:</span><span className="font-medium">{user.wallet.usdt.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">USDC:</span><span className="font-medium">{user.wallet.usdc.toFixed(2)}</span></div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t rounded-b-lg flex justify-end space-x-3 items-center min-h-[68px]">
                    {actionFeedback ? (
                        <p className="text-sm font-semibold text-green-700 flex-1 text-center">{actionFeedback}</p>
                    ) : (
                        <>
                            {user.type !== 'admin' && (
                                user.isSuspended ? (
                                    <button
                                        onClick={handleUnsuspend}
                                        className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 text-sm"
                                    >
                                        Unsuspend User
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSuspend}
                                        className="bg-yellow-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-600 text-sm"
                                    >
                                        Suspend User
                                    </button>
                                )
                            )}
                            <button onClick={handleResetPassword} className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 text-sm">Reset Password</button>
                        </>
                    )}
                </div>
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
                                <KayzeraLogo className="h-12 w-auto" textColor="white" taglineColor="#9ca3af" uniqueId="footer"/>
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
                    <p className="mt-4 text-xs text-gray-400 max-w-2xl mx-auto">
                        Disclaimer: Kayzera is a financial technology platform, not a bank. 
                        Investments in real estate are subject to risk, including potential loss
                         of principal. Please review all investment materials carefully before 
                        investing.
                    </p>
                </div>
            </div>
        </footer>
    );
};


// --- MAIN APP COMPONENT --- //
export default function App() {
    // State management
    const [page, setPage] = useState('landing'); // landing, login, register, forgotPassword, investorDashboard, etc.
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('kayzeraUsers');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Could not parse users from localStorage", e);
            }
        }
        return initialUsers;
    });
    const [projects, setProjects] = useState(initialProjects);
    const [portfolios, setPortfolios] = useState(initialPortfolios);
    const [marketListings, setMarketListings] = useState(initialMarketListings);
    const [userActivities, setUserActivities] = useState({
        1: [ // Ada Lovelace's initial activities
            { id: 1, type: 'Investment', project: 'Eko Atlantic Tower', amount: -10000, date: '2025-09-01T10:00:00Z' },
            { id: 2, type: 'APY Claim', project: 'Lekki Pearl Residence', amount: 62.50, date: '2025-08-05T11:00:00Z' },
            { id: 3, type: 'Deposit', project: 'USD Wallet', amount: 25000, date: '2025-07-15' },
        ],
        2: [ // Charles Babbage's initial activities
            { id: 1, type: 'Project Submitted', project: 'Ikeja Tech Hub', amount: 0, date: '2025-09-25T14:00:00Z', description: 'Submitted for admin approval.' },
            { id: 2, type: 'Funds Withdrawn', project: 'Lekki Pearl Residence', amount: 242500, date: '2025-09-10T11:00:00Z' },
            { id: 3, type: 'APY Wallet Deposit', project: 'Eko Atlantic Tower', amount: -12000, date: '2025-09-09T15:30:00Z' },
        ],
        3: [ // Admin Grace Hopper's initial activities
             { id: 1, type: 'Fee Collection', project: 'Lekki Pearl Residence', amount: 7500, date: '2025-09-10T11:00:00Z', description: '3% platform fee on capital withdrawal.'},
        ],
        4: [], // Bayo Adekunle starts with no activities
    });

    const USD_NGN_RATE = 1500;

    useEffect(() => {
        localStorage.setItem('kayzeraUsers', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        const savedUserData = localStorage.getItem('kayzeraUser');
        if (savedUserData) {
            try {
                const { email, page: savedPage } = JSON.parse(savedUserData);
                const user = users[email];
                // Check if user exists and the saved page is a valid dashboard page
                if (user && savedPage && savedPage.toLowerCase().includes('dashboard')) {
                    setCurrentUser(user);
                    setPage(savedPage);
                } else {
                    localStorage.removeItem('kayzeraUser');
                }
            } catch (error) {
                console.error("Failed to parse user data from localStorage", error);
                localStorage.removeItem('kayzeraUser');
            }
        }
    }, []); // Empty dependency array ensures this runs only once on mount

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

    const addActivity = (userId, activity) => {
        setUserActivities(prev => {
            const currentUserActivities = prev[userId] || [];
            // Add new activity to the front of the array
            const updatedActivities = [{ ...activity, id: Date.now(), date: new Date().toISOString() }, ...currentUserActivities];
            return {
                ...prev,
                [userId]: updatedActivities
            };
        });
    };

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
        localStorage.removeItem('kayzeraUser');
    };

    const handleRegisterUser = (newUser) => {
        setUsers(prevUsers => ({
            ...prevUsers,
            [newUser.email]: newUser
        }));
    };

    const handleUpdateUser = (userId, updates) => {
        setUsers(prevUsers => {
            const userEntry = Object.entries(prevUsers).find(([, user]) => user.id === userId);
            if (userEntry) {
                const [email, user] = userEntry;
                const updatedUser = { ...user, ...updates };
                // Also update currentUser if they are the one being updated
                if (currentUser && currentUser.id === userId) {
                    setCurrentUser(updatedUser);
                }
                return { ...prevUsers, [email]: updatedUser };
            }
            return prevUsers;
        });
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
                userToUpdate.wallet.usdt += monthlyApyAmount;
                setUsers(prevUsers => ({...prevUsers, [currentUser.email]: userToUpdate}));
            }
            
            // Update token's last claim date
            token.lastApyClaimDate = new Date().toISOString();

            addActivity(userId, {
                type: 'APY Claim',
                project: project.title,
                amount: monthlyApyAmount
            });
            
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

        const project = projects.find(p => p.id === listingDetails.projectId);
        if (project) {
            addActivity(listingDetails.sellerId, {
                type: 'Token Listed',
                project: project.title,
                amount: 0,
                description: `Listed ${listingDetails.amount.toLocaleString()} ${project.tokenTicker} tokens for ${formatCurrency(listingDetails.price)}`
            });
        }

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
    
    const handleInvest = (projectId, amount) => {
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

        const fee = amount * 0.015;
        const totalDebit = amount + fee;
        const userWallet = users[currentUser.email].wallet;
        const totalStablecoin = userWallet.usdt + userWallet.usdc;

        if (!currentUser || totalStablecoin < totalDebit) {
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

        const project = projects.find(p => p.id === projectId);
        if (!project) {
            alert("Error: Project not found.");
            return;
        }
        
        const nextUsers = JSON.parse(JSON.stringify(users));

        // 1. Debit investor's wallet
        const investor = nextUsers[currentUser.email];
        investor.wallet.usdt = newUsdt;
        investor.wallet.usdc = newUsdc;

        // 2. Credit admin's wallet with the fee
        const admin = nextUsers['admin@demo.com'];
        if (admin) {
            admin.wallet.usdt = (admin.wallet.usdt || 0) + fee;
        }

        setCurrentUser(investor);
        setUsers(nextUsers);

        // 3. Update project's amountRaised
        setProjects(prevProjects => prevProjects.map(p => 
            p.id === projectId 
            ? { ...p, amountRaised: p.amountRaised + amount, status: (p.amountRaised + amount) >= p.fundingGoal ? 'funded' : p.status } 
            : p
        ));

        // 4. Create new tokens for the investor
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

        addActivity(currentUser.id, {
            type: 'Investment',
            project: project.title,
            amount: -totalDebit
        });

        // 5. Log fee collection for admin
        if(admin) {
            addActivity(admin.id, {
                type: 'Fee Collection',
                project: project.title,
                amount: fee,
                description: `1.5% fee on investment from ${currentUser.name.split(' ')[0]}.`
            });
        }
    };

    const handleBuyFromMarket = (listingId, amountToBuy) => {
        const listing = marketListings.find(l => l.listingId === listingId);
        if (!listing) {
            alert("Error: Listing not found.");
            return;
        }

        const buyer = currentUser;
        const seller = Object.values(users).find(u => u.id === listing.sellerId);

        if (!buyer || !seller) {
            alert("Error: Buyer or seller not found.");
            return;
        }
        
        const pricePerToken = listing.price / listing.amount;
        const subtotal = pricePerToken * amountToBuy;
        const buyerFee = subtotal * 0.015;
        const totalDebit = subtotal + buyerFee;
        const sellerFee = subtotal * 0.015;
        const sellerNetCredit = subtotal - sellerFee;
        const totalPlatformFee = buyerFee + sellerFee;

        const buyerWallet = users[buyer.email].wallet;
        const totalStablecoin = buyerWallet.usdt + buyerWallet.usdc;

        if (totalStablecoin < totalDebit) {
            alert("Insufficient stablecoin balance (USDT/USDC) to purchase this token.");
            return;
        }

        // --- Perform Transaction ---

        // 1. Update Wallets
        let remainingDebit = totalDebit;
        let buyerNewUsdt = buyerWallet.usdt;
        let buyerNewUsdc = buyerWallet.usdc;

        if (buyerNewUsdt >= remainingDebit) {
            buyerNewUsdt -= remainingDebit;
        } else {
            remainingDebit -= buyerNewUsdt;
            buyerNewUsdt = 0;
            buyerNewUsdc -= remainingDebit;
        }
        
        const updatedUsers = JSON.parse(JSON.stringify(users));
        updatedUsers[buyer.email].wallet = { ...buyerWallet, usdt: buyerNewUsdt, usdc: buyerNewUsdc };
        updatedUsers[seller.email].wallet.usdt += sellerNetCredit;

        // Credit admin's wallet with total fees
        const admin = updatedUsers['admin@demo.com'];
        if (admin) {
            admin.wallet.usdt = (admin.wallet.usdt || 0) + totalPlatformFee;
        }

        // 2. Update Portfolios
        const updatedPortfolios = JSON.parse(JSON.stringify(portfolios));
        const sellerPortfolio = updatedPortfolios[seller.id];
        const buyerPortfolio = updatedPortfolios[buyer.id] || { tokens: [] };
        
        // Find and decrement seller's tokens
        const sellerMarketToken = sellerPortfolio.tokens.find(t => t.tokenId === listing.tokenId);
        const sellerSecurityToken = sellerPortfolio.tokens.find(t => t.projectId === listing.projectId && t.type === 'SECURITY');
        
        if (!sellerMarketToken || !sellerSecurityToken || sellerMarketToken.amount < amountToBuy) {
            alert("Error processing transaction: Seller token balance is incorrect.");
            return;
        }
        
        sellerMarketToken.amount -= amountToBuy;
        sellerSecurityToken.amount -= amountToBuy;
        sellerMarketToken.status = sellerMarketToken.amount > 0 ? 'held' : 'sold'; // Or remove if 0

        // Find or create buyer's tokens and increment
        let buyerMarketToken = buyerPortfolio.tokens.find(t => t.projectId === listing.projectId && t.type === 'MARKET');
        let buyerSecurityToken = buyerPortfolio.tokens.find(t => t.projectId === listing.projectId && t.type === 'SECURITY');
        
        if (buyerMarketToken) {
            buyerMarketToken.amount += amountToBuy;
        } else {
            buyerMarketToken = {
                tokenId: `proj${listing.projectId}-mkt-${buyer.id}`,
                projectId: listing.projectId,
                type: 'MARKET',
                amount: amountToBuy,
                ownerId: buyer.id,
                status: 'held',
            };
            buyerPortfolio.tokens.push(buyerMarketToken);
        }

        if (buyerSecurityToken) {
            buyerSecurityToken.amount += amountToBuy;
        } else {
            buyerSecurityToken = {
                tokenId: `proj${listing.projectId}-sec-${buyer.id}`,
                projectId: listing.projectId,
                type: 'SECURITY',
                amount: amountToBuy,
                originalOwnerId: buyer.id,
                lastApyClaimDate: new Date().toISOString(),
            };
            buyerPortfolio.tokens.push(buyerSecurityToken);
        }
        
        updatedPortfolios[buyer.id] = buyerPortfolio;

        // 3. Update Market Listings
        const updatedMarketListings = marketListings.map(l => {
            if (l.listingId === listingId) {
                const newAmount = l.amount - amountToBuy;
                if (newAmount > 0) {
                    return {
                        ...l,
                        amount: newAmount,
                        price: newAmount * pricePerToken
                    };
                }
                return null; // Mark for removal
            }
            return l;
        }).filter(Boolean); // Remove null entries
        
        // 4. Set State
        setUsers(updatedUsers);
        setPortfolios(updatedPortfolios);
        setMarketListings(updatedMarketListings);
        setCurrentUser(updatedUsers[buyer.email]); // Update current user with new balance

        // 5. Add Activities
        const project = projects.find(p => p.id === listing.projectId);
        addActivity(buyer.id, {
            type: 'Secondary Market Purchase',
            project: project.title,
            amount: -totalDebit,
            description: `Bought ${amountToBuy.toLocaleString()} ${project.tokenTicker} tokens`
        });
        addActivity(seller.id, {
            type: 'Secondary Market Sale',
            project: project.title,
            amount: sellerNetCredit,
            description: `Sold ${amountToBuy.toLocaleString()} ${project.tokenTicker} tokens`
        });
        
        // Log fee collection for admin
        if(admin) {
            addActivity(admin.id, {
                type: 'Fee Collection',
                project: project.title,
                amount: totalPlatformFee,
                description: `1.5% fee from buyer (${buyer.name.split(' ')[0]}) and seller (${seller.name.split(' ')[0]})`
            });
        }


        alert(`Purchase successful! You have acquired ${amountToBuy.toLocaleString()} tokens for ${project.title}.`);
    };

    const handleRedeemPrincipal = (userId, projectId) => {
        // --- 1. VALIDATION ---
        const project = projects.find(p => p.id === projectId);
        if (!project) {
            alert("Error: Project not found.");
            return;
        }

        const startDate = new Date(project.startDate);
        const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + project.term));
        if (new Date() <= endDate) {
            alert("Cannot redeem principal before the project term ends.");
            return;
        }

        const userPortfolio = portfolios[userId];
        const securityToken = userPortfolio?.tokens?.find(t => t.projectId === projectId && t.type === 'SECURITY');

        if (!securityToken) {
            alert("Error: Security token for this project not found in your portfolio.");
            return;
        }
        
        const redemptionAmount = securityToken.amount;

        addActivity(userId, {
            type: 'Principal Redeemed',
            project: project.title,
            amount: redemptionAmount
        });

        // --- 2. IMMUTABLE STATE UPDATES ---
        // Create a new, updated user object
        const updatedUser = {
            ...users[currentUser.email],
            wallet: {
                ...users[currentUser.email].wallet,
                usdt: users[currentUser.email].wallet.usdt + redemptionAmount,
            }
        };

        // Create a new users map with the updated user
        const nextUsers = {
            ...users,
            [currentUser.email]: updatedUser
        };

        // Create a new portfolio for the user with the tokens removed ("burned")
        const updatedPortfolio = {
            ...userPortfolio,
            tokens: userPortfolio.tokens.filter(t => t.projectId !== projectId)
        };

        // Create a new portfolios map with the updated user portfolio
        const nextPortfolios = {
            ...portfolios,
            [userId]: updatedPortfolio
        };

        // --- 3. SET ALL STATE AT ONCE ---
        setUsers(nextUsers);
        setPortfolios(nextPortfolios);
        setCurrentUser(updatedUser);
        
        alert(`Successfully redeemed ${formatCurrency(redemptionAmount)}! The funds have been added to your USDT wallet.`);
    };

    const handleCurrencyExchange = (userId, fromCurrency, fromAmount, toCurrency, toAmount) => {
        const user = Object.values(users).find(u => u.id === userId);
        if (!user) {
            return { success: false, message: 'User not found.' };
        }

        const wallet = { ...user.wallet }; // Create a copy to modify
        let fromBalanceKey = '';
        if (fromCurrency === 'NGN') fromBalanceKey = 'ngn';
        else if (fromCurrency === 'USDT') fromBalanceKey = 'usdt';
        else if (fromCurrency === 'USDC') fromBalanceKey = 'usdc';

        if (!fromBalanceKey || wallet[fromBalanceKey] < fromAmount) {
            return { success: false, message: `Insufficient ${fromCurrency} balance.` };
        }

        let toBalanceKey = '';
        if (toCurrency === 'NGN') toBalanceKey = 'ngn';
        else if (toCurrency === 'USDT') toBalanceKey = 'usdt';
        else if (toCurrency === 'USDC') toBalanceKey = 'usdc';

        if (!toBalanceKey) {
            return { success: false, message: 'Invalid target currency.' };
        }

        // Update wallet
        wallet[fromBalanceKey] -= fromAmount;
        wallet[toBalanceKey] += toAmount;

        const updatedUser = { ...user, wallet };

        // Update state
        const updatedUsers = { ...users, [updatedUser.email]: updatedUser };
        setUsers(updatedUsers);
        if (currentUser && currentUser.id === userId) {
            setCurrentUser(updatedUser);
        }

        // Add activity
        addActivity(userId, {
            type: 'Currency Exchange',
            description: `Converted ${fromAmount.toLocaleString()} ${fromCurrency} to ${toAmount.toLocaleString()} ${toCurrency}`,
            amount: 0 // It's a swap, not a net gain/loss
        });

        return { success: true, message: 'Exchange successful!' };
    };

    const handleCreateProject = (projectData) => {
        const newProject = {
            ...projectData,
            id: projects.length + 1,
            developerId: currentUser.id,
            developerName: currentUser.name,
            amountRaised: 0,
            status: 'pending',
            projectWalletBalance: 0,
            fundsWithdrawn: false,
            images: [
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000',
                'https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=2000',
            ],
            startDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        };

        setProjects(prev => [...prev, newProject]);

        addActivity(currentUser.id, {
            type: 'Project Submitted',
            project: newProject.title,
            amount: 0,
            description: `Submitted for admin approval.`
        });
        
        alert(`Project "${newProject.title}" submitted successfully for review!`);
    };

    const handleWithdrawFunds = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project || project.fundsWithdrawn) {
            alert("Error: Project not found or funds already withdrawn.");
            return;
        }
        
        const listingFee = project.amountRaised * 0.03;
        const netWithdrawal = project.amountRaised - listingFee;

        const nextUsers = JSON.parse(JSON.stringify(users));

        // Credit developer's wallet
        const developer = nextUsers[currentUser.email];
        developer.wallet.usdt += netWithdrawal;

        // Credit admin's wallet with the fee
        const admin = nextUsers['admin@demo.com'];
        if (admin) {
            admin.wallet.usdt = (admin.wallet.usdt || 0) + listingFee;
        }

        setUsers(nextUsers);
        setCurrentUser(developer);

        setProjects(prev => prev.map(p => p.id === projectId ? {...p, fundsWithdrawn: true} : p));

        addActivity(currentUser.id, {
            type: 'Funds Withdrawn',
            project: project.title,
            amount: netWithdrawal,
            description: `Net payout of ${formatCurrency(netWithdrawal)} to treasury.`
        });
        
        // Log fee collection for admin
        if (admin) {
             addActivity(admin.id, {
                type: 'Fee Collection',
                project: project.title,
                amount: listingFee,
                description: `3% platform fee on capital withdrawal.`
            });
        }

        alert(`Withdrawal successful! ${formatCurrency(netWithdrawal)} has been sent to your treasury address.`);
    };

    const handleDepositApyFunds = (projectId, depositAmount) => {
        const numericAmount = parseFloat(depositAmount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert("Please enter a valid amount to deposit.");
            return;
        }
        
        const project = projects.find(p => p.id === projectId);
        if (!project) {
            alert("Error: Project not found.");
            return;
        }

        const userWallet = users[currentUser.email].wallet;
        const totalStablecoin = userWallet.usdt + userWallet.usdc;

        if (totalStablecoin < numericAmount) {
            alert("Insufficient stablecoin balance (USDT/USDC) for this deposit.");
            return;
        }

        let remainingDebit = numericAmount;
        let newUsdt = userWallet.usdt;
        let newUsdc = userWallet.usdc;

        if (newUsdt >= remainingDebit) {
            newUsdt -= remainingDebit;
        } else {
            remainingDebit -= newUsdt;
            newUsdt = 0;
            newUsdc -= remainingDebit;
        }

        const updatedUser = {
            ...users[currentUser.email],
            wallet: { ...userWallet, usdt: newUsdt, usdc: newUsdc }
        };
        
        setUsers(prev => ({ ...prev, [currentUser.email]: updatedUser }));
        setCurrentUser(updatedUser);

        setProjects(prev => prev.map(p => 
            p.id === projectId 
            ? { ...p, projectWalletBalance: p.projectWalletBalance + numericAmount } 
            : p
        ));

        addActivity(currentUser.id, {
            type: 'APY Wallet Deposit',
            project: project.title,
            amount: -numericAmount,
            description: `Deposited ${formatCurrency(numericAmount)} for APY payments.`
        });
        
        alert(`Successfully deposited ${formatCurrency(numericAmount)} into the project's APY wallet.`);
    };

    const renderPage = () => {
        if (currentUser) {
            const activities = userActivities[currentUser.id] || [];
            switch (currentUser.type) {
                case 'investor': return <InvestorDashboard currentUser={currentUser} projects={projects} portfolios={portfolios} marketListings={marketListings} onLogout={handleLogout} onClaimApy={handleClaimApy} onListToken={handleListToken} onInvest={handleInvest} onRedeemPrincipal={handleRedeemPrincipal} totalBalance={totalBalance} activities={activities} onExchange={handleCurrencyExchange} onBuyFromMarket={handleBuyFromMarket} />;
                case 'developer': return <DeveloperDashboard currentUser={currentUser} projects={projects} portfolios={portfolios} marketListings={marketListings} onLogout={handleLogout} totalBalance={totalBalance} activities={activities} onCreateProject={handleCreateProject} onWithdrawFunds={handleWithdrawFunds} onDepositApyFunds={handleDepositApyFunds} />;
                case 'admin': return <AdminDashboard currentUser={currentUser} projects={projects} users={users} onLogout={handleLogout} totalBalance={totalBalance} onUpdateProjectStatus={handleUpdateProjectStatus} onUpdateUser={handleUpdateUser} />;
                default:
                    // The useEffect above will handle logging out the user.
                    // Return null or a loading spinner to avoid rendering with an invalid user state.
                    return null;
            }
        }

        switch (page) {
            case 'login': return <LoginPage setPage={setPage} setCurrentUser={setCurrentUser} users={users} />;
            case 'register': return <RegisterPage setPage={setPage} onRegister={handleRegisterUser} users={users} />;
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
































