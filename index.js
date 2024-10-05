
function bookCar(carModel) {
    document.getElementById('cars').style.display = 'none';
    document.getElementById('booking-form').style.display = 'block';
    document.getElementById('car-model').value = carModel;
}

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Thank you for booking with us!');
    document.getElementById('booking-form').reset();
    document.getElementById('booking-form').style.display = 'none';
    document.getElementById('cars').style.display = 'block';
})




