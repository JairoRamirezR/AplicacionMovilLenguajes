// js/app.js

import { registerUser, loginUser, logoutUser, isAuthenticated } from './auth.js'; // Descomentado
import { loadDishes, showDishDetails } from './dishes.js';
import { loadCart, updateCartIcon, confirmOrder } from './cart.js';
import { loadUserProfile, updateProfile, changePassword } from './profile.js';
import { showSection } from './utils.js';

// Export showDishDetails globally so it can be called directly from inline onclick or when setting hash
window.showDishDetails = showDishDetails;

document.addEventListener('DOMContentLoaded', () => {
    // --- URL Hash Navigation Handling Logic ---
    const handleLocationHash = () => {
        const hash = window.location.hash;

        // Lógica de visibilidad de la barra de navegación basada en autenticación
        if (isAuthenticated()) { // Descomentado
            document.querySelector('.navbar').classList.remove('d-none');
            document.getElementById('authSection').classList.add('d-none'); // Asegurarse de que el formulario de login/registro esté oculto
        } else {
            document.querySelector('.navbar').classList.add('d-none'); // Ocultar barra de navegación si no está autenticado
            showSection('authSection'); // Mostrar sección de autenticación
            // Si el hash no es #login o #register, forzarlo a #login
            if (hash !== '#login' && hash !== '#register') {
                 window.location.hash = '#login';
                 return; // Salir para que handleLocationHash se vuelva a llamar con el hash correcto
            }
        }


        if (hash.startsWith('#details')) {
            // ... (tu lógica existente) ...
            if (!isAuthenticated()) { // Añadir esta comprobación
                window.location.hash = '#login'; // Redirigir a login si intentan ver detalles sin auth
                return;
            }
            showSection('detailsSection');
            const paramsString = hash.includes('?') ? hash.split('?')[1] : '';
            const urlParams = new URLSearchParams(paramsString);
            const dishIdParam = urlParams.get('id');

            if (dishIdParam) {
                const dishId = parseInt(dishIdParam);
                if (!isNaN(dishId)) {
                    showDishDetails(dishId);
                } else {
                    console.error("Parsed dish ID from URL is NaN. Redirecting to menu.");
                    window.location.hash = '#menu';
                }
            } else {
                console.warn("No dish ID specified in URL hash for #details. Redirecting to menu.");
                window.location.hash = '#menu';
            }
            return;
        }

        switch (hash) {
            case '#menu':
                if (!isAuthenticated()) { // Añadir esta comprobación
                    window.location.hash = '#login';
                    return;
                }
                showSection('menuSection');
                loadDishes();
                break;
            case '#cart':
                if (!isAuthenticated()) { // Añadir esta comprobación
                    window.location.hash = '#login';
                    return;
                }
                showSection('cartSection');
                loadCart();
                break;
            case '#profile':
                if (!isAuthenticated()) { // Añadir esta comprobación
                    window.location.hash = '#login';
                    return;
                }
                showSection('profileSection');
                loadUserProfile();
                break;
            case '#login': // Nuevo caso para la sección de login
                if (isAuthenticated()) { // Si ya está logueado, redirigir al menú
                    window.location.hash = '#menu';
                    return;
                }
                showSection('authSection');
                document.getElementById('loginForm').classList.remove('d-none');
                document.getElementById('registerForm').classList.add('d-none');
                break;
            case '#register': // Nuevo caso para la sección de registro
                if (isAuthenticated()) { // Si ya está logueado, redirigir al menú
                    window.location.hash = '#menu';
                    return;
                }
                showSection('authSection');
                document.getElementById('registerForm').classList.remove('d-none');
                document.getElementById('loginForm').classList.add('d-none');
                break;
            default:
                // Si no hay hash o no coincide, y no está autenticado, redirigir a login.
                // Si está autenticado, redirigir a #menu.
                if (!isAuthenticated()) {
                    window.location.hash = '#login';
                } else {
                    window.location.hash = '#menu';
                }
                break;
        }
    };

    window.addEventListener('hashchange', handleLocationHash);
    handleLocationHash(); // Llama al cargar la página

    // --- Authentication Event Listeners (Descomentados) ---
    document.getElementById('showRegisterLink').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#register';
    });

    document.getElementById('showLoginLink').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#login';
    });

    document.getElementById('loginBtn').addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await loginUser(email, password);
        // Si el login es exitoso, loginUser ya redirige a #menu
        updateCartIcon(); // Actualizar icono del carrito después del login
    });

    document.getElementById('registerBtn').addEventListener('click', async () => {
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const fullName = document.getElementById('registerName').value;
        const address = document.getElementById('registerAddress').value;

        if (password !== confirmPassword) {
            Swal.fire('Error', 'Passwords do not match.', 'error');
            return;
        }

        const success = await registerUser(email, password, fullName, address);
        if (success) {
            Swal.fire('Success', 'Registration successful! You are now logged in.', 'success');
            updateCartIcon(); // Actualizar icono del carrito después del registro
        }
    });

    document.getElementById('logoutButton').addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
        updateCartIcon(); // Actualizar icono del carrito después del logout (debería ser 0)
    });

    // ... (El resto de tus Event Listeners para Cart y Profile, y Dish Search) ...

    // --- Additional Initialization ---
    // Ensure the cart icon is updated when the page loads, based on auth status
    updateCartIcon();
});