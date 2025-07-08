// js/profile.js

import { fetchData } from './utils.js';

export async function loadUserProfile() {
    try {
        const profileData = await fetchData('/api/account/profile'); 

        if (profileData) {
            document.getElementById('profileEmail').value = profileData.email || '';
            document.getElementById('profileName').value = profileData.name || '';
            document.getElementById('profileLastName').value = profileData.lastName || ''; 
            document.getElementById('profileAddress').value = profileData.address || '';
        } else {
            toastr.error('Failed to load profile information. Incomplete profile data.'); 
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        toastr.error('Failed to load profile information.');
    }
}


export async function updateProfile(name, lastName, address) {
    try {
        const dataToUpdate = { name, lastName, address }; 
        const response = await fetchData('/api/account/profile/update', 'PUT', dataToUpdate);

        if (response.success) {
            toastr.success('Profile updated successfully!');
            
            loadUserProfile();
        } else {
            
            toastr.error(response.message || 'Error updating profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        toastr.error('Error updating profile: ' + (error.message || 'Unknown error'));
    }
}

export async function changePassword(currentPassword, newPassword, confirmNewPassword) {
    if (newPassword !== confirmNewPassword) {
        Swal.fire('Error', 'New password and confirmation don not match.', 'error');
        return false;
    }
    if (newPassword.length < 6) { 
        Swal.fire('Error', 'New password must be at least 6 characters long', 'error');
        return false;
    }

    try {
        const dataToUpdate = { currentPassword, newPassword }; 
        const response = await fetchData('/api/account/profile/changePassword', 'PUT', dataToUpdate);

        if (response.success) {
            toastr.success('Password changed successfully! Please log in again.');
            
            setTimeout(() => {
                
                window.location.hash = '#login';
                localStorage.removeItem('authToken'); 
                
            }, 2000);
            return true;
        } else {
            toastr.error(response.message || 'Error changing password.');
            return false;
        }
    } catch (error) {
        console.error('Error changing password:', error);
        toastr.error('Error changing password: ' + (error.message || 'Unknown error'));
        return false;
    }
}