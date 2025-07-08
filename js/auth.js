// js/auth.js

import { fetchData } from './utils.js';

export async function registerUser(email, password, fullName, address) { // Descomentado
    try {
        const userData = { email, password, fullName, address }; // Adapta esto a tu modelo de registro de ASP.NET Identity
        // Asegúrate que tu backend tenga un endpoint para registro que devuelva un token
        // o maneje la cookie de autenticación de Identity
        const response = await fetchData('/api/account/register', 'POST', userData); // Tu ruta API para registro

        // Si tu backend devuelve un JWT:
        if (response && response.token) {
            localStorage.setItem('authToken', response.token); // Guardar el token
            // Redirigir al menú principal
            window.location.hash = '#menu';
            console.log('Registration successful and token saved.');
            return true;
        } else {
            // Si el backend no devuelve un token (ej. usa solo cookies de Identity)
            // Necesitarías que el backend establezca la cookie de autenticación directamente.
            // Para el frontend, simplemente podrías redirigir a #menu si la operación fue exitosa.
            window.location.hash = '#menu';
            console.log('Registration successful (assuming cookie authentication).');
            return true;
        }

    } catch (error) {
        console.error('Error registering user:', error);
        Swal.fire('Error', 'Error registering: ' + (error.message || 'Unknown error'), 'error'); // Usar SweetAlert2
        return false;
    }
}

export async function loginUser(email, password) { // Descomentado
    try {
        const credentials = { email, password };
        // Asegúrate que tu backend tenga un endpoint para login que devuelva un token
        // o maneje la cookie de autenticación de Identity
        const response = await fetchData('/api/account/login', 'POST', credentials); // Tu ruta API para login

        // Si tu backend devuelve un JWT:
        if (response && response.token) {
            localStorage.setItem('authToken', response.token); // Guardar el token
            // Redirigir al menú principal
            window.location.hash = '#menu';
            console.log('Login successful and token saved.');
            return true;
        } else {
            // Si el backend no devuelve un token (ej. usa solo cookies de Identity)
            window.location.hash = '#menu';
            console.log('Login successful (assuming cookie authentication).');
            return true;
        }
    } catch (error) {
        console.error('Error logging in:', error);
        Swal.fire('Error', 'Error logging in: ' + (error.message || 'Unknown error'), 'error'); // Usar SweetAlert2
        return false;
    }
}

export function logoutUser() { // Descomentado
    localStorage.removeItem('authToken'); // Limpiar cualquier token JWT
    // Si usas cookies, puedes necesitar un endpoint de logout en el backend que limpie la cookie.
    // fetch('/api/account/logout', { method: 'POST' }); // Llamada opcional al backend para logout
    window.location.hash = '#login'; // Redirigir a la página de login
    console.log('Logged out.');
}

export function isAuthenticated() { // Descomentado
    // Verifica si hay un token JWT. Si usas cookies de Identity, esta función no es suficiente.
    // Para cookies, podrías necesitar un endpoint en el backend que te diga si el usuario está autenticado,
    // o simplemente intentar acceder a una ruta protegida y manejar el 401.
    return localStorage.getItem('authToken') !== null;
}