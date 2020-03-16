const faker = require("faker");

function create() {
  return {
    fullname: faker.name.firstName(),
    username: faker.name.firstName(),
    email: faker.internet.email().toLowerCase(),
    isAdmin: true,
    password: faker.internet.password()
  };
}

module.exports = {
  create
}
