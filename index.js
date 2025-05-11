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

document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault(); 
    window.location.href = "car.html"; 
  });


  async function checkForm(event) {
    event.preventDefault(); // Prevent default form submission

    const form = document.getElementById('contact-form');
    const formData = new FormData(form);

    // Check for required fields
    const requiredFields = ["name", "email", "phone", "location", "address"];
    for (const field of requiredFields) {
      if (!formData.get(field).trim()) {
        alert("Please fill in all required fields!");
        return;
      }
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        document.getElementById('popup-message').style.display = 'block';
        form.reset(); // Clear the form
      } else {
        alert("Something went wrong. Please try again later.");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

