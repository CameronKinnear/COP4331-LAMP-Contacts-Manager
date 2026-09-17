function AttemptLogin() {
    let loginUsername = document.getElementById('login-username-input');
    let loginPassword = document.getElementById('login-password-input');

    // Load the new webpage after successful login
    window.location.href = 'contacts.html';
}