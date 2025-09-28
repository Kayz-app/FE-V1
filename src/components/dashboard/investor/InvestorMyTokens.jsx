 import React, { useState } from 'react';
import { useData } from '../../../contexts/DataContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

// --- INLINED COMPONENTS, ICONS & HELPERS --- //

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

    React.useEffect(() => {
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

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

const InvestorMyTokens = ({ currentUser, onClaimApy, onListToken }) => {
    const { projects, portfolios, loading, errors, fetchMyPortfolio, fetchProjects } = useData();

    // Show loading state
    if (loading.projects || loading.portfolios) {
        return <LoadingSpinner text="Loading token data..." />;
    }

    // Show error state
    if (errors.projects || errors.portfolios) {
        return (
            <ErrorMessage 
                error={errors.projects || errors.portfolios} 
                onRetry={() => {
                    if (errors.projects) fetchProjects();
                    if (errors.portfolios) fetchMyPortfolio();
                }}
            />
        );
    }

    if (!currentUser || !portfolios || !projects) {
        return <div className="text-center p-8">No data available</div>;
    }
    
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
                                     if (endDate > now && (now.getFullYear() > lastClaimDate.getFullYear() || now.getMonth() > lastClaimDate.getMonth())) {
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

export default InvestorMyTokens;

