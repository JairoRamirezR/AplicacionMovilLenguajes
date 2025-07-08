// js/auth.js

import { fetchData } from './utils.js';

export async function registerUser(email, password, name, lastName, address) { // <-- Cambiar fullName por name y lastName
    try {
        // Asegúrate de que los IDs de los inputs en index.html sean correctos
        // index.html: registerName, registerLastName
        const userData = {
            email: email,
            password: password,
            name: name,         // <-- Enviar 'name'
            lastName: lastName, // <-- Enviar 'lastName'
            address: address
        };
        const response = await fetchData('/api/account/register', 'POST', userData);

        if (response && response.token) {
            localStorage.setItem('authToken', response.token);
            window.location.hash = '#menu';
            toastr.success('¡Registro exitoso! Ya estás logueado.'); // Usar toastr en lugar de Swal.fire para éxito
            return true;
        } else {
            // Manejar caso donde no hay token pero el registro fue exitoso (menos común con JWT)
            toastr.warning('Registro exitoso, pero no se recibió token de inmediato. Intente iniciar sesión.');
            window.location.hash = '#login'; // Podrías redirigir a login para que el usuario inicie sesión
            return true;
        }

    } catch (error) {
        console.error('Error registering user:', error);
        // Si el error.message es un array de errores (como en BadRequest de ASP.NET Core)
        if (error.errors && Array.isArray(error.errors)) {
            error.errors.forEach(err => toastr.error(err));
        } else {
            toastr.error('Error al registrar: ' + (error.message || 'Error desconocido'));
        }
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