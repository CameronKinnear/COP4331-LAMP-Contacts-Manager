
function AddContact() {

}

let contactImage = document.getElementById('selected-contact-img');
function DisplaySelectedContact(parent) {
    const image = parent.querySelector('.contact-icon');
    const firstName = parent.querySelector('.contact-first-name');
    const lastName = parent.querySelector('.contact-last-name');
    const phone = parent.querySelector('.contact-phone');

    console.log(image);
    contactImage.src = image.src;
}

function GetChildren(self) {

}