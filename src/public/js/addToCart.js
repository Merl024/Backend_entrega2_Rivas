// Funcion para agregar al carrito y mostrar con un toast si sí se agrega o no
function addToCart(productId) {
    const cartId = '674bb10a535dac3ef850a0ec'; // ID fijo de un carrito dentro de la DB

    console.log(`Agregando producto al carrito: ${cartId}, Producto: ${productId}`);

    fetch(`/api/carts/${cartId}/product/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Producto agregado',
                text: 'El producto fue agregado al carrito exitosamente.',
                timer: 2000,
                showConfirmButton: false
            });
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo agregar el producto al carrito.',
            });
        });
}
