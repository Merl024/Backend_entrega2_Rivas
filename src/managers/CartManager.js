import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import ProductManager from './ProductManager.js';

const productManager = new ProductManager('products.json');

class CartManager {
    constructor(path) {
        this.path = path;
        this.initializeFile();
    }

    async initializeFile() {
        try {
            await fs.access(this.path);
        } catch {
            // Si el archivo no existe, créalo con un array vacío
            await fs.writeFile(this.path, '[]');
        }
    }

    async getCarts() {
        try {
            const carts = await fs.readFile(this.path, 'utf8');
            return JSON.parse(carts);
        } catch (error) {
            console.error('Error leyendo los carritos:', error);
            return [];
        }
    }

    async getCart(cartId) {
        const carts = await this.getCarts();
        const cart = carts.find(c => c.id === cartId);
        return cart || null;
    }

    async createCart() {
        try {
            const carts = await this.getCarts();
            const newCart = {
                id: uuidv4(),
                products: []
            };
            
            carts.push(newCart);
            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
            return newCart;
        } catch (error) {
            console.error('Error creando el carrito:', error);
            throw new Error('Error al crear el carrito');
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const carts = await this.getCarts();
            const cart = carts.find(c => c.id === cartId);
            
            if (!cart) {
                throw new Error('No se encontró el carrito');
            }

            const producto = await productManager.getProductsById(productId);
            if (!producto) {
                throw new Error('No se encontró el producto');
            }

            const productInCart = cart.products.find(p => p.id === productId);
            if (productInCart) {
                productInCart.quantity++;
            } else {
                cart.products.push({ id: productId, quantity: 1 });
            }

            // Guardar los cambios
            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
            return cart;
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            throw error;
        }
    }
}

export default CartManager;