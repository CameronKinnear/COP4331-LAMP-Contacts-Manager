//------------------------------------------------------------//
// A COLLECTION OF BASIC FUNCTIONS THAT DO NOT RELY ON OTHERS //
//------------------------------------------------------------//

// Runs when contacts.html page loads
//
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", DOMInit);
} else {
    // Put all functions that should run on page load here \/
    DOMInit();
    
}

function DOMInit() {
    DisplayFirstAndLastName();
    let toggleDarkModeButton = document.getElementById('dark-mode-toggle-button');
    console.log(toggleDarkModeButton);
    if (!toggleDarkModeButton) {
        console.error('dark-mode-toggle-button not found');
        return;
    }
    toggleDarkModeButton.addEventListener('change', () => {
        console.log("toggle dark mode");
        ToggleDarkMode();
    });
}

// Displays the users first and last name in the header
//
function DisplayFirstAndLastName() {
    let nameHeader = document.getElementById('user-name');
    let usersName = (window.sessionStorage.getItem('firstName') ?? '[First Name Error]') + ' ' + 
                    (window.sessionStorage.getItem('lastName') ?? '[Last Name Error]');
    if (nameHeader) nameHeader.textContent = usersName;

    const adminDashboardLink = document.getElementById('admin-dashboard-link');
    if (adminDashboardLink && window.sessionStorage.getItem('role') === 'admin') {
        adminDashboardLink.classList.remove('hidden');
    }
}

let currentWindowTheme = 'light';
const root = document.documentElement;

// 2. Change the value of the variable

function ToggleDarkMode() {
    if (currentWindowTheme == 'dark') {
        // Change to light mode
        root.style.setProperty('--bg_color', '#e8d8c4');
        root.style.setProperty('--surface', '#fffdfa');

        root.style.setProperty('--text', '#000000');
        currentWindowTheme = 'light';
    }
    else if (currentWindowTheme == 'light') {
        // Change to dark mode
        root.style.setProperty('--bg_color', '#1d120c');
        root.style.setProperty('--surface', '#4a2e1f');
        root.style.setProperty('--text', '#ffffff');
        currentWindowTheme = 'dark';
    }
}

document.getElementById('logout-button').addEventListener('click', async () => {
        try {
            await fetch('api/index.php?logout=1', { method: 'POST' });
        } finally {
            sessionStorage.clear();
            window.location.assign('index.html');
        }
    });