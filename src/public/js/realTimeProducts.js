const socket = io()

// Elementos del DOM
const productForm = document.getElementById('productForm')
const productList = document.getElementById('productList')

// Escuchar actualizaciones de productos
socket.on('products', (products) => {
    updateProductList(products)
})

// Escuchar errores
socket.on('error', (error) => {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
    })
})

// Manejar envío del formulario
productForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const product = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: Number(document.getElementById('price').value),
        stock: Number(document.getElementById('stock').value),
        category: document.getElementById('category').value
    }

    socket.emit('newProduct', product)
    productForm.reset()
    
    Swal.fire({
        icon: 'success',
        title: 'Producto agregado',
        showConfirmButton: false,
        timer: 1500
    })
})

// Función para eliminar producto
function deleteProduct(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            socket.emit('deleteProduct', id)
        }
    })
}

// Función para actualizar la lista de productos
function updateProductList(products){
    if (products.length === 0) {
        productList.innerHTML = '<p>No hay productos disponibles</p>'
        return
    }

    productList.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <h2>${product.title}</h2>
            <p>Descripción: ${product.description}</p>
            <p>Precio: $${parseFloat(product.price)}</p>
            <p>Stock: ${product.stock}</p>
            <p>Categoría: ${product.category}</p>
            <button class="delete-btn" onclick="deleteProduct('${product.id}')">Eliminar</button>
        </div>
    `).join('')
}