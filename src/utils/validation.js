const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  
  if (!firstName || !lastName) {
    throw new Error("First name and Last name are required!");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Please enter a valid email address!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password must be strong (Min 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 symbol)");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  return isEditAllowed;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};