isContactSelected = false;

// API Functions
document.addEventListener("DOMContentLoaded", () => {


    // Prepare JSON payload
    const payload = {
        contacts: true,
        Id: sessionStorage.getItem['userId']
    }

    fetch("api/contacts.php", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            if (data.error && data.error.length > 0) {
                // Data error
                console.log('data error');
            } else {
                // 200 OK
                console.log(data);
            }
        })
        .catch(error => {
            // Error fetching response
            console.log(error);
        });
});


function AddNewContact() {

}

let contactImage = document.getElementById('selected-contact-img');
let contactfName = document.getElementById('selected-contact-first-name');
let contactlName = document.getElementById('selected-contact-last-name');

function DisplaySelectedContact(parent) {
    const image = parent.querySelector('.contact-icon');
    const firstName = parent.querySelector('.contact-first-name');
    const lastName = parent.querySelector('.contact-last-name');
    const phone = parent.querySelector('.contact-phone');

    contactImage.src = image.src;
    contactfName.innerHTML = firstName.innerHTML
    contactlName.innerHTML = lastName.innerHTML
    addWidgetContainer.classList.remove('hidden');
    isContactSelected = true;
}

function GetChildren(self) {

}

let selectedWidgets = document.getElementById('selected-contact-widgets');

function AddWidgetToContact(widget) {
    GetWidgetForContact(widget.id);
}

function GetWidgetForContact(draggableWidgetId) {

    if (isContactSelected == false) {
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