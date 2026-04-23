/**
 * Real-time KYC field validation utility
 * Returns { valid, error, suggestion } for each field
 */

const NEPAL_DISTRICTS = [
  'Achham','Arghakhanchi','Baglung','Baitadi','Bajhang','Bajura','Banke','Bara',
  'Bardiya','Bhaktapur','Bhojpur','Chitwan','Dadeldhura','Dailekh','Dang','Darchula',
  'Dhading','Dhankuta','Dhanusa','Dolakha','Dolpa','Doti','Eastern Rukum','Gorkha',
  'Gulmi','Humla','Ilam','Jajarkot','Jhapa','Jumla','Kailali','Kalikot','Kanchanpur',
  'Kapilvastu','Kaski','Kathmandu','Kavrepalanchok','Khotang','Lalitpur','Lamjung',
  'Mahottari','Makwanpur','Manang','Morang','Mugu','Mustang','Myagdi','Nawalparasi East',
  'Nawalparasi West','Nuwakot','Okhaldhunga','Palpa','Panchthar','Parbat','Parsa',
  'Pyuthan','Ramechhap','Rasuwa','Rautahat','Rolpa','Rupandehi','Salyan','Sankhuwasabha',
  'Saptari','Sarlahi','Sindhuli','Sindhupalchok','Siraha','Solukhumbu','Sunsari',
  'Surkhet','Syangja','Tanahu','Taplejung','Terhathum','Udayapur','Western Rukum',
];

const validators = {
  fullName: (value) => {
    if (!value || value.trim().length < 3)
      return { valid: false, error: 'Full name must be at least 3 characters', suggestion: 'Enter your name as per citizenship certificate' };
    if (/\d/.test(value))
      return { valid: false, error: 'Name should not contain numbers', suggestion: 'Use letters only' };
    if (value.trim().split(' ').length < 2)
      return { valid: false, error: 'Please enter full name (first and last name)', suggestion: 'e.g. Bigam Pachhai' };
    return { valid: true };
  },

  dateOfBirth: (value) => {
    if (!value) return { valid: false, error: 'Date of birth is required' };
    const date = new Date(value);
    if (isNaN(date.getTime()))
      return { valid: false, error: 'Invalid date format', suggestion: 'Use YYYY-MM-DD format, e.g. 1999-05-15' };
    const age = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 16)
      return { valid: false, error: 'You must be at least 16 years old', suggestion: 'KYC requires minimum age of 16' };
    if (age > 120)
      return { valid: false, error: 'Invalid date of birth', suggestion: 'Please enter a valid date' };
    return { valid: true };
  },

  documentNumber: (value, documentType) => {
    if (!value) return { valid: false, error: 'Document number is required' };

    if (documentType === 'citizenship' || !documentType) {
      // Nepal citizenship format: XX-XX-XX-XXXXX
      const citizenshipRegex = /^\d{2}-\d{2}-\d{2}-\d{5}$/;
      if (!citizenshipRegex.test(value.trim()))
        return {
          valid: false,
          error: 'Invalid citizenship number format',
          suggestion: 'Format should be XX-XX-XX-XXXXX, e.g. 12-34-56-78901',
        };
    } else if (documentType === 'passport') {
      // Nepal passport: 2 uppercase letters + 7 digits
      const passportRegex = /^[A-Z]{2}\d{7}$/;
      if (!passportRegex.test(value.trim().toUpperCase()))
        return {
          valid: false,
          error: 'Invalid passport number format',
          suggestion: 'Format: 2 letters + 7 digits, e.g. PA1234567',
        };
    } else if (documentType === 'driving_license') {
      if (value.trim().length < 6)
        return { valid: false, error: 'Driving license number too short', suggestion: 'Enter the full license number' };
    }

    return { valid: true };
  },

  permanentDistrict: (value) => {
    if (!value) return { valid: false, error: 'District is required' };
    const match = NEPAL_DISTRICTS.some(d => d.toLowerCase() === value.toLowerCase());
    if (!match)
      return {
        valid: false,
        error: 'Please select a valid Nepal district',
        suggestion: 'Choose from the dropdown list of 77 districts',
      };
    return { valid: true };
  },

  permanentMunicipality: (value) => {
    if (!value || value.trim().length < 2)
      return { valid: false, error: 'Municipality is required', suggestion: 'e.g. Butwal Sub-Metropolitan City' };
    return { valid: true };
  },

  documentIssuedDate: (value) => {
    if (!value) return { valid: true }; // optional
    const date = new Date(value);
    if (isNaN(date.getTime()))
      return { valid: false, error: 'Invalid date format', suggestion: 'Use YYYY-MM-DD format' };
    if (date > new Date())
      return { valid: false, error: 'Issue date cannot be in the future', suggestion: 'Enter the actual date on your document' };
    return { valid: true };
  },

  fatherName: (value) => {
    if (!value || value.trim().length < 3) return { valid: true }; // optional
    if (/\d/.test(value))
      return { valid: false, error: "Father's name should not contain numbers" };
    return { valid: true };
  },

  phone: (value) => {
    if (!value) return { valid: true }; // optional
    const phoneRegex = /^(\+977)?[9][6-9]\d{8}$/;
    const cleaned = value.replace(/\s/g, '');
    if (!phoneRegex.test(cleaned))
      return {
        valid: false,
        error: 'Invalid Nepal phone number',
        suggestion: 'Format: 98XXXXXXXX or +97798XXXXXXXX',
      };
    return { valid: true };
  },
};

const validateKYCField = (field, value, documentType) => {
  const validator = validators[field];
  if (!validator) return { valid: true };
  return validator(value, documentType);
};

const validateFullKYCForm = (data) => {
  const errors = {};
  const fieldsToValidate = [
    'fullName', 'dateOfBirth', 'documentNumber',
    'permanentDistrict', 'permanentMunicipality',
  ];
  fieldsToValidate.forEach(field => {
    const result = validateKYCField(field, data[field], data.documentType);
    if (!result.valid) errors[field] = result;
  });
  return { valid: Object.keys(errors).length === 0, errors };
};

module.exports = { validateKYCField, validateFullKYCForm, NEPAL_DISTRICTS };
