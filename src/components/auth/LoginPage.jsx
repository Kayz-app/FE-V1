import React, { useState } from 'react';

// Inlined KayzeraLogo and AuthPage components to resolve the import error.
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

const AuthPage = ({ children, title, setPage }) => {
    return (
        <div className="bg-gray-100 flex flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <a href="#" onClick={(e) => { e.preventDefault(); setPage('landing'); }} className="flex justify-center items-center gap-2 no-underline">
                    <KayzeraLogo className="h-10 w-auto"/>
                    <span className="text-3xl font-bold text-gray-800">Kayzera</span>
                </a>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{title}</h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
                    {children}
                </div>
            </div>
        </div>
    );
};


const LoginPage = ({ setPage, setCurrentUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Login response:', { response: response.ok, data });

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Set current user and redirect to dashboard
                const userData = {
                    ...data.user,
                    type: data.user.userType // Map userType to type for consistency
                };
                console.log('Setting current user:', userData);
                setCurrentUser(userData);
                
                // Redirect to dashboard based on user type
                if (data.user.userType === 'investor') {
                    console.log('Redirecting to investor dashboard');
                    setPage('investorDashboard');
                } else if (data.user.userType === 'developer') {
                    console.log('Redirecting to developer dashboard');
                    setPage('developerDashboard');
                } else if (data.user.userType === 'admin') {
                    console.log('Redirecting to admin dashboard');
                    setPage('adminDashboard');
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loginAs = async (userEmail) => {
        setLoading(true);
        setError('');
        
        // For demo purposes, use the mock data login
        const demoUsers = {
            'investor@demo.com': { 
                id: 1, 
                type: 'investor', 
                name: 'Ada Lovelace', 
                email: 'investor@demo.com', 
                wallet: { ngn: 5000000, usdt: 1250.50, usdc: 800.25 },
                kycStatus: 'Verified',
                twoFactorEnabled: true,
            },
            'developer@demo.com': { 
                id: 2, 
                type: 'developer', 
                name: 'Charles Babbage', 
                email: 'developer@demo.com', 
                wallet: { ngn: 1200000, usdt: 500, usdc: 100 },
                companyProfile: {
                    name: 'Babbage Constructions Ltd.',
                    regNumber: 'RC123456',
                    address: '1 Innovation Drive, Yaba, Lagos',
                    website: 'https://babbageconstructions.com',
                },
                twoFactorEnabled: false,
                treasuryAddress: '0x1234ABCD5678EFGH9101KLMN1213OPQR1415STUV',
            },
            'admin@demo.com': { 
                id: 3, 
                type: 'admin', 
                name: 'Admin Grace Hopper', 
                email: 'admin@demo.com', 
                wallet: { ngn: 0, usdt: 0, usdc: 0 } 
            },
            'buyer@demo.com': { 
                id: 4, 
                type: 'investor', 
                name: 'Alan Turing', 
                email: 'buyer@demo.com', 
                wallet: { ngn: 2500000, usdt: 750, usdc: 500 },
                kycStatus: 'Not Submitted',
                twoFactorEnabled: false,
            }
        };
        
        const user = demoUsers[userEmail];
        if (user) {
            setCurrentUser(user);
            // Redirect based on user type
            if (user.type === 'investor') {
                setPage('investorDashboard');
            } else if (user.type === 'developer') {
                setPage('developerDashboard');
            } else if (user.type === 'admin') {
                setPage('adminDashboard');
            }
        }
        setLoading(false);
    };
    
    return (
        <AuthPage title="Sign in to your account" setPage={setPage}>
            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                    <div className="mt-1">
                        <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
                    <div className="mt-1">
                        <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <a href="#" onClick={() => setPage('forgotPassword')} className="font-medium text-indigo-600 hover:text-indigo-500">Forgot your password?</a>
                    </div>
                </div>
                <div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>
            </form>
             <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with a demo</span></div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-3">
                    <button onClick={() => loginAs('investor@demo.com')} className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Login as Investor (Verified)</button>
                    <button onClick={() => loginAs('buyer@demo.com')} className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Login as Investor (Unverified)</button>
                    <button onClick={() => loginAs('developer@demo.com')} className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Login as Developer</button>
                    <button onClick={() => loginAs('admin@demo.com')} className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Login as Admin</button>
                </div>
            </div>
            <div className="text-sm text-center mt-4">
                <p className="text-gray-600">Don't have an account? <a href="#" onClick={() => setPage('register')} className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</a></p>
            </div>
        </AuthPage>
    );
};

export default LoginPage;

