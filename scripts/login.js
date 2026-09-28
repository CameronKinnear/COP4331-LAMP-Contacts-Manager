let url = window.location.href;

let userId = "";
let firstName = "";
let lastName = "";

let loginResult = document.getElementById('login-result');

function AttemptLogin() {
    let loginUsername = document.getElementById('login-username-input');
    let loginPassword = document.getElementById('login-password-input');
    let username = loginUsername.value.trim();
    let password = loginPassword.value.trim();

    if (!username || !password) {
        if (loginResult) {
            loginResult.innerHTML = "Username and password are required.";
        } else {
            alert("Username and password are required.");
        }
        return;
    }

    let payload = {
        login: username,
        Login: username,
        username: username,
        password: password,
        Password: password
    };

    fetch("api/index.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(({ status, body }) => {
        if (status >= 400 || body.error) {
            let msg = body.error || "Invalid username or password.";
            if (loginResult) {
                loginResult.innerHTML = msg;
            } else {
                alert(msg);
            }
        } else {
            if (body.id || body.ID) {
                sessionStorage.setItem("userId", body.id || body.ID);
            }
            if (body.firstName || body.FirstName) {
                sessionStorage.setItem("firstName", body.firstName || body.FirstName);
            }
            if (body.lastName || body.LastName) {
                sessionStorage.setItem("lastName", body.lastName || body.LastName);
            }

            window.location.href = 'contacts.html';
        }
    })
    .catch(err => {
        console.error("Login fetch error:", err);
        if (loginResult) {
            loginResult.innerHTML = "Error connecting to server.";
        } else {
            alert("Error connecting to server.");
        }
    });
}
