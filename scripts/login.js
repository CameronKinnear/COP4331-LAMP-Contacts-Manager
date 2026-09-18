let url = window.location.href;

userId = "";
firstName = "";
lastName = "";

let loginResult = document.getElementById('login-result');

function AttemptLogin() {
    let loginUsername = document.getElementById('login-username-input');
    let loginPassword = document.getElementById('login-password-input');
    let username = loginUsername.value.trim();
    let password = loginPassword.value.trim();
    
    let jsonPayload = JSON.stringify({username: username, password: password});
    
    // Set up HTTPS request
    try {
    /*
        User API to request and parse with the gathered info
    */
        console.log(jsonPayload);
        window.location.href = 'contacts.html';

    }
    catch (err) {
        /*
            Give a more precise error based on login
        */
        loginResult.innerHTML = "Error Logging In";
    }
    

    // Load the new webpage after successful login
}