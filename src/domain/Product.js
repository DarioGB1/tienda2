class Product {
    constructor(id, description, pictures, product_category_id, product_name, stock, unitary_price) {
        this.id = id;
        this.description = description;
        this.pictures = pictures;
        this.product_category_id = product_category_id;
        this.product_name = product_name;
        this.stock = stock;
        this.unitary_price = unitary_price;
    }
}

export { Product };