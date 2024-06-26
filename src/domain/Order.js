class Order {
  constructor(id, userEmail, products, deliveryAddress, status, totalPrice, paymentMethod, createdAt, statusPay) {
    this.id = id;
    this.userEmail = userEmail;
    this.products = products;
    this.deliveryAddress = deliveryAddress;
    this.status = status;
    this.statusPay = statusPay;
    this.totalPrice = totalPrice;
    this.createdAt = createdAt
    this.paymentMethod = paymentMethod;
  }

  static fromFirestore(snapshot) {
    const data = snapshot.data();
    return new Order(
      snapshot.id,
      data.userEmail,
      data.products,
      data.deliveryAddress,
      data.status,
      data.statusPay,
      data.createdAt,
      data.totalPrice,
      data.paymentMethod
    );
  }
}


export { Order };
