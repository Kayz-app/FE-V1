 import React, { useState } from 'react';
import { useData } from '../../../contexts/DataContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

// NOTE: The actual component files for PropertiesMarket, SecondaryMarket, and CurrencyExchange
// must be created and imported for this to work in a real app.
// For this example, they are included as placeholder functions.

const PlaceholderComponent = ({ title }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-500">This component is a placeholder and its content will be provided in its own file.</p>
    </div>
);

const PropertiesMarket = (props) => <PlaceholderComponent title="Properties Market" {...props} />;
const SecondaryMarket = (props) => <PlaceholderComponent title="Secondary Market" {...props} />;
const CurrencyExchange = (props) => <PlaceholderComponent title="Currency Exchange" {...props} />;

const InvestorMarketplace = ({ currentUser, onInvest }) => {
    const { marketListings, projects, loading, errors, fetchMarketListings, fetchProjects } = useData();
    const [activeTab, setActiveTab] = useState('Properties');

    // Show loading state
    if (loading.marketListings || loading.projects) {
        return <LoadingSpinner text="Loading marketplace data..." />;
    }

    // Show error state
    if (errors.marketListings || errors.projects) {
        return (
            <ErrorMessage 
                error={errors.marketListings || errors.projects} 
                onRetry={() => {
                    if (errors.marketListings) fetchMarketListings();
                    if (errors.projects) fetchProjects();
                }}
            />
        );
    }
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'Secondary Market':
                return <SecondaryMarket currentUser={currentUser} />;
            case 'Properties':
                return <PropertiesMarket currentUser={currentUser} onInvest={onInvest} />;
            case 'Currency Exchange':
                return <CurrencyExchange currentUser={currentUser} />;
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

export default InvestorMarketplace;

