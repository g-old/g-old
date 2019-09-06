function UserFactory(db) {
  this.db = db;
}

UserFactory.prototype.make = function createUser({
  name,
  surname,
  passwordHash,
  email,
  groups,
  time,
  emailVerified,
}) {
  const creationDate = time || new Date();
  return this.db('users').insert({
    name,
    surname,
    password_hash: passwordHash,
    email,
    groups,
    created_at: creationDate,
    updated_at: creationDate,
    email_verified: emailVerified || false,
    thumbnail: `https://api.adorable.io/avatars/32/${name}${surname}.io.png`,
  });
};

module.exports = UserFactory;
