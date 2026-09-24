
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

function AddWidgetToContact() {
    
}