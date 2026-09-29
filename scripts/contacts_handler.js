let selectedContact = null;

// CHECKS IF CONTACTS NEED TO BE LOADED ON HREF CHANGE
//
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", LoadContacts);
} else {
    LoadContacts();
}

//  LOADS THE CONTACTS ASSOCIATED WITH THE CURRENTLY LOGGED IN USER
//  
function LoadContacts() {
    console.log("attmepting contact fetch");

    fetch("api/contacts.php?contacts=1", { credentials: "same-origin" })
    .then(response => response.json())
    .then(data => {
        if (data.error && data.error.length > 0) {
            // Data error
            console.log('data error');
        } else {
            // 200 OK
            console.log(data);

            let contactDipslay = document.getElementById('contacts-display');
            for (let i = 0; i < data.length; i++) {
                console.log(data[i]);
                let newContact = CreateContactElement(data[i]);
                contactDipslay.appendChild(newContact);
            }
        }
    })
    .catch(error => {
        // Error fetching response
        console.log(error);
    });   
}

//  ADD NEW CONTACT BUTTON, CREATES THEN POSTS TO DATABASE
//
function AddNewContact() {
    const newContact = CreateContactElement();
    document.getElementById('contacts-display').appendChild(newContact);
    PostContact(newContact);
}


//  CREATES A NEW CONTACT ELEMENT TEMPLATE WITH DEFAULT VALUES
//
function CreateContactElement() {
    const newElement = document.createElement('div');
    newElement.className = 'contact-element';

    // Template
    newElement.innerHTML = `
        <button class="select-this-contact button-nodesign" onclick="DisplaySelectedContact(this.parentElement)">
            <div class="contact-left">
                <img src="images/placeholder_user.png" class="contact-icon">
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
            </div>           
        </button>
        <button class="edit-this-contact hidden" value="edit" onclick="EditSelectedContact(this.parentElement)">
            <img class="contact-change-icon edit-icon" src="images/edit_icon.png">
        </button>
        <button class="delete-this-contact hidden" value="delete" onclick="DeleteSelectedContact(this.parentElement)">
            <span class="delete-confirm-text no-display">Confirm Deletion</span>
            <img class="contact-change-icon trash-icon" src="images/trash-icon.png">
        </button>
    `;

    // Fill in the data
    newElement.querySelector('.contact-first-name').innerHTML = "[First Name]";
    newElement.querySelector('.contact-last-name').innerHTML = "[Last Name]";
    newElement.querySelector('.contact-email').innerHTML = "[Email]";
    newElement.querySelector('.contact-phone').innerHTML = "[Phone Number]";

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
let contactImage = document.getElementById('selected-contact-img');
let contactfName = document.getElementById('selected-contact-first-name');
let contactlName = document.getElementById('selected-contact-last-name');
function DisplaySelectedContact(contact) {
    console.log(contact);
    const image = contact.querySelector('.contact-icon');
    const firstName = contact.querySelector('.contact-first-name');
    const lastName = contact.querySelector('.contact-last-name');
    const phone = contact.querySelector('.contact-phone');

    contactImage.src = image.src;

    contactfName.value = firstName.innerHTML;
    contactfName.readOnly = true;
    contactfName.classList.add('disabled-input');

    contactlName.value = lastName.innerHTML;
    contactlName.readOnly = true
    contactlName.classList.add('disabled-input');

    addWidgetContainer.classList.remove('hidden');
    selectedContact = contact;
}

//  MAKES SELECTED CONTACT EDITABLE AND SETS UP SAVE ACTION
//
function EditSelectedContact(contact) {

    const editContactButton = contact.querySelector('.edit-this-contact');
    const editImg = contact.querySelector('.edit-icon');

    // Save the contact
    if (editContactButton.value == 'save') {
        editImg.src = 'images/edit_icon.png';
        editContactButton.value = 'edit';
        editContactButton.style.backgroundColor = 'var(--blue)';
        SaveEditedContact(contact);
        return;
    }
    
    const image = contact.querySelector('.contact-icon');
    const firstName = contact.querySelector('.contact-first-name');
    const lastName = contact.querySelector('.contact-last-name');
    const phone = contact.querySelector('.contact-phone');

    editContactButton.style.backgroundColor = 'var(--green)';

    contactImage.src = image.src;
    editImg.src = 'images/save_icon.png';

    contactfName.value = firstName.innerHTML;
    contactfName.readOnly = false
    contactfName.classList.remove('disabled-input');

    contactlName.value = lastName.innerHTML;
    contactlName.readOnly = false;
    contactlName.classList.remove('disabled-input');
    
    addWidgetContainer.classList.remove('hidden');
    editContactButton.value = 'save';
    selectedContact = contact;
}

//  SAVES AN ALREADY EXISTING CONTACT TO THE DATABASE
//
function SaveEditedContact(contact) {

    
}

//  DELETES AN ALREADY EXISTING CONTACT FROM THE DATABASE
//
function DeleteSelectedContact(contact) {
    const deleteButton = contact.querySelector('.delete-this-contact');
    const deleteImg = contact.querySelector('.trash-icon');
    const confirmText = contact.querySelector('.delete-confirm-text');

    if (deleteButton.value == 'delete') {
        console.log("Ask to confirm delete");
        deleteButton.value = 'confirm';
        deleteImg.src = 'images/confirm_delete_icon.png';
        confirmText.classList.remove('no-display');
        deleteButton.value = 'confirm';
        selectedContact = contact;
        return
    }

    console.log('delete');
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
        contactButtons[1].classList.remove('hidden');
        contactButtons[2].classList.remove('hidden');
    })
    contact.addEventListener('mouseleave', (e) => {
        let contactButtons = e.currentTarget.querySelectorAll('button');
        contactButtons[1].classList.add('hidden');
        contactButtons[2].classList.add('hidden');

    })
}

//
//
function AddWidgetToContact(widget) {
    GetWidgetForContact(widget.id);
}

function GetWidgetForContact(draggableWidgetId) {

    if (selectedContact == null) {
        console.log("Contact is not selected");
        return null;
    }
    if (draggableWidgetId == 'widget-note') {
        console.log("Note Widget Added");
    }
}

const addWidgetContainer = document.getElementById('drag-widget-here-to-add');
const widgets = document.querySelectorAll('.draggable-widget');

//  LOGIC FOR DRAGGING AND PLACING WIDGET IN WIDGET AREA
//
widgets.forEach(widget => {

    widget.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData("text/plain", e.target.id);
        setTimeout(() => e.target.classList.add("hidden"), 0);
    });

    widget.addEventListener('dragend', (e) => {
        e.target.classList.remove('hidden');
    })
})

addWidgetContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
})

addWidgetContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const draggableElement = document.getElementById(id);
    console.log(draggableElement);
    AddWidgetToContact(draggableElement);
})