import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname } from 'path';
import viewsRouter from './routers/views.router.js'
import productRouter from './routers/product.router.js'
import ProductManager from './managers/ProductManager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express();
const productManager = new ProductManager('./productos.json')
const PORT = process.env.PORT || 8080

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

// Servidor HTTP
const httpServer = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

// Servidor WebSocket
const socketServer = new Server(httpServer)

socketServer.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado');

    // Enviar productos al cliente cuando se conecta
    const products = await productManager.getProducts()
    socket.emit('products', products)
    
    // Escuchar nuevo producto
    socket.on('newProduct', async (product) => {
        try {
            await productManager.agregarProductos(product)
            const updatedProducts = await productManager.getProducts()
            socketServer.emit('products', updatedProducts)
        } catch (error) {
            socket.emit('error', { message: 'Error al agregar el producto' })
        }
    })

    // Escuchar eliminación de producto
    socket.on('deleteProduct', async (productId) => {
        try {
            const result = await productManager.deleteProduct(productId)
            if (result) {
                const updatedProducts = await productManager.getProducts()
                socketServer.emit('products', updatedProducts)
            } else {
                socket.emit('error', { message: 'Producto no encontrado' })
            }
        } catch (error) {
            socket.emit('error', { message: 'Error al eliminar el producto' })
        }
    })

    socket.on('updateProduct', async (productId, updatedProduct) => {
        try {
            const product = await productManager.updateProduct(productId, updatedProduct)
            if (product) {
                const updatedProducts = await productManager.getProducts()
                socketServer.emit('products', updatedProducts)
            } else {
                socket.emit('error', { message: 'Producto no encontrado' })
            }
        } catch (error) {
            socket.emit('error', { message: 'Error al actualizar el producto' })
        }
    })    
})

export { socketServer }