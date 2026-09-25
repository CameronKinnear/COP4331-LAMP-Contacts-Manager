document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup-form");

    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();

            // Extract values using the 'name' attributes defined in signup.html
            const firstName = document.querySelector('input[name="firstName"]').value.trim();
            const lastName = document.querySelector('input[name="lastName"]').value.trim();
            const login = document.querySelector('input[name="username"]').value.trim();
            const password = document.querySelector('input[name="password"]').value;

            // Prepare JSON payload
            const payload = {
                register: true,
                Register: true,
                firstName: firstName,
                lastName: lastName,
                FirstName: firstName,
                LastName: lastName,
                login: login,
                Login: login,
                password: password,
                Password: password
            };

            // Update 'api/index.php' to match the actual file name in api/ folder
            fetch("api/index.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error && data.error.length > 0) {
                        alert("Registration failed: " + data.error);
                    } else {
                        alert("Registration successful! Redirecting to login...");
                        window.location.href = "index.html";
                    }
                })
                .catch(error => {
                    console.error("Error submitting registration:", error);
                    alert("An error occurred during registration. Please check the console.");
                });
        });
    }
});