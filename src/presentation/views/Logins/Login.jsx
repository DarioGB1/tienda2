import React, { useEffect, useState } from 'react';
import './styles.css';
import { TailSpin } from 'react-loader-spinner';
import { Link, useNavigate } from 'react-router-dom';
import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    getRedirectResult
} from 'firebase/auth';
import { getUserProfile, createUser } from '../../../infraestructure/api/user';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'material-icons/iconfont/material-icons.css';
import inicioimagen from '../../assets/signin-image.jpg';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getRedirectResult(auth).then(result => {
            if (result) {
                const user = result.user;
                manageUserProfile(user);
            } else {
                setLoading(false);
            }
        }).catch(error => {
            console.error("Redirect Auth Error:", error);
            toast.error(`Redirect Auth Error: ${error.message}`);
            setLoading(false);
        });
    }, []);

    const handleEmailChange = (event) => setEmail(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);

    const loginUser = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await manageUserProfile(userCredential.user);
        } catch (error) {
            console.error("Login Error:", error);
            toast.error(`Login Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const manageUserProfile = async (user) => {
        if (!user) return;
        try {
            const userProfile = await getUserProfile(user.uid);
            if (!userProfile) {
                await createUser({
                    uid: user.uid,
                    email: user.email,
                    names: user.displayName || "",
                    avatar: user.photoURL || "",
                    gender: "",
                    numero: "",
                    birthday_date: "",
                    address: "",
                    ci: "",
                    userTypeId: '3' // Adjust as necessary
                });
                toast.success("New user profile created.");
            }
            navigate("/"); // Navigate to the main page
            window.location.reload();
        } catch (error) {
            console.error("Error managing user profile:", error);
            toast.error(`Error managing user profile: ${error.message}`);
        }
    };

    const handleSignInWithGoogle = () => {
        setLoading(true);
        signInWithPopup(auth, new GoogleAuthProvider())
            .then((result) => {
                // Procesar el perfil del usuario después del inicio de sesión exitoso
                manageUserProfile(result.user);
            })
            .catch((error) => {
                console.error("Google Sign In Error:", error);
                toast.error(`Google Sign In Error: ${error.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleSignInWithFacebook = () => {
        setLoading(true);
        signInWithPopup(auth, new FacebookAuthProvider())
            .then((result) => {
                // Procesar el perfil del usuario después del inicio de sesión exitoso
                manageUserProfile(result.user);
            })
            .catch((error) => {
                console.error("Facebook Sign In Error:", error);
                toast.error(`Facebook Sign In Error: ${error.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <section className="sign-in">
            <ToastContainer />
            <div className="containere">
                <div className="signin-content">
                    <div className="signin-image">
                        <figure><img className='imgrl' src={inicioimagen} alt="Sign in" /></figure>
                        <Link to="/registrarse" className="signup-image-link">¿Aún no tienes una cuenta? Registrarse</Link>
                    </div>
                    <div className="signin-form">
                        <h2 className='form-title'>Iniciar sesión</h2>
                        <form id="login-form" className='register-form' onSubmit={loginUser}>
                            <div className="form-group">
                                <label className='labellr' htmlFor="your_name"><i className="zmdi zmdi-email"></i></label>
                                <input
                                    id='your_name'
                                    name="your_name"
                                    type="email"
                                    className='inputrl'
                                    placeholder="Correo"
                                    required
                                    value={email}
                                    onChange={handleEmailChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className='labellr' htmlFor="your_pass"><i className="zmdi zmdi-lock"></i></label>
                                <input
                                    type="password"
                                    id="your_pass"
                                    name="your_pass"
                                    className='inputrl'
                                    placeholder="Contraseña"
                                    required
                                    value={password}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                            <div className="form-group form-button">
                                <input type="submit" name="signin" id="signin" className="form-submit" value="Iniciar sesión" />
                            </div>
                        </form>

                        <div className="social-login">
                            <span className="social-label">O inicia sesión con</span>
                            <ul className="socials">
                                <li><a onClick={handleSignInWithFacebook}><i className="display-flex-center zmdi zmdi-facebook"></i></a></li>
                                <li><a onClick={handleSignInWithGoogle}><i className="display-flex-center zmdi zmdi-google"></i></a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            {loading && <div className="spinner-container">
                <TailSpin color="#CD5454" height={50} width={50} />
            </div>}
        </section>
    );
}

export default Login;
