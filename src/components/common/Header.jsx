import React, { useState } from 'react';
import WalletConnection from './WalletConnection';

// Inlined icon components to resolve the import error.
const KayzeraLogo = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#6366f1', stopOpacity: 1}} />
        <stop offset="100%" style={{stopColor: '#4f46e5', stopOpacity: 1}} />
      </linearGradient>
    </defs>
    <path d="M4 4H8V20H4V4Z" fill="url(#logoGradient)" />
    <path d="M9 11L16 4L20 8L13 15V20H9V11Z" fill="url(#logoGradient)" />
  </svg>
);

const MenuIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const BellIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);


const Header = ({ setPage, currentUser, onLogout }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleScrollTo = (id) => {
        // The 'page' variable is not defined in this component's scope.
        // Assuming the intention is to always go to the landing page first.
        setPage('landing');
        setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <header className="bg-white shadow-sm">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                         <a href="#" onClick={(e) => { e.preventDefault(); setPage('landing'); }} className="flex items-center gap-2">
                           <KayzeraLogo className="h-8 w-8 text-indigo-600"/>
                           <span className="text-2xl font-bold text-gray-800">Kayzera</span>
                        </a>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <a href="#featured-projects" onClick={(e) => {e.preventDefault(); handleScrollTo('featured-projects')}} className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Projects</a>
                            <a href="#how-it-works" onClick={(e) => {e.preventDefault(); handleScrollTo('how-it-works')}} className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">How It Works</a>
                            <a href="#faq" onClick={(e) => {e.preventDefault(); handleScrollTo('faq')}} className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">FAQ</a>
                            <a href="#" onClick={() => setPage('company')} className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Company</a>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center space-x-4">
                            <WalletConnection />
                            {currentUser ? (
                                 <div className="ml-4 flex items-center md:ml-6">
                                    <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <BellIcon className="h-6 w-6" />
                                    </button>
                                    <button onClick={onLogout} className="ml-3 text-sm font-medium text-gray-500 hover:text-gray-900">Logout</button>
                                 </div>
                            ) : (
                                <div className="flex items-center">
                                    <a href="#" onClick={() => setPage('login')} className="text-sm font-medium text-gray-500 hover:text-gray-900">Sign in</a>
                                    <a href="#" onClick={() => setPage('register')} className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                        Get Started
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
                            {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {mobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                         <a href="#featured-projects" onClick={(e) => {e.preventDefault(); handleScrollTo('featured-projects'); setMobileMenuOpen(false);}} className="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">Projects</a>
                         <a href="#how-it-works" onClick={(e) => {e.preventDefault(); handleScrollTo('how-it-works'); setMobileMenuOpen(false);}} className="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">How It Works</a>
                         <a href="#faq" onClick={(e) => {e.preventDefault(); handleScrollTo('faq'); setMobileMenuOpen(false);}} className="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">FAQ</a>
                         <a href="#" onClick={() => {setPage('company'); setMobileMenuOpen(false);}} className="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">Company</a>
                    </div>
                     <div className="pt-4 pb-3 border-t border-gray-200">
                        {currentUser ? (
                             <div className="px-2 space-y-1">
                                <a href="#" onClick={onLogout} className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900">Logout</a>
                             </div>
                        ) : (
                             <div className="px-2 space-y-1">
                                <a href="#" onClick={() => {setPage('login'); setMobileMenuOpen(false);}} className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900">Sign in</a>
                                <a href="#" onClick={() => {setPage('register'); setMobileMenuOpen(false);}} className="block w-full text-left mt-1 px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">Get Started</a>
                             </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;

