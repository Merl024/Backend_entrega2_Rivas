import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

class ProductManager{
    constructor(path){
        this.path = path
    }

    async getProducts(){
        try {
            const data = await fs.readFile(this.path, "utf-8")
            return JSON.parse(data)
            
        } catch (error) {
            console.error("Error leyendo el archivo de productos", error)
            return []
        }
    }

    async getProductsById(productId) {
        try {
            const productos = await this.getProducts();
            const product = productos.find(p => p.id === productId);
    
            if (!product) {
                throw new Error('Producto no encontrado');
            }
    
            return product
        } catch (error) {
            console.error('Error al obtener el producto:', error);
            throw error
        }
    }
    async postProducts(productos){
        try {
            const data = await fs.writeFile(this.path, JSON.stringify(productos, null, 2))
        } catch (error) {
            throw new Error('Error agregando el producto', error)
        }
    }

    async agregarProductos(producto){
        try {
            const productos = await this.getProducts()
            producto.id = uuidv4()
            productos.push(producto)
            await this.postProducts(productos)
            return producto
        } catch (error) {
            throw new Error('Error a agregar nuevo producto', error)
        }
    }

    async putProducts(productId, putProduct){
        try {
            const productos = await this.getProducts()
            const index = productos.findIndex(p => p.id === productId)
            
            if(index === -1){
                throw Error('Producto no encontrado')
            }

            productos[index] = putProduct
            await this.postProducts(productos) 
        } catch(error){
            console.log(error)
        }
    }

    async deleteProduct(productId){
        try {
            const productos = await this.getProducts()
            const productosLength = productos.length
            const deleteProd = productos.filter(p => p.id !== productId)

            if (deleteProd.length === productosLength) {
                return false
            }
    
            await this.postProducts(deleteProd)
            return true
            
        } catch (error) {
            console.log('Error al eliminar el producto',error);
            
        }
    }

}

export default ProductManager