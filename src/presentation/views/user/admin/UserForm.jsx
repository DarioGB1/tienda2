import React, { useState, useEffect } from "react";
import { db, storage, auth } from "../../../../infraestructure/firebase--config.js";
import { createUser as createFirestoreUser, getUserTypes, ADMIN_ID, WORKER_ID } from "../../../../infraestructure/api/user.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import './userform.css';

const UserForm = () => {
    const [user, setUser] = useState({
        address: "",
        birthday_date: "",
        ci: "",
        email: "",
        gender: "",
        names: "",
        lastnames: "",
        userTypeId: "",
        password: "",
    });
    const [userTypes, setUserTypes] = useState([]);
    const [file, setFile] = useState(null);

    useEffect(() => {
        const fetchUserTypes = async () => {
            try {
                const types = await getUserTypes();
                const filteredTypes = types.filter(type => type.userTypeId === `${ADMIN_ID}` || type.userTypeId === `${WORKER_ID}`);
                setUserTypes(filteredTypes);
            } catch (error) {
                console.error('Error al obtener los tipos de usuario:', error);
            }
        };
        fetchUserTypes();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFile(files[0]);
        } else {
            setUser({
                ...user,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación adicional antes de enviar el formulario
        if (user.names.length > 20) {
            alert('El nombre no debe exceder los 20 caracteres.');
            return;
        }
        if (user.lastnames.length > 20) {
            alert('El apellido no debe exceder los 20 caracteres.');
            return;
        }
        if (user.email.length > 20) {
            alert('El correo electrónico no debe exceder los 20 caracteres.');
            return;
        }
        if (user.password.length > 20) {
            alert('La contraseña no debe exceder los 20 caracteres.');
            return;
        }
        if (user.ci.length > 9) {
            alert('El CI no debe exceder los 9 caracteres.');
            return;
        }
        if (user.address.length > 50) {
            alert('La dirección no debe exceder los 50 caracteres.');
            return;
        }
        if (![`${ADMIN_ID}`, `${WORKER_ID}`].includes(user.userTypeId)) {
            alert("Tipo de usuario no válido.");
            return;
        }
        if (file && !file.type.startsWith("image/")) {
            alert("Solo se pueden subir imágenes.");
            return;
        }

        let pictureURL = "";
        if (file) {
            const fileRef = ref(storage, `profile_pictures/${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            pictureURL = await getDownloadURL(snapshot.ref);
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
            const userId = userCredential.user.uid;

            const newUser = {
                ...user,
                uid: userId,
                picture: pictureURL
            };

            await createFirestoreUser(newUser);
            alert("Usuario creado con éxito");
        } catch (error) {
            console.error('Error al crear el usuario:', error);
            alert("Error al crear el usuario: " + error.message);
        }
    };

    return (
        <form className="user-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">
                    Nombres:
                    <input className="form-input" type="text" name="names" value={user.names} onChange={handleChange} maxLength="20" required />
                </label>
            </div>
            <div className="form-group">
                <label className="form-label">
                    Apellidos:
                    <input className="form-input" type="text" name="lastnames" value={user.lastnames} onChange={handleChange} maxLength="20" required />
                </label>
            </div>
            <div className="form-group">
                <label className="form-label">
                    Correo Electrónico:
                    <input className="form-input" type="email" name="email" value={user.email} onChange={handleChange} maxLength="20" required />
                </label>
            </div>
            <div className="form-group">
                <label className="form-label">
                    Contraseña:
                    <input className="form-input" type="password" name="password" value={user.password} onChange={handleChange} maxLength="20" required />
                </label>
            </div>
            <div className="form-group">
                <label className="form-label">
                    CI:
                    <input className="form-input" type="text" name="ci" value={user.ci} onChange={handleChange} maxLength="9" required />
                </label>
            </div>
            <div className="form-group">
                <label className="form-label">
                    Dirección:
                    <input className="form-input" type="text" name="address" value={user.address} onChange={handleChange} maxLength="50" required />
                </label>
            </div>
            <div className="form-group">
                <label className="form-label">
                    Fecha de Nacimiento:
                    <input className="form-input" type="date" name="birthday_date" value={user.birthday_date} onChange={handleChange} required />
                </label>
            </div>
            <div className="form-group">
                <label className="form-label">
                    Género:
                    <select className="form-select" name="gender" value={user.gender} onChange={handleChange} required>
                        <option value="">Seleccionar</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                    </select>
                </label>
            </div>
            <div className="form-group">
                <label className="form-label">
                    Tipo de Usuario:
                    <select className="form-select" name="userTypeId" value={user.userTypeId} onChange={handleChange} required>
                        <option value="">Seleccionar Tipo</option>
                        {userTypes.map((type) => (
                            <option key={type.userTypeId} value={type.userTypeId}>
                                {type.nombre}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="form-group">
                <label className="form-label">
                    Imagen:
                    <input className="form-input" type="file" name="picture" accept="image/*" onChange={handleChange} required />
                </label>
            </div>
            <div className="form-actions">
                <button className="form-button" type="submit">Crear Usuario</button>
            </div>
        </form>
    );
};

export default UserForm;
