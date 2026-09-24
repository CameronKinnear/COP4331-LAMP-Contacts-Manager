
function AddContact() {

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
}

function GetChildren(self) {

}

let selectedWidgets = document.getElementById('selected-contact-widgets');

function AddWidgetToContact(widget) {
    GetWidgetForContact(widget.id);
}

function GetWidgetForContact(draggableWidgetId) {
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