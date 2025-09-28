 import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

// --- INLINED ICONS & COMPONENTS --- //
// In a real structured project, these would be imported.
const EyeIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const BuildingIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16"/><path d="M2 11h20"/><path d="M3 22V6l8-4 8 4v16"/><path d="M15 22V11l-7-3.5L1 11v11"/><path d="M11 22V11"/><path d="m11 6.5-4 2"/><path d="m19 6.5-4 2"/></svg>
);
const CheckCircleIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const TrendingUpIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);
const WalletIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h12v-6"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
);
const SettingsIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const LifeBuoyIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>
);


// These are placeholders for the actual components which would be in separate files.
const DashboardLayout = ({ children, ...props }) => <div>{children}</div>;
const DeveloperDashboardOverview = (props) => <div>Developer Dashboard Overview Placeholder</div>;
const DeveloperMyProjects = (props) => <div>Developer My Projects Placeholder</div>;
const DeveloperManageProject = ({ onBack, ...props }) => <button onClick={onBack}>Developer Manage Project Placeholder</button>;
const DeveloperCreateProject = (props) => <div>Developer Create Project Placeholder</div>;
const InvestorMarketplace = (props) => <div>Investor Marketplace Placeholder</div>;
const DeveloperWallet = (props) => <div>Developer Wallet Placeholder</div>;
const DeveloperSettings = (props) => <div>Developer Settings Placeholder</div>;
const HelpAndSupport = (props) => <div>Help & Support Placeholder</div>;

// --- END OF INLINED COMPONENTS --- //

const DeveloperDashboard = ({ currentUser, onLogout, totalBalance }) => {
    const { projects, portfolios, marketListings, loading, errors, fetchProjects, fetchMyPortfolio, fetchMarketListings } = useData();
    const [activeItem, setActiveItem] = useState('Dashboard');
    const [managingProjectId, setManagingProjectId] = useState(null);

    // Show loading state
    if (loading.projects || loading.portfolios || loading.marketListings) {
        return <LoadingSpinner text="Loading developer dashboard..." />;
    }

    // Show error state
    if (errors.projects || errors.portfolios || errors.marketListings) {
        return (
            <ErrorMessage 
                error={errors.projects || errors.portfolios || errors.marketListings} 
                onRetry={() => {
                    if (errors.projects) fetchProjects();
                    if (errors.portfolios) fetchMyPortfolio();
                    if (errors.marketListings) fetchMarketListings();
                }}
            />
        );
    }

    // Add a guard clause to handle the loading state before data arrives.
    if (!currentUser) {
        return <div>Loading developer dashboard...</div>;
    }

    // Filter projects to only those belonging to the current developer
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
    
    // This function renders the main content based on the selected sidebar item.
    const renderContent = () => {
        const developerMarketplaceOnInvest = () => alert("Developers are not permitted to invest in projects or purchase from the secondary market.");

        switch (activeItem) {
            case 'Dashboard':
                return <DeveloperDashboardOverview currentUser={currentUser} projects={developerProjects} portfolios={portfolios} />;
            case 'My Projects':
                const projectToManage = projects.find(p => p.id === managingProjectId);
                if (projectToManage) {
                    return <DeveloperManageProject project={projectToManage} onBack={() => setManagingProjectId(null)} />;
                }
                return <DeveloperMyProjects projects={developerProjects} onManageProject={setManagingProjectId} />;
            case 'Create New Project':
                return <DeveloperCreateProject />;
            case 'Marketplace':
                return <InvestorMarketplace currentUser={currentUser} marketListings={marketListings} projects={projects} onInvest={developerMarketplaceOnInvest} />;
            case 'Operational Wallet':
                return <DeveloperWallet currentUser={currentUser} />;
            case 'Settings':
                return <DeveloperSettings currentUser={currentUser} />;
            case 'Help & Support':
                return <HelpAndSupport currentUser={currentUser} />;
            default:
                return <DeveloperDashboardOverview currentUser={currentUser} projects={developerProjects} portfolios={portfolios} />;
        }
    };
    
    // Reset the project management view when the user navigates away from "My Projects"
    useEffect(() => {
        if (activeItem !== 'My Projects') {
            setManagingProjectId(null);
        }
    }, [activeItem]);

    return (
        <DashboardLayout currentUser={currentUser} sidebarItems={sidebarItems} activeItem={activeItem} setActiveItem={setActiveItem} onLogout={onLogout} totalBalance={totalBalance}>
            {renderContent()}
        </DashboardLayout>
    );
};

export default DeveloperDashboard;


