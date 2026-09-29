let selectedContact = null;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", LoadContacts);
} else {
    LoadContacts();
}

// API Functions
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


// !!! NEED TO UPDATE FOR CURRENT BUTTON ELEMENT
function CreateContactElement(contact) {
    const newElement = document.createElement('div');
    newElement.className = 'contact-element';

    newElement.innerHTML = `
        <button class="select-this-contact button-nodesign" onclick="DisplaySelectedContact(this.parentElement)">
            <div class="contact-left">
                <img src="images/placeholder_user.png" class="contact-icon">
            </div>
            <div class="contact-right">
                <div class="contact-top">
                    <label class="contact-first-name">Placeholder</label>
                    <label class="contact-last-name">Name</label>
                </div>
                <div class="contact-bot">
                    <label class="contact-phone">123-456-7890</label>
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

    // Fill in the data safely
    newElement.querySelector('.contact-first-name').innerHTML = contact.FirstName;
    newElement.querySelector('.contact-last-name').innerHTML = contact.LastName;
    newElement.querySelector('.contact-phone').innerHTML = contact.PhoneNumber;

    AddMouseOverFunctionality(newElement);

    return newElement;
}


function AddNewContact() {
    const jsonTemplate = {  'FirstName' : '', 
                            'LastName' : '', 
                            'PhoneNumber' : ''};
    let newElement = CreateContactElement(jsonTemplate);
    const display = document.getElementById('contacts-display');
    display.appendChild(newElement);
    EditSelectedContact(newElement);
}


// Displays the selected contact to the large column
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

function SaveEditedContact(contact) {

}

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

const contacts = document.querySelectorAll('.contact-element');

contacts.forEach(contact => {
    AddMouseOverFunctionality(contact);
})

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


// Widget Functions

let selectedWidgets = document.getElementById('selected-contact-widgets');

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

// Effects for the widget grab
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