function validateForm() {
    var email = document.querySelector('#signupForm input[type="email"]').value;
    var password = document.querySelector('#signupForm input[type="password"]').value;

    var emailError = document.getElementById('emailError');
    var passwordError = document.getElementById('passwordError');

    emailError.innerHTML = "";
    passwordError.innerHTML = "";

    if (email.trim() === "") {
        emailError.innerHTML = "Please enter your email.";
    }

    if (password.trim() === "") {
        passwordError.innerHTML = "Please enter your password.";
    }
}
