// Librerias
import express from 'express';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';

// Utils
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname } from 'path';

// Routers
import viewsRouter from './routers/views.router.js'
import productRouter from './routers/product.router.js'
import cartRouter from './routers/cart.router.js'

// Models
import { productModel } from './models/product.model.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express();
const PORT = 9090 || 3000 // Use dos ports diferentes para asegurarme que si no funciona en uno, funcione en el otro

app.use(express.json())
app.use(express.urlencoded({ extended: true  }))
app.use(express.static(__dirname + '/public'))

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

// Rutas
app.use('/', viewsRouter)
app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)

// Servidor HTTP
const httpServer = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

// Conexion con MongoDB
const URL_MONGO = "mongodb+srv://rivasmelisa2024:5QWSWPz9yAmjGbzI@cluster0.r2hms.mongodb.net/entrega?retryWrites=true&w=majority&appName=Cluster0"
const connectMongo = async () => {
    try {
        await mongoose.connect(URL_MONGO)
        console.log('Conectado usando Mongo')        
    } catch (error) {
        console.error("No se pudo conectar a la BD usando Moongose: " + error);
        process.exit();
    }   
}
connectMongo()

// Servidor WebSocket
const socketServer = new Server(httpServer)

socketServer.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado');

    // Enviar productos al cliente cuando se conecta
    const products = await productModel.find().lean(); 
    socket.emit('products', products);
    
    // Escuchar nuevo producto
    socket.on('newProduct', async (product) => {
        try {
            await productModel.create(product); 
            const updatedProducts = await productModel.find().lean();
            socketServer.emit('products', updatedProducts);
        } catch (error) {
            socket.emit('error', { message: 'Error al agregar el producto' });
        }
    });
    
    // Eliminando el producto
    socket.on('deleteProduct', async (productId) => {
        try {
            const result = await productModel.findByIdAndDelete(productId); 
            if (result) {
                const updatedProducts = await productModel.find().lean();
                socketServer.emit('products', updatedProducts);
            } else {
                socket.emit('error', { message: 'Producto no encontrado' });
            }
        } catch (error) {
            socket.emit('error', { message: 'Error al eliminar el producto' });
        }
    });

    // Actualizando el producto
    socket.on('updateProduct', async (productId, updatedProduct) => {
        if (!productId || productId === 'undefined') {
            socket.emit('error', { message: 'ID del producto no válido' });
            return;
        }
        try {
            const product = await productModel.findByIdAndUpdate(productId, updatedProduct, { new: true });
            if (product) {
                const updatedProducts = await productModel.find().lean();
                socketServer.emit('products', updatedProducts);
            } else {
                socket.emit('error', { message: 'Producto no encontrado' });
            }
        } catch (error) {
            socket.emit('error', { message: 'Error al actualizar el producto' });
        }
    }); 
})

export { socketServer }