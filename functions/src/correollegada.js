const functions = require("firebase-functions");
const {admin} = require("../firebaseAdmin.js");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const path = require("path");
const os = require("os");
const fs = require("fs");

// Configuración de Nodemailer para enviar correos
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: functions.config().gmail.user,
    pass: functions.config().gmail.pass,
  },
});

exports.sendDeliveryConfirmation = functions.firestore.document("orders/{orderId}").onUpdate(async (change, context) => {
  const orderData = change.after.data();
  const orderId = context.params.orderId;

  // Verifica si el estado del pedido es "Entregado"
  if (orderData.status !== "Entregado" && orderData.status !== "Parcialmente devuelto") {
    return null;
  }

  // Verifica si el pedido fue "Parcialmente devuelto" y si la factura necesita actualización
  if (orderData.status === "Parcialmente devuelto" && !orderData.invoiceUpdated) {
    const invoiceRef = admin.firestore().doc(`invoices/${orderId}`);
    const invoiceSnap = await invoiceRef.get();

    if (invoiceSnap.exists && invoiceSnap.data().status !== "Anulado") {
      const invoiceData = invoiceSnap.data();

      // Anular la factura antigua
      await invoiceRef.update({status: "Anulado"});

      // Crear y guardar la nueva factura actualizada
      const newInvoiceRef = admin.firestore().doc(`invoices/${orderId}_updated`);
      const newInvoiceData = {
        ...invoiceData,
        status: "Activo",
        updatedAt: new Date(),
        invoiceId: `${orderId}_updated`,
      };

      await newInvoiceRef.set(newInvoiceData);

      // Generar PDF de la nueva factura
      const pdfPath = path.join(os.tmpdir(), `${orderId}_updated.pdf`);
      const writeStream = fs.createWriteStream(pdfPath);
      const pdfDoc = new PDFDocument({margin: 50});

      pdfDoc.pipe(writeStream);
      pdfDoc.fontSize(20).text("Factura Actualizada", {underline: true});
      pdfDoc.fontSize(14).text(`Pedido ID: ${orderId}`, {align: "right"});
      pdfDoc.text(`Fecha: ${new Date().toLocaleDateString()}`, {align: "right"});
      pdfDoc.moveDown();
      pdfDoc.fontSize(12).text(`Cliente: ${orderData.userEmail}`);
      pdfDoc.text(`Total: $${orderData.totalPrice.toFixed(2)}`, {align: "right"});
      pdfDoc.moveDown().fontSize(10);
      pdfDoc.text("Detalles del Producto:", {underline: true});
      orderData.products.forEach((product) => {
        pdfDoc.text(`${product.name} - Cantidad: ${product.quantity}, Precio Unitario: $${product.unitPrice.toFixed(2)}, Subtotal: $${(product.quantity * product.unitPrice).toFixed(2)}`);
      });
      pdfDoc.end();

      await new Promise((resolve) => writeStream.on("finish", resolve));

      // Marcar la factura como actualizada en los datos del pedido
      await admin.firestore().collection("orders").doc(orderId).update({invoiceUpdated: true});

      // HTML del correo para la factura actualizada
      const mailHtml = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px; }
            .container { background-color: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .header { background-color: #007BFF; color: #ffffff; padding: 10px 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { margin-top: 20px; text-align: center; }
            .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 12px; text-align: center; color: #666; }
            .button { background-color: #28a745; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Factura Actualizada</h1>
            </div>
            <div class="content">
              <p>Estimado cliente,</p>
              <p>Su factura ha sido actualizada debido a los cambios en su pedido. Adjuntamos su nueva factura en formato PDF.</p>
              <p>Por favor, revise los detalles y contáctenos si tiene preguntas.</p>
            </div>
            <div class="footer">
              <p>Gracias por su confianza,</p>
              <p><strong>Su Empresa de Confianza</strong></p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: "ecommercesantillo@gmail.com",
        to: orderData.userEmail,
        subject: "Su Factura Actualizada",
        html: mailHtml,
        attachments: [{
          filename: `${orderId}_updated.pdf`,
          path: pdfPath,
          contentType: "application/pdf",
        }],
      };

      await transporter.sendMail(mailOptions);
      console.log("Correo de factura actualizada enviado con éxito.");
    }
  }

  // Preparar y enviar HTML para la confirmación de entrega
  const deliveryHtml = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px; }
        .container { background-color: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .header { background-color: #007BFF; color: #ffffff; padding: 10px 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { margin-top: 20px; text-align: center; }
        .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 12px; text-align: center; color: #666; }
        .button { background-color: #28a745; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Pedido Entregado!</h1>
        </div>
        <div class="content">
          <p>Hola, tu pedido con ID <strong>${orderId}</strong> ha sido entregado exitosamente.</p>
          <a href="https://tienda-fa7e8.web.app/orders/${orderId}" class="button">Ver Detalle del Pedido</a>
        </div>
        <div class="footer">
          <p>Gracias por comprar con nosotros. Esperamos verte pronto.</p>
          <p><strong>Tu Empresa de Confianza</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: "ecommercesantillo@gmail.com",
    to: orderData.userEmail,
    subject: "¡Tu Pedido ha sido Entregado!",
    html: deliveryHtml,
  });

  console.log("Correo de entrega enviado con éxito.");
  return null;
});
