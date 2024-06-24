import React, { useState, useEffect } from 'react';
import Carousel from "../components/Carousel.jsx";
import FlashDeals from "../components/ofertas/FlashDeals.jsx";
import { fetchRatingsForProduct } from '../../infraestructure/api/product_rating.js';
import { TailSpin } from 'react-loader-spinner';
import './home.css';
import { db } from '../../infraestructure/firebase--config.js';
import { collection, getDocs, } from 'firebase/firestore';


const Home = React.memo(({ productos, addtoCart }) => {
    const [recentProducts, setRecentProducts] = useState([]);
    const [topRatedProducts, setTopRatedProducts] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (productos.length > 0) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [productos]);

    const loadData = async () => {
        try {
            await Promise.all([
                fetchRecentProducts(),
                fetchTopRatedProducts(),
                fetchBestSellingProducts()
            ]);
        } catch (err) {
            setError('Error loading data');
        }
        setLoading(false);
    };

    const fetchRecentProducts = async () => {
        setRecentProducts([...productos]
            .filter(product => product.date_added)
            .sort((a, b) =>
                new Date(b.date_added) - new Date(a.date_added)
            )
            .slice(0, 10)
        );
    };

    const fetchTopRatedProducts = async () => {
        const productsWithRatings = await Promise.all(
            productos.map(async product => ({
                ...product,
                averageRating: await fetchRatingsForProduct(product.id) || 0
            }))
        );
        setTopRatedProducts(
            productsWithRatings
                .filter(result => result)
                .sort((a, b) => b.averageRating - a.averageRating)
                .slice(0, 10)
        );
    };

    const fetchBestSellingProducts = async () => {
        try {
            const ordersCollectionRef = collection(db, 'orders');
            const ordersSnapshot = await getDocs(ordersCollectionRef);
            const productSales = {};

            // Acumular las ventas por producto
            ordersSnapshot.forEach(orderDoc => {
                const orderData = orderDoc.data();
                orderData.products.forEach(product => {
                    const productId = product.productId;
                    const quantity = product.quantity;

                    if (productId && quantity != null) {  // Asegurarse de que productId y quantity son válidos
                        if (!productSales[productId]) {
                            productSales[productId] = 0;
                        }
                        productSales[productId] += quantity;
                    }
                });
            });

            // Crear lista de productos con cantidades vendidas
            const productList = Object.keys(productSales).map(productId => ({
                productId,
                quantitySold: productSales[productId]
            }));

            // Ordenar por cantidad vendida
            productList.sort((a, b) => b.quantitySold - a.quantitySold);

            // Seleccionar los 10 productos más vendidos
            const top10Products = productList.slice(0, 10);
            const additionalProducts = shuffleArray(productos.filter(p => !top10Products.map(product => product.productId).includes(p.id))).slice(0, 10);

            // Usar productos ya cargados si es posible
            const combinedProducts = [...top10Products.map(product => {
                const foundProduct = productos.find(p => p.id === product.productId);
                return foundProduct ? { ...foundProduct, quantitySold: product.quantitySold } : null;
            }), ...additionalProducts].filter(product => product !== null);

            setBestSellingProducts(combinedProducts);
        } catch (error) {
            console.error("Error fetching best selling products:", error);
            setError('Error loading best selling products data');
        }
        setLoading(false);
    };

    // Función para mezclar los elementos de un arreglo al azar
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    

    if (loading) {
        return (
            <div className="loading-container">
                <TailSpin color="#CD5454" height={50} width={50} />
            </div>
        );
    }
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='container'>
            <Carousel />
            <FlashDeals productItems={recentProducts} productos={recentProducts} addtoCart={addtoCart} titulo="Recién Añadidos" />
            <FlashDeals productItems={topRatedProducts} productos={topRatedProducts} addtoCart={addtoCart} titulo="Mejor Puntuados" />
            <FlashDeals productItems={bestSellingProducts} productos={bestSellingProducts} addtoCart={addtoCart} titulo="Más Vendidos" />

            <div className="contenedorr">
                <div className="square colegio">
                    <span className='span'></span>
                    <span className='span'></span>
                    <span className='span'></span>
                    <div className="containerr">
                        <h2>Entrega Rápida</h2>
                        <h3>+10 Rutas</h3>
                        <p>Tu pedido en la puerta, rápido y seguro</p>
                    </div>
                </div>
                <div className="square colegio">
                    <span className='span'></span>
                    <span className='span'></span>
                    <span className='span'></span>
                    <div className="containerr">
                        <h2>Innovación en Compras</h2>
                        <h3>+10 Inversionistas</h3>
                        <p>Innovando el comercio digital con apoyo sólido.</p>
                    </div>
                </div>
                <div className="square colegio">
                    <span className='span'></span>
                    <span className='span'></span>
                    <span className='span'></span>
                    <div className="containerr">
                        <h2 className='h2'>Líder en Bolivia</h2>
                        <h3 className='h3'>N° 1</h3>
                        <p className='p'>El mejor en E-commerce, reconocido y fiable.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
)
export default Home