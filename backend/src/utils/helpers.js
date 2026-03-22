const crypto = require('crypto');

const generateStudentId = () => {
  const prefix = 'STU';
  const timestamp = Date.now().toString().slice(-6);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

const generateTeacherId = () => {
  const prefix = 'TCH';
  const timestamp = Date.now().toString().slice(-6);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

const calculateGrade = (score) => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

module.exports = {
  generateStudentId,
  generateTeacherId,
  calculateGrade,
};
