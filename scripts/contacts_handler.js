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
    SetupCategoryInput();
    if (typeof InitWidgetDragDrop === "function") {
        InitWidgetDragDrop();
    }
}

function SetupCategoryInput() {
    const categorySelect = document.getElementById('selected-contact-category');
    const customInput = document.getElementById('selected-contact-custom-category');
    if (categorySelect?.dataset.categoryHandlerBound) return;
    if (categorySelect) categorySelect.dataset.categoryHandlerBound = 'true';
    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            UpdateCustomCategoryVisibility();
            SaveDisplayedCategoryIfNeeded();
        });
    }
    if (customInput) customInput.addEventListener('change', SaveDisplayedCategoryIfNeeded);
}

function SaveDisplayedCategoryIfNeeded() {
    if (!selectedContact || !selectedContact.dataset.id) return;
    const editButton = selectedContact.querySelector('.edit-this-contact');
    if (editButton && editButton.value === 'save') return;
    SaveEditedContact(selectedContact);
}

function UpdateCustomCategoryVisibility() {
    const categorySelect = document.getElementById('selected-contact-category');
    const customInput = document.getElementById('selected-contact-custom-category');
    if (!categorySelect || !customInput) return;
    const isCustom = categorySelect.value === '__custom__';
    customInput.classList.toggle('hidden', !isCustom);
    customInput.disabled = !isCustom || categorySelect.disabled;
    if (isCustom && !customInput.disabled) customInput.focus();
}

function SetCategoryField(category, editable) {
    const categorySelect = document.getElementById('selected-contact-category');
    const customInput = document.getElementById('selected-contact-custom-category');
    if (!categorySelect || !customInput) return;

    const standardCategories = ['Work', 'Personal'];
    if (standardCategories.includes(category)) {
        categorySelect.value = category;
        customInput.value = '';
    } else if (category) {
        categorySelect.value = '__custom__';
        customInput.value = category;
    } else {
        categorySelect.value = '';
        customInput.value = '';
    }
    categorySelect.disabled = !editable;
    customInput.disabled = !editable || categorySelect.value !== '__custom__';
    customInput.classList.toggle('hidden', categorySelect.value !== '__custom__');
}

function GetCategoryValue() {
    const categorySelect = document.getElementById('selected-contact-category');
    const customInput = document.getElementById('selected-contact-custom-category');
    if (!categorySelect) return '';
    return categorySelect.value === '__custom__' ? (customInput ? customInput.value.trim() : '') : categorySelect.value;
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
                const emptyMessage = document.createElement('div');
                emptyMessage.style.cssText = 'padding: 12px; color: #6e473b; font-size: 0.9rem;';
                emptyMessage.textContent = `No contacts found matching "${query}"`;
                contactDisplay.appendChild(emptyMessage);
            }
        })
        .catch(error => {
            console.log("Error fetching contacts:", error);
        });
}

