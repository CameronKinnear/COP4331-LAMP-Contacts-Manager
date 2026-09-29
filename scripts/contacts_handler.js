let selectedContact = null;
let searchDebounce = null;

// CHECKS IF CONTACTS NEED TO BE LOADED ON HREF CHANGE
//
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", InitContacts);
} else {
    InitContacts();
}

function InitContacts() {
    LoadContacts();
    SetupSearchBar();
    if (typeof InitWidgetDragDrop === "function") {
        InitWidgetDragDrop();
    }
}

// Setup search bar listener (debounced 300ms)
function SetupSearchBar() {
    const searchBar = document.getElementById("contact-search-bar");
    if (!searchBar) return;

    searchBar.addEventListener("input", (e) => {
        const query = e.target.value.trim();
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            LoadContacts(query);
        }, 300);
    });
}
//  LOADS THE CONTACTS ASSOCIATED WITH THE CURRENTLY LOGGED IN USER
//  
function LoadContacts(query = "") {
    console.log("attempting contact fetch", query);

    const contactDisplay = document.getElementById('contacts-display');
    if (!contactDisplay) return;

    // Use search endpoint if query is provided, otherwise default contacts fetch
    const url = query.length > 0
        ? `api/contacts.php?search=${encodeURIComponent(query)}`
        : `api/contacts.php?contacts=1`;

    fetch(url, { credentials: "same-origin" })
        .then(response => response.json())
        .then(data => {
            contactDisplay.innerHTML = '';

            if (data.error && data.error.length > 0) {
                console.log('data error', data.error);
                return;
            }

            if (Array.isArray(data) && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let newContact = CreateContactElement(data[i]);
                    contactDisplay.appendChild(newContact);
                }
            } else if (query.length > 0) {
                contactDisplay.innerHTML = `<div style="padding: 12px; color: #6e473b; font-size: 0.9rem;">No contacts found matching "${query}"</div>`;
            }
        })
        .catch(error => {
            console.log("Error fetching contacts:", error);
        });
}

//  ADD NEW CONTACT BUTTON, CREATES THEN ADDS TO DISPLAY THEN POSTS TO DATABASE
//
function AddNewContact() {
    jsonTemp = {
        'FirstName': '[First]', 'LastName': '[Last]',
        'Email': '[Email]', 'PhoneNumber': '[Phone]'
    }
    const newContact = CreateContactElement(jsonTemp);
    document.getElementById('contacts-display').appendChild(newContact);
    PostContact(newContact);

    // Open right-hand pane in edit mode
    EditSelectedContact(newContact);

    // Automatically focus on the First Name input
    const contactfName = document.getElementById('selected-contact-first-name');
    if (contactfName) {
        contactfName.focus();
    }
}


//  CREATES A NEW CONTACT ELEMENT WITH JSON INPUT
//  contactInfo = {'ID', 'FirstName', 'LastName', 'Email', 'PhoneNumber'}
//
function CreateContactElement(contactInfo) {
    const newElement = document.createElement('div');
    newElement.className = 'contact-element';

    // Store ID in dataset only if it exists and is valid
    if (contactInfo && contactInfo.ID && contactInfo.ID != -1) {
        newElement.dataset.id = contactInfo.ID;
    }

    newElement.innerHTML = `
        <button class="select-this-contact button-nodesign" onclick="DisplaySelectedContact(this.parentElement)">
            <div class="contact-left">
                <img src="images/placeholder_user.png" class="contact-icon" alt="Avatar">
            </div>
            <div class="contact-right">
                <div class="contact-top">
                    <label class="contact-first-name">${contactInfo.FirstName || ''}</label>
                    <label class="contact-last-name">${contactInfo.LastName || ''}</label>
                </div>
                <div class="contact-bot">
                    <label class="contact-phone">${contactInfo.PhoneNumber || ''}</label>
                    <label class="contact-email" style="display: none;">${contactInfo.Email || ''}</label>
                </div> 
            </div>           
        </button>
        <button class="edit-this-contact hidden" value="edit" onclick="EditSelectedContact(this.parentElement)">
            <img class="contact-change-icon edit-icon" src="images/edit_icon.png" alt="Edit">
        </button>
        <button class="delete-this-contact hidden" value="delete" onclick="DeleteSelectedContact(this.parentElement)">
            <span class="delete-confirm-text no-display">Confirm Deletion</span>
            <img class="contact-change-icon trash-icon" src="images/trash-icon.png" alt="Delete">
        </button>
    `;

    // Add mouse over functionality
    AddMouseOverFunctionality(newElement);
    return newElement;
}

