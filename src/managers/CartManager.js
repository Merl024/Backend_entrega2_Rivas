/* ####### Rutas para Manejo de Carritos (/api/carts/) ########## */
// POST /:
// Debe crear un nuevo carrito con la siguiente estructura:
// id: Number/String (Autogenerado para asegurar que nunca se dupliquen los ids).
// products: Array que contendrá objetos que representen cada producto.
// GET /:cid:
// Debe listar los productos que pertenecen al carrito con el cid proporcionado.
/* 
POST /:cid/product/:pid:
Debe agregar el producto al arreglo products del carrito seleccionado, utilizando el siguiente formato:
product: Solo debe contener el ID del producto.
quantity: Debe contener el número de ejemplares de dicho producto (se agregará de uno en uno).
Si un producto ya existente intenta agregarse, se debe incrementar el campo quantity de dicho producto.
*/
// POST /:cid/product/:pid
// Debe agregar el producto al arreglo productos del carrito seleccionado,
// Si un producto ya existente intenta agregarse, se debe incrementar el campo quantity de dicho producto.

import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
// import ProductManager from './ProductManager';

// const productManager = new ProductManager('products.json');

class CartManager{
    constructor(path){
        this.path = path
        this.initializeFile()
    }

    async initializeFile(){
        try {
            await fs.access(this.path)
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(this.path,   '[]')
            }else{
                throw error
            }
            
        }
    }
    async getCarts(){
        try{
            const carts = await fs.readFile(this.path, 'utf8');
            return JSON.parse(carts)
        }catch(rerror){ 
            console.error('Error leyendo los carritos');            
        }
    }

    async getCart(cartId){
        const carts = await this.getCarts()
        const cart = carts.find(c => c.id === cartId);
        return cart || null
    }

    async postCart(carts){
        try {
            await fs.writeFile(this.path, JSON.stringify(carts, null, 2))
        } catch (error) {
            console.error('Error creando el carrito');            
        }
    }

    async addProductToCart(id, productId){
        const cart = await this.getCart(id) 
        if(!cart){
            throw new Error('No se encontro el carrito')
        }
        
        const producto = await productManager.getProductsById(productId)
        if(!producto){
            throw new Error('No se encontro el producto')
        }
        
        const productInCart = cart.products.find(p => p.id === productId)  
        if(productInCart){
            productInCart.quantity++
        }else{
            cart.products.push({id: productId, quantity: 1})
        }
    }
}

export default CartManager