const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};

const getUserByEmail = function (email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
};

module.exports = { generateRandomString, getUserByEmail };
