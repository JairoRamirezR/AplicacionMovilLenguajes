// js/utils.js

const API_BASE_URL = 'http://localhost:5293';

export async function fetchData(url, method = 'GET', data = null) {
    const token = localStorage.getItem('authToken'); // Descomentado
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) { // Descomentado
        headers['Authorization'] = `Bearer ${token}`; // Descomentado
    }

    const options = {
        method,
        headers,
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, options);
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) { // Descomentado
                Swal.fire('Session Expired', 'Your session has expired or you are unauthorized. Please log in again.', 'warning'); // Usar SweetAlert2
                localStorage.removeItem('authToken');
                window.location.hash = '#login'; // Redirect to login
                // Lanzar un error para detener el flujo de la promesa en la función que llamó a fetchData
                throw new Error('Unauthorized or session expired');
            }
            const errorText = await response.text();
            let errorData = { message: errorText };
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                // No es JSON, usa texto plano
            }
            throw new Error(errorData.message || `HTTP Error: ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch request error:', error);
        // No lanzar un error si ya lo manejamos con la redirección 401/403
        if (error.message !== 'Unauthorized or session expired') {
            throw error;
        }
    }
}

// Función para mostrar solo la sección activa y ocultar las demás
export function showSection(sectionId) {
    document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('active-section');
        section.classList.add('d-none');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('d-none');
        targetSection.classList.add('active-section');
    } else {
        console.warn(`Section with ID "${sectionId}" not found.`);
    }

    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
        const linkHash = link.getAttribute('href') ? link.getAttribute('href').substring(1) : '';

        if (linkHash === sectionId.replace('Section', '')) {
            link.classList.add('active');
        }
    });
}