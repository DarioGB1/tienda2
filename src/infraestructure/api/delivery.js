import { db } from '../firebase-connection.js';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Delivery } from '../../domain/Delivery.js';

export async function getDeliveries() {
    const deliveriesCollectionRef = collection(db, 'deliveries');
    const deliveriesSnapshot = await getDocs(deliveriesCollectionRef);
    const deliveries = [];
    deliveriesSnapshot.forEach((doc) => {
        const data = doc.data();
        const delivery = new Delivery(
            doc.id,
            data.user_id,
            data.delivered,
            data.delivery_address,
            data.delivery_detail_id
        );
        deliveries.push(delivery);
    })
    return deliveries;
}

export async function getDeliveryById(deliveryId) {
    const deliveryDocRef = doc(db, 'deliveries', deliveryId);
    const deliveryDoc = await getDoc(deliveryDocRef);
    if (!deliveryDoc.exists()) throw new Error('Delivery not found');
    return new Delivery(
        deliveryDoc.id,
        deliveryDoc.data().user_id,
        deliveryDoc.data().delivered,
        deliveryDoc.data().delivery_address,
        deliveryDoc.data().delivery_detail_id
    );
}

export async function createDelivery(deliveryData) {
    const newDelivery = new Delivery(
        null,
        deliveryData.user_id,
        deliveryData.delivered,
        deliveryData.delivery_address,
        deliveryData.delivery_detail_id
    );

    const deliveryDataForFirestore = newDelivery.toFirestore();
    const docRef = await addDoc(collection(db, 'deliveries'), deliveryDataForFirestore);
    newDelivery.id = docRef.id;
    return docRef.id;
}

export async function updateDelivery(delivery_id, updatedData) {
    const deliveryDataForFirestore = Object.entries(updatedData).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value;
        return acc;
    }, {});

    await updateDoc(doc(db, 'deliveries', delivery_id), deliveryDataForFirestore);
}

export async function deleteDelivery(delivery_id) {
    const delivertDocRef = doc(db, 'deliveries', delivery_id)
    await deleteDoc(delivertDocRef);
}

export default {
    getDeliveries,
    getDeliveryById,
    createDelivery,
    updateDelivery,
    deleteDelivery
};