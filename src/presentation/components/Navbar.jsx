import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Search from "./Search";
import { getUserProfile } from '../../infraestructure/api/user';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import "./navbar.css";
import tuImagen from '../assets/iconoW.png';
import shoppingCartIcon from '../assets/shopping-cart.png';
import logoutIcon from '../assets/logout.png';
import defaultAvatar from '../assets/usuario.png';
import bagIcon from '../assets/bag.png';
import bellIcon from '../assets/notificacion.png';
import categoryIcon from '../assets/category.png';
import wishlistIcon from '../assets/wishlist.png'
import categoriesIcon from '../assets/categories.png'

export default function Navbar({ cartItems = [] }) {
    const totalItems = cartItems.reduce((total, item) => total + item.qty, 0);
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const profile = await getUserProfile(user.uid);
                setUserProfile(profile);
            } else {
                setUserProfile(null);
            }
        });
        return () => unsubscribe();
    }, [auth]);

    const logout = () => {
        signOut(auth);
        navigate('/login');
    };

    const handleLogoClick = () => {
        navigate('/');
        window.location.reload();
    };

    return (
        <nav className="nav">
            <div className="logo-container">
                <Link to="/" className="logo-link" onClick={handleLogoClick}>
                    <img src={tuImagen} alt="logo" className="logo-image" />
                    <span className="store-name">Saltillo</span>
                </Link>
            </div>
            <Search />
            <ul className="navegacion">
                {userProfile ? (
                    <>
                        <li>
                        <div className='wishlist'>
                                <Link to='/Category' className="wishlist-link">
                                    <img src={categoriesIcon} alt="wishlist" />
                                </Link>
                            </div>
                            {(userProfile.userTypeId === '1' || userProfile.userTypeId === '3') && (
                                <div className='wishlist'>
                                    <Link to='/wishlist' className='wishlist-link'>
                                        <img src={wishlistIcon} alt='Wishlist' />
                                    </Link>
                                </div>
                            )}
                            {userProfile.userTypeId === '2' && (
                                <div className='notifications'>
                                    <Link to='/notifications' className='notification-link'>
                                        <img src={bellIcon} alt='Notificaciones' />
                                        <span>3</span>
                                    </Link>
                                </div>
                            )}
                            <div className='cart'>
                                <Link to='/cart' className="cart-link">
                                    <img src={shoppingCartIcon} alt="Carrito" />
                                    <span>{totalItems}</span>
                                </Link>
                            </div>
                            <Link to={userProfile.userTypeId === '1' ? "/admin/AdminInfo" : "/perfil"} className="perfil-link">
                                <img src={userProfile.avatar || defaultAvatar} alt="Perfil" className="navbar-avatar" />
                            </Link>
                            <button onClick={logout} className="logout-button" title="Cerrar Sesión">
                                <img src={logoutIcon} alt="Cerrar Sesión" />
                            </button>
                        </li>
                    </>
                ) : (
                    <li className='links'>
                        <Link to="/login">Iniciar sesión</Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}
