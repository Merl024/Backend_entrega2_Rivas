import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import ProductManager from './ProductManager.js'

class CartManager {
    constructor(path) {
        this.path = path
        this.initializeFile()
        this.productManager = new ProductManager('./productos.json')
    }
    
    async initializeFile() {
        try {
            await fs.access(this.path)
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(this.path, '[]')
            } else {
                throw error
            }
        }
    }
    
    async getCarts() {
        try {
            const carts = await fs.readFile(this.path, 'utf8')
            return JSON.parse(carts)
        } catch (error) {
            console.error('Error leyendo los carritos', error)
            return []
        }
    }
    
    async getCart(cartId) {
        const carts = await this.getCarts()
        const cart = carts.find(c => c.id === cartId)
        if (!cart) {
            throw new Error('El carrito no existe')
        }
        return cart
    }
    
    async postCart(){
        try{
            const cartId = uuidv4()
            const cart = {id: cartId, products: []}
            const carts = await this.getCarts()
            carts.push(cart)
            await fs.writeFile(this.path, JSON.stringify(carts, null, 2))
            return cart
        } catch(err){
            console.error('Error creando el carrito:', err)
            throw new Error('Error al crear el carrito')
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const carts = await this.getCarts()
            const cartIndex = carts.findIndex(c => c.id === cartId)
            
            if (cartIndex === -1) {
                throw new Error('El carrito no existe')
            }

            // Verificar si el producto existe
            const product = await this.productManager.getProductsById(productId)
            if (!product) {
                throw new Error('El producto no existe')
            }

            const cart = carts[cartIndex]
            const existingProductIndex = cart.products.findIndex(p => p.id === productId)

            if (existingProductIndex !== -1) {
                // Si el producto ya está en el carrito, incrementa la cantidad
                cart.products[existingProductIndex].quantity++
            } else {
                // Si el producto no está en el carrito, lo agrega
                cart.products.push({ id: productId, quantity: 1 })
            }

            await fs.writeFile(this.path, JSON.stringify(carts, null, 2))
            return cart
        } catch (err) {
            console.error('Error agregando producto al carrito:', err)
            throw new Error('Error al agregar producto al carrito')
        }
    }
}

export default CartManager