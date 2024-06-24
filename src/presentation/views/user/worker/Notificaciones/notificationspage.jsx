import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingOrders, getReturnRequests, handleReturnRequest, acceptOrder } from '../../../../../infraestructure/api/orders';
import { getProductById } from '../../../../../infraestructure/api/product';
import { useAuth } from '../../../../components/context/AuthContext';
import "./NotificationsPage.css";
import { getUserProfileByEmail } from '../../../../../infraestructure/api/user';

function NotificationsPage() {
    const [orders, setOrders] = useState([]);
    const [returnRequests, setReturnRequests] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingReturns, setLoadingReturns] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoadingOrders(true);
            setLoadingReturns(true);
            await fetchOrders();
            await fetchReturnRequests();
            setLoadingOrders(false);
            setLoadingReturns(false);
        };
        fetchData();
    }, []);

    const fetchOrders = async () => {
        try {
            const pendingOrders = await getPendingOrders();
            const formattedOrders = pendingOrders.map(order => ({
                ...order,
                createdAt: new Date(order.createdAt.seconds * 1000).toLocaleString()
            }));
            setOrders(formattedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error("Error fetching pending orders:", error);
        }
    };

    const fetchReturnRequests = async () => {
        try {
            const data = await getReturnRequests();
            const requestsWithProductDetails = await Promise.all(data.map(async request => {
                const productDetails = await getProductById(request.productId);
                const userDetails = await getUserProfileByEmail(request.userEmail);

                // Asumiendo que `request.requestedAt` es una cadena en formato ISO
                const requestedAtDate = new Date(request.requestedAt); // Convierte la cadena ISO a un objeto Date
                const formattedRequestedAt = requestedAtDate.toLocaleString(); // Formatea la fecha localmente

                return {
                    ...request,
                    productName: productDetails.product_name,
                    productDescription: productDetails.description,
                    productImage: productDetails.pictures,
                    userPhone: userDetails.numero,
                    requestedAt: formattedRequestedAt
                };
            }));
            setReturnRequests(requestsWithProductDetails);
            console.log(requestsWithProductDetails);
        } catch (error) {
            console.error("Error fetching return requests:", error);
        }
    };



    const handleAccept = async (orderId) => {
        try {
            const result = await acceptOrder(orderId, currentUser.uid);
            if (result.success) {
                fetchOrders(); // Refrescar las órdenes después de aceptar una
                navigate(`/delivery/${orderId}`);
            }
        } catch (error) {
            console.error("Error accepting order:", error);
        }
    };

    const handleReturnRequestAction = async (orderId, productId, action) => {
        try {
            const result = await handleReturnRequest(orderId, productId, action, currentUser.uid);
            if (result.success) {
                fetchReturnRequests(); // Refrescar las solicitudes de devolución
            }
        } catch (error) {
            console.error(`Error handling return request (${action}):`, error);
        }
    };

    if (loadingOrders || loadingReturns) {
        return <div className="loading">Loading...</div>;
    }

    const openMap = (address) => {
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(mapUrl, '_blank');
    };

    const openWhatsApp = (number) => {
        if (!number) {
            console.error("Número de teléfono no disponible");
            return;
        }
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const fullNumber = `591${cleanNumber}`;
        window.open(`https://wa.me/${fullNumber}`, '_blank');
    };

    if (loadingOrders || loadingReturns) {
        return <div className="loading">Cargando...</div>;
    }


    return (
        <div className="notifications-page">
            <h1 className="page-title">Notificacion</h1>
            <div className="notifications-container">
                <div className="orders-section">
                    <h2 className="section-title">Orden pendiente</h2>
                    {orders.length > 0 ? (
                        <ul className="order-list">
                            {orders.map(order => (
                                <li key={order.id} className="order-item">
                                    <div className="order-details">
                                        <p className="order-id"><strong>Order ID:</strong> {order.id}</p>
                                        <p className="order-total"><strong>Total:</strong> Bs {order.totalPrice.toFixed(2)}</p>
                                        <p className="order-time"><strong>Tiempo Ordenado:</strong> {order.createdAt}</p>
                                        <p className="order-address"><strong>Direccion:</strong> {order.deliveryAddress}</p>
                                        <button className="button accept-button" onClick={() => handleAccept(order.id)}>Aceptar orden</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="no-orders">No hay ordenes pendientes</p>}
                </div>
                <div className="returns-section">
                    <h2 className="section-title">Peticion de devolucion</h2>
                    {returnRequests.length > 0 ? (
                        <ul className="return-list">
                            {returnRequests.map(request => (
                                <li key={request.id} className="return-item">
                                    <div className="return-details">
                                        <p className="return-id"><strong>Orden ID:</strong> {request.id}</p>
                                        <p className="return-total"><strong>Total:</strong> Bs{request.totalPrice.toFixed(2)}</p>
                                        <p className="return-time"><strong>Fecha:</strong>{request.requestedAt}</p>
                                        <p className="return-email"><strong>Email:</strong> {request.userEmail}</p>
                                        <p className="return-address"><strong>Direccion:</strong> {request.deliveryAddress}</p>
                                        <div className="return-products">
                                            <h3 className="products-title">Producto para retorno</h3>
                                            <ul className="products-list">
                                                <li className="product-item">
                                                    <img src={request.productImage} alt={request.productName} className="product-images" />
                                                    <p className="product-namen"><strong>{request.productName}</strong></p>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="botoness">
                                            <button className="button map-button" onClick={() => openMap(request.deliveryAddress)}>Ver en Maps</button>
                                            <button className="button whatsappp-button" onClick={() => openWhatsApp(request.userPhone)}>Contactar en WhatsApp</button>
                                            <button className="button accept-button" onClick={() => handleReturnRequestAction(request.orderId, request.productId, 'accept')}>Aceptar devolucion</button>
                                            <button className="button reject-button" onClick={() => handleReturnRequestAction(request.orderId, request.productId, 'reject')}>Denegar devolucion</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="no-returns">No hay devoluciones pendientes</p>}
                </div>
            </div>
        </div>
    );
}

export default NotificationsPage;
