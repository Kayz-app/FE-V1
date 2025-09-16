import React, { useState } from 'react';

// --- INLINED ICONS & COMPONENTS --- //
const ArrowDownLeftIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 17-10-10"/><path d="M17 7v10H7"/></svg> );
const ArrowUpRightIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17V7h10"/><path d="M7 7l10 10"/></svg> );
const ClipboardIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg> );
const XIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );

const WalletModal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-5 h-5" /></button></div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const CryptoWallet = ({ wallet }) => {
    const [modalConfig, setModalConfig] = useState({ isOpen: false, action: null, currency: null });

    // Guard clause to prevent crash if wallet data is not ready
    if (!wallet) {
        return <div className="text-center p-8">Loading wallet balances...</div>;
    }

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
                        <div className="flex items-center mb-4"><img src={asset.logo} alt={`${asset.name} logo`} className="w-8 h-8 mr-3"/><h3 className="text-lg font-bold">{asset.name}</h3></div>
                        <p className="text-2xl font-semibold text-gray-800">{asset.balance.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Balance</p>
                        <div className="mt-4 flex space-x-2">
                             <button onClick={() => openModal('Deposit', asset.name)} className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"><ArrowDownLeftIcon className="w-4 h-4 mr-1"/> Deposit</button>
                             <button onClick={() => openModal('Withdraw', asset.name)} className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"><ArrowUpRightIcon className="w-4 h-4 mr-1"/> Withdraw</button>
                        </div>
                    </div>
                ))}
            </div>
            <WalletModal isOpen={modalConfig.isOpen} onClose={closeModal} title={`${modalConfig.action} ${modalConfig.currency}`}>
                {modalConfig.action === 'Deposit' && (
                    <div>
                        <p className="text-sm text-center text-gray-600 mb-4">Send {modalConfig.currency} to this TRC20 address.</p>
                        <div className="bg-gray-100 p-3 rounded-md text-center"><p className="text-xs text-gray-500 mb-1">Your {modalConfig.currency} Deposit Address</p><p className="font-mono break-all">TAbcdeFGHIjklmnoPQRSTuvwxyz12345</p></div>
                        <button className="mt-4 w-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"><ClipboardIcon className="w-4 h-4 mr-2"/> Copy Address</button>
                    </div>
                )}
                {modalConfig.action === 'Withdraw' && (
                    <form className="space-y-4">
                         <div><label className="block text-sm font-medium text-gray-700">{modalConfig.currency} Address</label><input type="text" placeholder="Enter recipient address" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/></div>
                         <div><label className="block text-sm font-medium text-gray-700">Amount</label><input type="number" placeholder="0.00" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/></div>
                        <p className="text-xs text-gray-500">Fee: 0.5 {modalConfig.currency}</p>
                        <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Confirm Withdraw</button>
                    </form>
                )}
            </WalletModal>
        </div>
    );
};

export default CryptoWallet;

