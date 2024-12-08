import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../store/authStore';

const UserMenu = ({ show, toggleUserMenu }) => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
    };

    const getUserInitials = (name) => {
        const nameParts = name?.split(" ") || [];
        return nameParts.length > 1
            ? nameParts[0][0] + nameParts[1][0]  // First letter of first and last name
            : nameParts[0]?.substring(0, 2);      // First two letters of the first name
    };

    const handleRedirect = () => {
        if (user?.role === 'admin') {
            navigate('/admin');  // Redirect to admin page if the user is an admin
        } else {
            navigate('/dashboard');  // Otherwise, redirect to the dashboard
        }
    };

    return (
        <div className="relative">
            {isAuthenticated ? (
                <>
                    <button
                        className="flex items-center space-x-2"
                        onClick={toggleUserMenu}  // Toggle user menu visibility
                    >
                        {/* Avatar Circle with User Initials */}
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white">
                            {user?.name ? getUserInitials(user.name) : 'U'}
                        </div>
                    </button>

                    {/* Dropdown */}
                    {show && (
                        <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md">
                            <button
                                className="block w-full px-4 py-2 text-left hover:bg-gray-200"
                                onClick={handleRedirect}  // Redirect based on the user's role
                            >
                                {user?.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                            </button>
                            <button
                                className="block w-full px-4 py-2 text-left hover:bg-gray-200"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <button
                    className="login-btn-new flex items-center space-x-2"
                    onClick={() => navigate('/login')}
                >
                    <span>Login</span>
                </button>
            )}
        </div>
    );
};

export default UserMenu;