//  POSTS A CONTACT TO THE DATABASE
// 
function PostContact(contact) {
    let payload = {
        save: true,
        firstName: contact.querySelector('.contact-first-name').innerHTML,
        lastName: contact.querySelector('.contact-last-name').innerHTML,
        email: contact.querySelector('.contact-email').innerHTML,
        phone: contact.querySelector('.contact-phone').innerHTML
    };

    fetch("api/contacts.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            if (status >= 400 || body.error) {

            } else {
                console.log(data.message);
            }
        })
        .catch(err => {

        });
}

// COPIES DATA FROM THE CONTACTS COLUMN TO DISPLAY IN THE LARGE AREA
//
function DisplaySelectedContact(contact) {
    const contactHeader = document.getElementById('selected-contact-header');
    const contactImage = document.getElementById('selected-contact-img');
    const contactfName = document.getElementById('selected-contact-first-name');
    const contactlName = document.getElementById('selected-contact-last-name');
    const contactPhoneInput = document.getElementById('selected-contact-phone');
    const contactEmailInput = document.getElementById('selected-contact-email');

    // Reveal the contact detail pane
    if (contactHeader) contactHeader.classList.remove('hidden');

    // Pull values from the selected contact element
    const image = contact.querySelector('.contact-icon');
    const firstName = contact.querySelector('.contact-first-name');
    const lastName = contact.querySelector('.contact-last-name');
    const phone = contact.querySelector('.contact-phone');
    const email = contact.querySelector('.contact-email'); // if present in data

    if (image && contactImage) contactImage.src = image.src;

    // First Name
    if (contactfName) {
        contactfName.value = firstName ? firstName.innerText : '';
        contactfName.readOnly = true;
        contactfName.classList.add('disabled-input');
    }

    // Last Name
    if (contactlName) {
        contactlName.value = lastName ? lastName.innerText : '';
        contactlName.readOnly = true;
        contactlName.classList.add('disabled-input');
    }

    // Phone
    if (contactPhoneInput) {
        contactPhoneInput.value = phone ? phone.innerText : '';
        contactPhoneInput.readOnly = true;
        contactPhoneInput.classList.add('disabled-input');
    }

    // Email
    if (contactEmailInput) {
        contactEmailInput.value = email ? email.innerText : '';
        contactEmailInput.readOnly = true;
        contactEmailInput.classList.add('disabled-input');
    }

    selectedContact = contact;
}

//  MAKES SELECTED CONTACT EDITABLE AND SETS UP SAVE ACTION
//
function EditSelectedContact(contact) {
    const editContactButton = contact.querySelector('.edit-this-contact');
    const editImg = contact.querySelector('.edit-icon');
    const contactHeader = document.getElementById('selected-contact-header');
    const contactImage = document.getElementById('selected-contact-img');
    const contactfName = document.getElementById('selected-contact-first-name');
    const contactlName = document.getElementById('selected-contact-last-name');
    const contactPhone = document.getElementById('selected-contact-phone');
    const contactEmail = document.getElementById('selected-contact-email');

    // Reveal contact pane
    if (contactHeader) contactHeader.classList.remove('hidden');

    // Save action triggered
    if (editContactButton.value === 'save') {
        editImg.src = 'images/edit_icon.png';
        editContactButton.value = 'edit';
        editContactButton.style.backgroundColor = 'var(--blue)';

        // Lock all inputs after saving
        if (contactfName) {
            contactfName.readOnly = true;
            contactfName.classList.add('disabled-input');
        }
        if (contactlName) {
            contactlName.readOnly = true;
            contactlName.classList.add('disabled-input');
        }
        if (contactPhone) {
            contactPhone.readOnly = true;
            contactPhone.classList.add('disabled-input');
        }
        if (contactEmail) {
            contactEmail.readOnly = true;
            contactEmail.classList.add('disabled-input');
        }

        SaveEditedContact(contact);
        return;
    }

    // Switch to editing state
    const image = contact.querySelector('.contact-icon');
    const firstName = contact.querySelector('.contact-first-name');
    const lastName = contact.querySelector('.contact-last-name');
    const phone = contact.querySelector('.contact-phone');
    const email = contact.querySelector('.contact-email');

    editContactButton.style.backgroundColor = 'var(--green)';
    if (image && contactImage) contactImage.src = image.src;
    editImg.src = 'images/save_icon.png';

    // Populate and unlock fields for editing
    if (contactfName) {
        contactfName.value = firstName ? firstName.innerText : '';
        contactfName.readOnly = false;
        contactfName.classList.remove('disabled-input');
    }

    if (contactlName) {
        contactlName.value = lastName ? lastName.innerText : '';
        contactlName.readOnly = false;
        contactlName.classList.remove('disabled-input');
    }

    if (contactPhone) {
        contactPhone.value = phone ? phone.innerText : '';
        contactPhone.readOnly = false;
        contactPhone.classList.remove('disabled-input');
    }

    if (contactEmail) {
        contactEmail.value = email ? email.innerText : '';
        contactEmail.readOnly = false;
        contactEmail.classList.remove('disabled-input');
    }

    editContactButton.value = 'save';
    selectedContact = contact;
}

