const ownerDashboardLink = document.getElementById('ownerDashboardLink');
const logoutLink = document.getElementById('logoutLink');
const loginLink = document.getElementById('loginLink');
const signupLink = document.getElementById('signupLink');

fetch('api/session.php', { credentials: 'same-origin' })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Unable to check the current session.');
        }
        return response.json();
    })
    .then((session) => {
        if (!session.authenticated) {
            return;
        }

        loginLink.hidden = true;
        signupLink.hidden = true;
        logoutLink.hidden = false;
        ownerDashboardLink.hidden = session.userType !== 'owner';
    })
    .catch((error) => console.error(error));