//  ADD NEW CONTACT BUTTON, CREATES THEN ADDS TO DISPLAY THEN POSTS TO DATABASE
//
function AddNewContact() {
    const jsonTemp = {
        FirstName: '', LastName: '', Email: '', PhoneNumber: '', Category: ''
    }
    const newContact = CreateContactElement(jsonTemp);
    document.getElementById('contacts-display').appendChild(newContact);

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
                    <label class="contact-first-name"></label>
                    <label class="contact-last-name"></label>
                </div>
                <div class="contact-bot">
                    <label class="contact-phone no-display"></label>
                    <label class="contact-email"></label>
                </div> 
                <div class="contact-category"></div>
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

    newElement.querySelector('.contact-first-name').textContent = contactInfo.FirstName || '';
    newElement.querySelector('.contact-last-name').textContent = contactInfo.LastName || '';
    newElement.querySelector('.contact-phone').textContent = contactInfo.PhoneNumber || '';
    newElement.querySelector('.contact-email').textContent = contactInfo.Email || '';
    const categoryElement = newElement.querySelector('.contact-category');
    categoryElement.dataset.category = contactInfo.Category || '';
    categoryElement.textContent = contactInfo.Category ? `Category: ${contactInfo.Category}` : '';

    // Add mouse over functionality
    AddMouseOverFunctionality(newElement);
    return newElement;
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
    const category = contact.querySelector('.contact-category');

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

    // Category can be changed directly from the selected contact view; other fields
    // continue to use the card's edit/save action.
    SetCategoryField(category ? category.dataset.category || '' : '', true);

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
        if (document.getElementById('selected-contact-category')?.value === '__custom__' && !GetCategoryValue()) {
            document.getElementById('selected-contact-custom-category').focus();
            return;
        }
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
        SetCategoryField(GetCategoryValue(), false);

        SaveEditedContact(contact);
        return;
    }

    // Switch to editing state
    const image = contact.querySelector('.contact-icon');
    const firstName = contact.querySelector('.contact-first-name');
    const lastName = contact.querySelector('.contact-last-name');
    const phone = contact.querySelector('.contact-phone');
    const email = contact.querySelector('.contact-email');
    const category = contact.querySelector('.contact-category');

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
    SetCategoryField(category ? category.dataset.category || '' : '', true);

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
    const category = GetCategoryValue();

    // Read the latest edited values directly from the input fields
    const firstname = contactfName ? contactfName.value.trim() : '';
    const lastname = contactlName ? contactlName.value.trim() : '';
    const phonenumber = contactPhone ? contactPhone.value.trim() : '';
    const email = contactEmail ? contactEmail.value.trim() : '';
    if (document.getElementById('selected-contact-category')?.value === '__custom__' && !category) {
        document.getElementById('selected-contact-custom-category').focus();
        return;
    }

    // Sync back to the left sidebar card preview
    const sidebarFirst = contact.querySelector('.contact-first-name');
    const sidebarLast = contact.querySelector('.contact-last-name');
    const sidebarPhone = contact.querySelector('.contact-phone');
    const sidebarEmail = contact.querySelector('.contact-email');
    const sidebarCategory = contact.querySelector('.contact-category');

    if (sidebarFirst) sidebarFirst.innerText = firstname;
    if (sidebarLast) sidebarLast.innerText = lastname;
    if (sidebarPhone) sidebarPhone.innerText = phonenumber;
    if (sidebarEmail) sidebarEmail.innerText = email;
    if (sidebarCategory) {
        sidebarCategory.dataset.category = category;
        sidebarCategory.textContent = category ? `Category: ${category}` : '';
    }

    const contactId = contact.dataset.id;

    let payload = {
        id: contactId,
        firstName: firstname,
        lastName: lastname,
        email: email,
        phone: phonenumber,
        category: category
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
        .then(async response => {
            const responseText = await response.text();
            let body;
            try {
                body = JSON.parse(responseText);
            } catch (error) {
                throw new Error(`Server returned an invalid response (HTTP ${response.status}).`);
            }
            if (!response.ok || body.error) {
                throw new Error(body.error || `Save failed (HTTP ${response.status}).`);
            }
            return body;
        })
        .then(body => {
            contact.classList.remove('contact-save-failed');
            console.log("Contact saved successfully:", body.message || body);
            // If newly created, save the new DB ID to the element
            if (body.id) contact.dataset.id = body.id;
        })
        .catch(err => {
            console.error("Network or script error on save:", err);
            contact.classList.add('contact-save-failed');
            alert(`Contact was not saved. ${err.message || "Check your connection and try again."}`);
        });
}

//  DELETES AN ALREADY EXISTING CONTACT FROM THE DATABASE
//
function DeleteSelectedContact(contact) {
    console.log('running delete contact func');
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
    const contactHeader = document.getElementById('selected-contact-header');
    if (contactHeader) contactHeader.classList.add('hidden');

    let contactId = contact.dataset.id;
    // !! STILL NEEDS PROPER DATABASE DELETION
    console.log('attemtping delete contact');
    fetch("api/contacts.php?contactId=" + contactId, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
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

    contact.remove();
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