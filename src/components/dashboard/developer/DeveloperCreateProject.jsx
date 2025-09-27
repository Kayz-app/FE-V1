import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../../contexts/Web3Context';

// --- INLINED ICONS & HELPERS --- //
const SparklesIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3Z"/>
    <path d="M3 21L4.5 16.5L9 15L4.5 13.5L3 9"/><path d="M21 21L19.5 16.5L15 15L19.5 13.5L21 9"/>
  </svg>
);
const FileUpIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
// This would be imported from an API utility file in a real app.
const callAIAPI = async () => "AI Generated Description Placeholder"; 
// --- END OF INLINED COMPONENTS --- //

const DeveloperCreateProject = () => {
    const { isConnected, web3Service } = useWeb3();
    const [formData, setFormData] = useState({
        projectTitle: '', location: '', description: '', fundingGoal: '',
        apy: '', term: '', tokenSupply: '', tokenTicker: '',
    });
    const [impliedPrice, setImpliedPrice] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const goal = parseFloat(String(formData.fundingGoal).replace(/,/g, ''));
        const supply = parseFloat(String(formData.tokenSupply).replace(/,/g, ''));
        setImpliedPrice((goal > 0 && supply > 0) ? goal / supply : 0);
    }, [formData.fundingGoal, formData.tokenSupply]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'tokenTicker') {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase().slice(0, 3) }));
        } else if (['fundingGoal', 'tokenSupply'].includes(name)) {
            const numericString = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: numericString ? parseInt(numericString, 10).toLocaleString('en-US') : '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmitForReview = async (e) => {
        e.preventDefault();
        
        if (!isConnected) {
            alert('Please connect your wallet to create a project.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const fundingGoal = parseFloat(String(formData.fundingGoal).replace(/,/g, ''));
            const apyRate = parseFloat(formData.apy) * 100; // Convert to basis points
            const termMonths = parseInt(formData.term);
            const totalTokenSupplyCap = parseFloat(String(formData.tokenSupply).replace(/,/g, ''));

            // Create project on blockchain
            const projectAddress = await web3Service.createProject(
                fundingGoal,
                apyRate,
                termMonths,
                totalTokenSupplyCap
            );

            alert(`Project created successfully! Contract address: ${projectAddress}`);
            
            // Reset form
            setFormData({
                projectTitle: '', location: '', description: '', fundingGoal: '',
                apy: '', term: '', tokenSupply: '', tokenTicker: '',
            });
            
        } catch (error) {
            console.error('Project creation failed:', error);
            alert(`Project creation failed: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Submit New Project</h2>
            <form onSubmit={handleSubmitForReview} className="space-y-6">
                {/* Project Info */}
                <div>
                    <label>Project Title</label>
                    <input type="text" name="projectTitle" value={formData.projectTitle} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                </div>
                {/* ... other form fields ... */}
                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !isConnected}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating Project...' : 'Create Project'}
                    </button>
                </div>
                {!isConnected && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-800 text-sm">
                            Please connect your wallet to create a project on the blockchain.
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
};

export default DeveloperCreateProject;
