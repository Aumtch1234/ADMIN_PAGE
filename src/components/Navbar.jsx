import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function Navbar() {
    const token = localStorage.getItem('token');
    let role = null;

    if (token) {
        try {
            const decoded = jwtDecode(token);
            role = decoded.role;
        } catch (err) {
            console.error('Invalid token', err);
        }
    }

    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <span className="font-bold text-blue-700">
                    {role === 'm_admin' ? 'ADMIN MASTER' : 'Admin Dashboard'}
                </span>
            </div>
            <div className="space-x-4">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/foods">FOODS</Link>
                <Link to="/users">USERS</Link>
                <Link to="/riders">RIDERS</Link>
                <Link to="/approve">Approve</Link>
            
                {role === 'm_admin' && (
                    <>
                        <Link to="/pending-admin">Pending Admin</Link>
                        <Link to="/add-admin">Add Admin</Link>
                    </>
                )}
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }}
                    className="text-red-400 hover:underline"
                >
                    Logout
                </button>
            </div>
        </nav>

    );
}
