import './home.css'
import React, { useState } from 'react';
import Carousel from "../components/Carousel.jsx";
import FlashDeals from "../components/ofertas/FlashDeals.jsx";
import AddProductForm from './addProductform.jsx';
import { Link } from 'react-router-dom';


// eslint-disable-next-line react/prop-types
export default function Home({productItems, productos}) {
    const [showForm, setShowForm] = useState(false);

    return <div className='container'>
        <Carousel/>
        <FlashDeals productItems={productItems} productos={productos} titulo="recien añadidos"/>
        <FlashDeals productItems={productItems} productos={productos} titulo="Mas puntuado"/>
        <FlashDeals productItems={productItems} productos={productos} titulo="Mas vendidos"/>
        <div className="add-product-link">
            <Link to="/addproduct">Agregar Producto</Link>
        </div>
    </div>
}
