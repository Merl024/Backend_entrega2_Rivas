import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

class ProductManager {
    constructor(path) {
        this.path = path
        this.initializeFile()
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
    async getProducts() {
        try {
            const data = await fs.readFile(this.path, "utf-8")
            return JSON.parse(data)
        } catch (error) {
            console.error("Error leyendo el archivo de productos", error)
            throw error
        }
    }

    async getProductsById(productId) {
        try {
            const productos = await this.getProducts()
            const product = productos.find(p => p.id === productId)
            return product || null
        } catch (error) {
            console.error('Error al obtener el producto:', error)
            throw error
        }
    }

    async postProducts(productos) {
        try {
            await fs.writeFile(this.path, JSON.stringify(productos, null, 2))
        } catch (error) {
            throw new Error('Error al guardar los productos: ' + error.message)
        }
    }

    async agregarProductos(producto) {
        try {
            const productos = await this.getProducts()
            producto.id = uuidv4()
            productos.push(producto)
            await this.postProducts(productos)
            return producto
        } catch (error) {
            throw new Error('Error al agregar nuevo producto: ' + error.message)
        }
    }

    async updateProduct(productId, updatedProduct) {
        try {
            const productos = await this.getProducts()
            const index = productos.findIndex(p => p.id === productId)
            
            if (index === -1) {
                return null
            }
    
            // Mantener el ID original y actualizar el resto de campos
            const updatedProductWithId = { 
                ...updatedProduct,
                id: productId 
            }
            productos[index] = updatedProductWithId
            await this.postProducts(productos)
            return updatedProductWithId
        } catch (error) {
            throw new Error('Error al actualizar el producto: ' + error.message)
        }
    }

    async deleteProduct(productId) {
        try {
            const productos = await this.getProducts()
            const filteredProducts = productos.filter(p => p.id !== productId)
            
            if (filteredProducts.length === productos.length) {
                return false
            }
    
            await this.postProducts(filteredProducts)
            return true
        } catch (error) {
            throw new Error('Error al eliminar el producto: ' + error.message)
        }
    }
}

export default ProductManager