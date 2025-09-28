import React from 'react';
import { useData } from '../../../contexts/DataContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

// --- INLINED HELPERS --- //
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

const SecondaryMarket = ({ currentUser }) => {
    const { marketListings, projects, users, loading, errors, fetchMarketListings, fetchProjects, fetchUsers } = useData();

    // Show loading state
    if (loading.marketListings || loading.projects || loading.users) {
        return <LoadingSpinner text="Loading market data..." />;
    }

    // Show error state
    if (errors.marketListings || errors.projects || errors.users) {
        return (
            <ErrorMessage 
                error={errors.marketListings || errors.projects || errors.users} 
                onRetry={() => {
                    if (errors.marketListings) fetchMarketListings();
                    if (errors.projects) fetchProjects();
                    if (errors.users) fetchUsers();
                }}
            />
        );
    }

    if (!currentUser || !marketListings || !projects || !users) {
        return <div className="text-center p-8">No data available</div>;
    }

    const camouflageName = (fullName) => {
        if (!fullName || typeof fullName !== 'string') return '*****';
        const parts = fullName.trim().split(' ');
        const name = parts[0];
        if (name.length <= 4) return `${name.substring(0, 1)}***`;
        return `${name.substring(0, 2)}***${name.substring(name.length - 2)}`;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
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
                            const seller = Object.values(users).find(u => u.id === listing.sellerId);
                            const pricePerToken = listing.amount > 0 ? listing.price / listing.amount : 0;
                             
                             return (
                                 <tr key={listing.listingId}>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project?.title} ({project?.tokenTicker})</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{listing.amount.toLocaleString()}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{formatCurrency(pricePerToken)}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatCurrency(listing.price)}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{camouflageName(seller?.name)}</td>
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
                            <tr><td colSpan="6" className="text-center py-8 text-gray-500">No tokens are currently listed on the market.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SecondaryMarket;
