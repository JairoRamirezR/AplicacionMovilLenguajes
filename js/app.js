import { registerUser, loginUser, logoutUser, isAuthenticated } from './auth.js';
import { loadDishes, showDishDetails } from './dishes.js';
// Import confirmOrder, loadCart, updateCartIcon, and the new functions for cart item manipulation
import { loadCart, updateCartIcon, confirmOrder, updateCartOnServer, removeFromCartOnServer } from './cart.js';
import { loadUserProfile, updateProfile, changePassword } from './profile.js';
import { showSection } from './utils.js';

// Export showDishDetails globally so it can be called directly from inline onclick or when setting hash
window.showDishDetails = showDishDetails;

document.addEventListener('DOMContentLoaded', () => {
    // --- URL Hash Navigation Handling Logic ---
    const handleLocationHash = () => {
        const hash = window.location.hash;

        // Lógica de visibilidad de la barra de navegación basada en autenticación
        if (isAuthenticated()) {
            document.querySelector('.navbar').classList.remove('d-none');
            document.getElementById('authSection').classList.add('d-none'); // Ensure auth form is hidden
        } else {
            document.querySelector('.navbar').classList.add('d-none'); // Hide navbar if not authenticated
            showSection('authSection'); // Show authentication section
            // If the hash is not #login or #register, force it to #login
            if (hash !== '#login' && hash !== '#register') {
                 window.location.hash = '#login';
                 return; // Exit so handleLocationHash is called again with the correct hash
            }
        }

        if (hash.startsWith('#details')) {
            if (!isAuthenticated()) { // Add this check
                window.location.hash = '#login'; // Redirect to login if trying to view details without auth
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
                if (!isAuthenticated()) { // Add this check
                    window.location.hash = '#login';
                    return;
                }
                showSection('menuSection');
                loadDishes();
                break;
            case '#cart':
                if (!isAuthenticated()) { // Add this check
                    window.location.hash = '#login';
                    return;
                }
                showSection('cartSection');
                loadCart(); // Load cart data from the server
                break;
            case '#profile':
                if (!isAuthenticated()) { // Add this check
                    window.location.hash = '#login';
                    return;
                }
                showSection('profileSection');
                loadUserProfile();
                break;
            case '#login': // New case for the login section
                if (isAuthenticated()) { // If already logged in, redirect to menu
                    window.location.hash = '#menu';
                    return;
                }
                showSection('authSection');
                document.getElementById('loginForm').classList.remove('d-none');
                document.getElementById('registerForm').classList.add('d-none');
                break;
            case '#register': // New case for the registration section
                if (isAuthenticated()) { // If already logged in, redirect to menu
                    window.location.hash = '#menu';
                    return;
                }
                showSection('authSection');
                document.getElementById('registerForm').classList.remove('d-none');
                document.getElementById('loginForm').classList.add('d-none');
                break;
            default:
                // If no hash or it doesn't match, and not authenticated, redirect to login.
                // If authenticated, redirect to #menu.
                if (!isAuthenticated()) {
                    window.location.hash = '#login';
                } else {
                    window.location.hash = '#menu';
                }
                break;
        }
    };

    window.addEventListener('hashchange', handleLocationHash);
    handleLocationHash(); // Call on page load

    // --- Authentication Event Listeners ---
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
        // If login is successful, loginUser already redirects to #menu
        updateCartIcon(); // Update cart icon after login
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
            updateCartIcon(); // Update cart icon after registration
        }
    });

    document.getElementById('logoutButton').addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
        updateCartIcon(); // Update cart icon after logout (should be 0)
    });

    // --- Cart Event Listeners (Delegated using jQuery for dynamically added elements) ---
    // Handle incrementing quantity
    $(document).on('click', '.increment-quantity', function () {
        let dishId = parseInt($(this).data('dish-id'));
        let quantityInput = $(`input.quantity-input[data-dish-id="${dishId}"]`);
        let currentQuantity = parseInt(quantityInput.val());
        updateCartOnServer(dishId, currentQuantity + 1);
    });

    // Handle decrementing quantity
    $(document).on('click', '.decrement-quantity', function () {
        let dishId = parseInt($(this).data('dish-id'));
        let quantityInput = $(`input.quantity-input[data-dish-id="${dishId}"]`);
        let currentQuantity = parseInt(quantityInput.val());
        if (currentQuantity > 1) {
            updateCartOnServer(dishId, currentQuantity - 1);
        } else {
            // If quantity goes to 0 or less, remove the item
            removeFromCartOnServer(dishId);
        }
    });

    // Handle removing item directly
    $(document).on('click', '.remove-item', function () {
        let dishId = parseInt($(this).data('dish-id'));
        removeFromCartOnServer(dishId);
    });

    // Event listener for the "Confirm Order" button
    document.getElementById('confirmOrderBtn').addEventListener('click', async () => {
        await confirmOrder();
    });

    // --- Additional Initialization ---
    updateCartIcon(); // Ensure the cart icon is updated when the page loads, based on auth status
});