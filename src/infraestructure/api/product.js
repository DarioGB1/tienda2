import { db } from "../firebase-connection.js";
import { Product } from "../../domain/Product.js";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { storage } from "../firebase-connection";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";



export async function getProducts() {
    const productsCollectionRef = collection(db, "products");
    const productsSnapshot = await getDocs(productsCollectionRef);
    const products = [];
    productsSnapshot.forEach((doc) => {
        const data = doc.data();
        const product = new Product(
            doc.id,
            data.description,
            data.pictures,
            data.banner_pictures,
            data.CategoryID,
            data.product_name,
            data.stock,
            data.gramaje,
            data.unitary_price,
            data.state
        );
        products.push(product);
    });
    return products;
}

export async function getProductById(productId) {
    const productDocRef = doc(db, "products", productId);
    const productDoc = await getDoc(productDocRef);
    if (!productDoc.exists()) {
        throw new Error("Product not found");
    }
    const productData = productDoc.data();
    return new Product(
        productDoc.id,
        productData.description,
        productData.pictures,
        productData.banner_pictures,
        productData.CategoryID,
        productData.product_name,
        productData.stock,
        productData.gramaje,
        productData.unitary_price,
        productDoc.state
    );
}

export async function uploadImage(file) {
    if (!file) {
        throw new Error("No file provided for upload.");
    }
    const storageRef = ref(storage, `products/${file.name}`);
    const uploadResult = await uploadBytes(storageRef, file);
    return getDownloadURL(uploadResult.ref);
}

export async function createProduct(productData, file) {
    const imageUrl = file ? await uploadImage(file) : null;

    // Determina el estado del producto basado en el stock
    const productState = productData.stock >= 1 ? "disponible" : "No disponible";

    const productDataForFirestore = {
        description: productData.description,
        pictures: imageUrl, // Asume que solo hay una imagen
        banner_pictures: imageUrl, // Puede ajustarse si manejas imágenes de banner diferentes
        CategoryID: productData.CategoryID,
        product_name: productData.product_name,
        stock: productData.stock,
        unitary_price: productData.unitary_price,
        gramaje: productData.gramaje,
        state: productState // Usamos el valor determinado basado en el stock
    };
    
    if (!productDataForFirestore.CategoryID) {
        throw new Error("CategoryID is undefined or not set.");
    }

    const productRef = await addDoc(collection(db, "products"), productDataForFirestore);
    return productRef.id;
}

export async function updateProductStock(productId, quantityPurchased) {
    const productDocRef = doc(db, "products", productId);
    const productDoc = await getDoc(productDocRef);

    if (!productDoc.exists()) {
        throw new Error("Product not found");
    }

    const productData = productDoc.data();
    const updatedStock = productData.stock - quantityPurchased;

    const product = new Product(
        productDoc.id,
        productData.description,
        productData.pictures,
        productData.banner_pictures,
        productData.CategoryID,
        productData.product_name,
        updatedStock,
        productData.gramaje,
        productData.unitary_price,
        productData.state
    );

    await updateDoc(productDocRef, product.toFirestore());
}

export async function deleteProduct(productId) {
    const productDocRef = doc(db, "products", productId);
    await deleteDoc(productDocRef);
}



export async function updateProduct(productId, updatedData) {
    const productDataForFirestore = Object.entries(updatedData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    const productDocRef = doc(db, "products", productId);
    await updateDoc(productDocRef, productDataForFirestore);
}


export async function getCategories() {
    const categoriesCollectionRef = collection(db, "product_categories");
    const categoriesSnapshot = await getDocs(categoriesCollectionRef);
    const categories = [];
    categoriesSnapshot.forEach((doc) => {
        categories.push({
            id: doc.id,
            ...doc.data()
        });
    });
    return categories;
}


export default {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock
};
