import React from 'react';
import SearchedProductCard from './SearchedProductCard'; // Ajusta la ruta según tu estructura de archivo
import {useSearchedProducts} from "../../../infraestructure/api/searchedproducts.jsx";

export default function SearchesPage({addtoCart}) {
    const { searchedProducts } = useSearchedProducts();

    if (searchedProducts.length === 0) return <div>No hay productos similares a tu búsqueda.</div>;


    return (
        <div className="searches-page-container">
            {searchedProducts.map((product) => (
                <SearchedProductCard
                    key={product.id}
                    product={product}
                    addtoCart={addtoCart}
                />
            ))}
        </div>
    );
}