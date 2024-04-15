import React from 'react';
import './navbar.css'; // Asegúrate de tener este archivo CSS en la ruta correcta

export default function Search() {
    return (
        <section className="search">
            <div className="search__container">
                <input className="search__input" type="text" placeholder="Search"/>
            </div>
        </section>
    );
}
