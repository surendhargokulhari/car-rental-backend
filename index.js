function bookCar(carModel) {
    document.getElementById('cars').style.display = 'none';
    document.getElementById('booking-form').style.display = 'block';
    document.getElementById('car-model').value = carModel;
}

document.getElementById('booking-form').addEventListener('submit', function(event) {
    event.preventDefault();
    window.location.href = "payment.html";
    document.getElementById("booking-form").reset();
   



});





