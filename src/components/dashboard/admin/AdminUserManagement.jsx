import React from 'react';
import { useData } from '../../../contexts/DataContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

const AdminUserManagement = () => {
    const { users, loading, errors, fetchUsers } = useData();

    // Show loading state
    if (loading.users) {
        return <LoadingSpinner text="Loading user data..." />;
    }

    // Show error state
    if (errors.users) {
        return (
            <ErrorMessage 
                error={errors.users} 
                onRetry={fetchUsers}
            />
        );
    }

    if (!users || Object.keys(users).length === 0) {
        return <div className="text-center p-8">No users found</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">User Management</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {Object.values(users).map(user => (
                             <tr key={user.id}>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.type}</td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    {user.kycStatus && <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.kycStatus === 'Verified' ? 'bg-green-100 text-green-800' :
                                        user.kycStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                    }`}>{user.kycStatus}</span>}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                     <button className="text-indigo-600 hover:text-indigo-900">View Details</button>
                                 </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUserManagement;
