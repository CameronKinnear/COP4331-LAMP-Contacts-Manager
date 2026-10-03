//------------------------------------------------------------//
// A COLLECTION OF BASIC FUNCTIONS THAT DO NOT RELY ON OTHERS //
//------------------------------------------------------------//

// Runs when contacts.html page loads
//
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", InitContacts);
} else {
    // Put all functions that should run on page load here \/
    DisplayFirstAndLastName();
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
