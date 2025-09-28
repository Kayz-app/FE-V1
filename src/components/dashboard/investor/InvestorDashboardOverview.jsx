import React, { useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

// --- INLINED COMPONENTS, ICONS & HELPERS TO RESOLVE IMPORT ERRORS --- //

const WalletIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h12v-6"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
);
const TrendingUpIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);
const ArrowDownLeftIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 17-10-10"/><path d="M17 7v10H7"/></svg>
);
const ArrowUpRightIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17V7h10"/><path d="M7 7l10 10"/></svg>
);

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

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-indigo-100 text-indigo-600 rounded-full p-3 mr-4">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const PortfolioPerformanceChart = ({ data }) => {
    const width = 500;
    const height = 250;
    const padding = 50;

    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">No performance data available.</div>;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    
    const xScale = (index) => padding + (index / (data.length - 1)) * (width - 2 * padding);
    const yScale = (value) => height - padding - ((value - minValue) / (maxValue - minValue)) * (height - 2 * padding);
    
    const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`).join(' ');
    const areaPath = `${path} L ${xScale(data.length - 1)} ${height - padding} L ${xScale(0)} ${height - padding} Z`;

    const yAxisLabels = () => {
        const labels = [];
        const range = maxValue - minValue;
        if (range === 0) { // Handle case where all values are the same
            return (
                <g>
                    <text x={padding - 10} y={height / 2} dy="0.35em" style={{ fontSize: '10px', fill: 'currentColor', textAnchor: 'end' }} className="text-gray-500">
                        ${(minValue / 1000).toFixed(1)}k
                    </text>
                    <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} className="stroke-current text-gray-200" strokeDasharray="2,2"/>
                </g>
            );
        }
        
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
                {yAxisLabels()}
                {data.map((d, i) => (
                    <text key={i} x={xScale(i)} y={height - padding + 15} style={{ fontSize: '10px', fill: 'currentColor', textAnchor: 'middle' }} className="text-gray-500">
                        {d.month}
                    </text>
                ))}
                <path d={areaPath} fill="url(#areaGradient)" />
                <path d={path} fill="none" stroke="#4f46e5" strokeWidth="2" />
                {data.map((d, i) => (
                    <circle key={i} cx={xScale(i)} cy={yScale(d.value)} r="4" fill="#fff" stroke="#4f46e5" strokeWidth="2" />
                ))}
            </svg>
        </div>
    );
};

const AssetAllocationChart = ({ data }) => {
     if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">No allocation data available.</div>;

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
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="#e5e7eb" strokeWidth={strokeWidth} />
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

// --- MAIN COMPONENT --- //

const InvestorDashboardOverview = ({ currentUser }) => {
    const { projects, portfolios, loading, errors, fetchMyPortfolio, fetchProjects } = useData();

    // Show loading state
    if (loading.projects || loading.portfolios) {
        return <LoadingSpinner text="Loading dashboard data..." />;
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

    const stats = useMemo(() => {
        const totalInvestment = userPortfolio.tokens
            .filter(t => t.type === 'SECURITY')
            .reduce((sum, token) => sum + token.amount, 0);

        const portfolioValue = totalInvestment;
        const lifetimeApy = totalInvestment * 0.15 * 1.2; 
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
      { month: 'Apr', value: 13000 }, { month: 'May', value: 14500 },
      { month: 'Jun', value: 14000 }, { month: 'Jul', value: 15500 },
      { month: 'Aug', value: 17000 }, { month: 'Sep', value: 17500 },
    ];

    const allocationData = useMemo(() => {
        if (!userPortfolio.tokens || userPortfolio.tokens.length === 0) return [];

        const allocation = {};
        userPortfolio.tokens
            .filter(token => token.type === 'SECURITY')
            .forEach(token => {
                const project = projects.find(p => p.id === token.projectId);
                if (project) {
                    if (!allocation[project.title]) allocation[project.title] = 0;
                    allocation[project.title] += token.amount;
                }
            });
        const colors = ['#4f46e5', '#818cf8', '#a78bfa', '#c4b5fd'];
        return Object.entries(allocation).map(([name, value], index) => ({
            name, value, color: colors[index % colors.length]
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

export default InvestorDashboardOverview;