//  SAVES AN ALREADY EXISTING CONTACT TO THE DATABASE
//
function SaveEditedContact(contact) {
    const contactfName = document.getElementById('selected-contact-first-name');
    const contactlName = document.getElementById('selected-contact-last-name');
    const contactPhone = document.getElementById('selected-contact-phone');
    const contactEmail = document.getElementById('selected-contact-email');

    // Read the latest edited values directly from the input fields
    const firstname = contactfName ? contactfName.value.trim() : '';
    const lastname = contactlName ? contactlName.value.trim() : '';
    const phonenumber = contactPhone ? contactPhone.value.trim() : '';
    const email = contactEmail ? contactEmail.value.trim() : '';

    // Sync back to the left sidebar card preview
    const sidebarFirst = contact.querySelector('.contact-first-name');
    const sidebarLast = contact.querySelector('.contact-last-name');
    const sidebarPhone = contact.querySelector('.contact-phone');
    const sidebarEmail = contact.querySelector('.contact-email');

    if (sidebarFirst) sidebarFirst.innerText = firstname;
    if (sidebarLast) sidebarLast.innerText = lastname;
    if (sidebarPhone) sidebarPhone.innerText = phonenumber;
    if (sidebarEmail) sidebarEmail.innerText = email;

    const contactId = contact.dataset.id;

    let payload = {
        id: contactId,
        firstName: firstname,
        lastName: lastname,
        email: email,
        phone: phonenumber
    };

    // If contact already has an ID, update with PUT; otherwise new entries use POST
    const method = contactId ? "PUT" : "POST";
    if (method === "POST") {
        payload.save = true;
    }

    fetch("api/contacts.php", {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            if (status >= 400 || body.error) {
                console.error("Save error:", body.error);
            } else {
                console.log("Contact saved successfully:", body.message || body);
                // If newly created, save the new DB ID to the element
                if (body.id) {
                    contact.dataset.id = body.id;
                }
            }
        })
        .catch(err => {
            console.error("Network or script error on save:", err);
        });
}

//  DELETES AN ALREADY EXISTING CONTACT FROM THE DATABASE
//
function DeleteSelectedContact(contact) {
    const deleteButton = contact.querySelector('.delete-this-contact');
    const deleteImg = contact.querySelector('.trash-icon');
    const confirmText = contact.querySelector('.delete-confirm-text');

    if (deleteButton.value === 'delete') {
        deleteButton.value = 'confirm';
        deleteImg.src = 'images/confirm_delete_icon.png';
        confirmText.classList.remove('no-display');
        selectedContact = contact;
        return;
    }

    // Confirm deletion logic
    contact.remove();
    const contactHeader = document.getElementById('selected-contact-header');
    if (contactHeader) contactHeader.classList.add('hidden');
}

// ADDS MOUSE OVER FUNCTIONAILITY TO ALL CONTACTS AS SOON AS PAGE LOADS
//
const contacts = document.querySelectorAll('.contact-element');
contacts.forEach(contact => {
    AddMouseOverFunctionality(contact);
})

//  ADDS MOUSE OVER FUNCTIONAILITY TO SPECIFIED CONTACT
// 
function AddMouseOverFunctionality(contact) {
    contact.addEventListener('mouseenter', (e) => {
        let contactButtons = e.currentTarget.querySelectorAll('button');
        if (contactButtons[1]) contactButtons[1].classList.remove('hidden');
        if (contactButtons[2]) contactButtons[2].classList.remove('hidden');
    });
    contact.addEventListener('mouseleave', (e) => {
        let contactButtons = e.currentTarget.querySelectorAll('button');
        if (contactButtons[1] && contactButtons[1].value !== 'save') {
            contactButtons[1].classList.add('hidden');
        }
        if (contactButtons[2] && contactButtons[2].value !== 'confirm') {
            contactButtons[2].classList.add('hidden');
        }
    });
}

// Widget Handlers
function InitWidgetDragDrop() {
    const addWidgetContainer = document.getElementById('drag-widget-here-to-add');
    const widgets = document.querySelectorAll('.draggable-widget');

    widgets.forEach(widget => {
        widget.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData("text/plain", e.target.id);
            setTimeout(() => e.target.classList.add("hidden"), 0);
        });

        widget.addEventListener('dragend', (e) => {
            e.target.classList.remove('hidden');
        });
    });

    if (addWidgetContainer) {
        addWidgetContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        addWidgetContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData("text/plain");
            const draggableElement = document.getElementById(id);
            AddWidgetToContact(draggableElement);
        });
    }
}

function AddWidgetToContact(widget) {
    if (!widget) return;
    if (selectedContact == null) {
        console.log("Contact is not selected");
        return;
    }
    if (widget.id === 'widget-note') {
        console.log("Note Widget Added");
    }
}
