// js/profile.js

import { fetchData } from './utils.js';

export async function loadUserProfile() {
    try {
        const profileData = await fetchData('/api/account/profile'); // Tu endpoint para obtener el perfil
        // Asegúrate de que profileData contenga name, lastName, email y address
        if (profileData) {
            document.getElementById('profileEmail').value = profileData.email || ''; // Email es readonly
            document.getElementById('profileName').value = profileData.name || ''; // Cambiado de profileFullName
            document.getElementById('profileLastName').value = profileData.lastName || ''; // Añadido
            document.getElementById('profileAddress').value = profileData.address || '';
        } else {
            toastr.error('No se pudo cargar la información del perfil. Datos de perfil incompletos.');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        toastr.error('No se pudo cargar la información del perfil.');
    }
}

// Ahora recibe name, lastName y address por separado
export async function updateProfile(name, lastName, address) {
    try {
        const dataToUpdate = { name, lastName, address }; // Enviar name y lastName
        const response = await fetchData('/api/account/profile/update', 'PUT', dataToUpdate);

        if (response.success) {
            toastr.success('¡Perfil actualizado exitosamente!');
            // Opcional: recargar el perfil si hay campos que se calculan o modifican en el backend
            loadUserProfile();
        } else {
            // Manejar errores específicos devueltos por el backend
            toastr.error(response.message || 'Error al actualizar el perfil.');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        toastr.error('Error al actualizar el perfil: ' + (error.message || 'Error desconocido'));
    }
}

export async function changePassword(currentPassword, newPassword, confirmNewPassword) {
    if (newPassword !== confirmNewPassword) {
        Swal.fire('Error', 'La nueva contraseña y la confirmación no coinciden.', 'error');
        return false;
    }
    if (newPassword.length < 6) { // O la longitud mínima que tengas configurada en Identity
        Swal.fire('Error', 'La nueva contraseña debe tener al menos 6 caracteres.', 'error');
        return false;
    }

    try {
        const dataToUpdate = { currentPassword, newPassword }; // Backend solo necesita estos dos
        const response = await fetchData('/api/account/profile/changePassword', 'PUT', dataToUpdate);

        if (response.success) {
            toastr.success('¡Contraseña cambiada exitosamente! Por favor, vuelve a iniciar sesión.');
            // Puedes forzar un logout para que el usuario inicie sesión con la nueva contraseña
            setTimeout(() => {
                // Asumiendo que tienes una función logoutUser global o accesible
                window.location.hash = '#login';
                localStorage.removeItem('authToken'); // Limpia el token JWT
                // Si tienes un endpoint de logout en el backend para cookies, llámalo aquí
            }, 2000);
            return true;
        } else {
            toastr.error(response.message || 'Error al cambiar la contraseña.');
            return false;
        }
    } catch (error) {
        console.error('Error changing password:', error);
        toastr.error('Error al cambiar la contraseña: ' + (error.message || 'Error desconocido'));
        return false;
    }
}