import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';
import websocketService from '../services/websocketService';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // State for all data
  const [projects, setProjects] = useState([]);
  const [portfolios, setPortfolios] = useState({});
  const [marketListings, setMarketListings] = useState([]);
  const [users, setUsers] = useState({});

  // Loading states
  const [loading, setLoading] = useState({
    projects: false,
    portfolios: false,
    marketListings: false,
    users: false
  });

  // Error states
  const [errors, setErrors] = useState({
    projects: null,
    portfolios: null,
    marketListings: null,
    users: null
  });

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(prev => ({ ...prev, projects: true }));
    setErrors(prev => ({ ...prev, projects: null }));
    
    try {
      const data = await apiService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setErrors(prev => ({ ...prev, projects: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  };

  // Fetch user's portfolio
  const fetchMyPortfolio = async () => {
    setLoading(prev => ({ ...prev, portfolios: true }));
    setErrors(prev => ({ ...prev, portfolios: null }));
    
    try {
      const data = await apiService.getMyPortfolio();
      setPortfolios(prev => ({ ...prev, [data.userId]: data }));
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      setErrors(prev => ({ ...prev, portfolios: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, portfolios: false }));
    }
  };

  // Fetch market listings
  const fetchMarketListings = async () => {
    setLoading(prev => ({ ...prev, marketListings: true }));
    setErrors(prev => ({ ...prev, marketListings: null }));
    
    try {
      const data = await apiService.getMarketListings();
      setMarketListings(data);
    } catch (error) {
      console.error('Failed to fetch market listings:', error);
      setErrors(prev => ({ ...prev, marketListings: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, marketListings: false }));
    }
  };

  // Fetch users (admin only)
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    setErrors(prev => ({ ...prev, users: null }));
    
    try {
      const data = await apiService.getUsers();
      const usersMap = {};
      data.forEach(user => {
        usersMap[user.email] = user;
      });
      setUsers(usersMap);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setErrors(prev => ({ ...prev, users: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // Create project
  const createProject = async (projectData) => {
    try {
      const newProject = await apiService.createProject(projectData);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  // Update project
  const updateProject = async (id, projectData) => {
    try {
      const updatedProject = await apiService.updateProject(id, projectData);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  };

  // Create market listing
  const createMarketListing = async (listingData) => {
    try {
      const newListing = await apiService.createMarketListing(listingData);
      setMarketListings(prev => [newListing, ...prev]);
      return newListing;
    } catch (error) {
      console.error('Failed to create market listing:', error);
      throw error;
    }
  };

  // Buy token from market
  const buyTokenFromMarket = async (listingId, amount) => {
    try {
      const result = await apiService.buyTokenFromMarket(listingId, amount);
      // Refresh market listings and portfolio
      await Promise.all([fetchMarketListings(), fetchMyPortfolio()]);
      return result;
    } catch (error) {
      console.error('Failed to buy token:', error);
      throw error;
    }
  };

  // Add token to portfolio
  const addTokenToPortfolio = async (tokenData) => {
    try {
      const updatedPortfolio = await apiService.addTokenToPortfolio(tokenData);
      setPortfolios(prev => ({ ...prev, [updatedPortfolio.userId]: updatedPortfolio }));
      return updatedPortfolio;
    } catch (error) {
      console.error('Failed to add token to portfolio:', error);
      throw error;
    }
  };

  // Remove token from portfolio
  const removeTokenFromPortfolio = async (tokenId) => {
    try {
      const updatedPortfolio = await apiService.removeTokenFromPortfolio(tokenId);
      setPortfolios(prev => ({ ...prev, [updatedPortfolio.userId]: updatedPortfolio }));
      return updatedPortfolio;
    } catch (error) {
      console.error('Failed to remove token from portfolio:', error);
      throw error;
    }
  };

  // Refresh all data
  const refreshAll = async () => {
    await Promise.all([
      fetchProjects(),
      fetchMyPortfolio(),
      fetchMarketListings()
    ]);
  };

  // Initialize data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshAll();
    }
  }, []);

  // WebSocket real-time updates
  useEffect(() => {
    const handleProjectUpdate = (data) => {
      if (data.action === 'create') {
        setProjects(prev => [data.project, ...prev]);
      } else if (data.action === 'update') {
        setProjects(prev => prev.map(p => p.id === data.project.id ? data.project : p));
      } else if (data.action === 'delete') {
        setProjects(prev => prev.filter(p => p.id !== data.projectId));
      }
    };

    const handleMarketListingUpdate = (data) => {
      if (data.action === 'create') {
        setMarketListings(prev => [data.listing, ...prev]);
      } else if (data.action === 'update') {
        setMarketListings(prev => prev.map(l => l.id === data.listing.id ? data.listing : l));
      } else if (data.action === 'delete') {
        setMarketListings(prev => prev.filter(l => l.id !== data.listingId));
      }
    };

    const handlePortfolioUpdate = (data) => {
      setPortfolios(prev => ({ ...prev, [data.userId]: data.portfolio }));
    };

    // Subscribe to WebSocket events
    websocketService.on('project_updated', handleProjectUpdate);
    websocketService.on('market_listing_updated', handleMarketListingUpdate);
    websocketService.on('portfolio_updated', handlePortfolioUpdate);

    // Connect to WebSocket
    websocketService.connect();

    return () => {
      // Cleanup WebSocket listeners
      websocketService.off('project_updated', handleProjectUpdate);
      websocketService.off('market_listing_updated', handleMarketListingUpdate);
      websocketService.off('portfolio_updated', handlePortfolioUpdate);
      websocketService.disconnect();
    };
  }, []);

  const value = {
    // Data
    projects,
    portfolios,
    marketListings,
    users,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    
    // Actions
    fetchProjects,
    fetchMyPortfolio,
    fetchMarketListings,
    fetchUsers,
    createProject,
    updateProject,
    createMarketListing,
    buyTokenFromMarket,
    addTokenToPortfolio,
    removeTokenFromPortfolio,
    refreshAll
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
