import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../../../infraestructure/api/orders';
import { getUserProfileByEmail } from '../../../../infraestructure/api/user';
import { formatRelative } from 'date-fns';
import { TailSpin } from 'react-loader-spinner';
import './delivery.css';
import whatsappIcon from '../../../assets/whatsapp.png';
import googleMapsIcon from '../../../assets/google-maps.png';
import deliveryIcon from '../../../assets/delivery.png';

function DeliveryDetailsPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        async function fetchOrder() {
            try {
                const fetchedOrder = await getOrderById(orderId);
                if (fetchedOrder.createdAt && fetchedOrder.userEmail) {
                    const date = new Date(fetchedOrder.createdAt.seconds * 1000);
                    const userDetails = await getUserProfileByEmail(fetchedOrder.userEmail);
                    
                    const hasAllProductsReturned = fetchedOrder.products.every(product => product.returned);
                    const hasSomeProductsReturned = fetchedOrder.products.some(product => product.returned && !hasAllProductsReturned);

                    setOrder({
                        ...fetchedOrder,
                        formattedDate: formatRelative(date, new Date()),
                        userName: userDetails ? userDetails.names : 'Nombre no disponible',
                        userPhone: userDetails ? userDetails.numero : 'Número no disponible',
                        allProductsReturned: hasAllProductsReturned,
                        someProductsReturned: hasSomeProductsReturned
                    });
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            }
        }

        fetchOrder();
    }, [orderId]);

    const handleDelivered = async () => {
        if (order.allProductsReturned) {
            alert("No se puede marcar como entregado porque todos los productos han sido devueltos.");
            return;
        }
        try {
            await updateOrderStatus(orderId, 'Entregado');
            navigate('/');
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const openGoogleMaps = (address) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    };

    const openWhatsApp = (number) => {
        if (!number) {
            console.error("Número de teléfono no disponible");
            return;
        }
        const cleanNumber = number.replace(/[^0-9]/g, ''); // Elimina cualquier carácter no numérico
        const fullNumber = `591${cleanNumber}`; // Añade el código de país de Bolivia si es necesario
        window.open(`https://wa.me/${fullNumber}`, '_blank');
    };

    if (!order) return <div className="delivery-loader"><TailSpin color="#CD5454" height={80} width={80} /></div>;

    return (
        <div className="delivery-details-container">
            <h1 className="delivery-details-header">Detalles del Pedido</h1>
            <div className="delivery-details-content">
                <p className="delivery-order-id"><strong>ID del Pedido:</strong> {orderId}</p>
                <p className="delivery-order-total"><strong>Total:</strong> Bs {order.totalPrice.toFixed(2)}</p>
                <p className="delivery-address"><strong>Dirección del Cliente:</strong> {order.deliveryAddress}</p>
                <button className="delivery-button google-maps-button" onClick={() => openGoogleMaps(order.deliveryAddress)}>
                    <img src={googleMapsIcon} alt="Google Maps" className="delivery-button-icon" /> Ir a Google Maps
                </button>
                <p className="delivery-customer-name"><strong>Nombre del Cliente:</strong> {order.userName}</p>
                <p className="delivery-customer-phone"><strong>Celular del Cliente:</strong> {order.userPhone}</p>
                <button className="delivery-button whatsapp-button" onClick={() => openWhatsApp(order.userPhone)}>
                    <img src={whatsappIcon} alt="WhatsApp" className="delivery-button-icon" /> Contactar por WhatsApp
                </button>
                <p className="delivery-order-date"><strong>Ordenado:</strong> {order.formattedDate}</p>
                <p className="delivery-status"><strong>Estado:</strong> {order.allProductsReturned ? 'Devuelto' : order.someProductsReturned ? 'Parcialmente Devuelto' : 'En proceso'}</p>
                {!order.allProductsReturned && (
                    <button className="delivery-button delivered-button" onClick={handleDelivered}>
                        <img src={deliveryIcon} alt="Delivered" className="delivery-button-icon" /> Marcar como Entregado
                    </button>
                )}
            </div>
        </div>
    );

}

export default DeliveryDetailsPage;
