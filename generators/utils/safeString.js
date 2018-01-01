function SafeString(string) {
  this.string = string;
}
// eslint-disable-next-line
SafeString.prototype.toString = SafeString.prototype.toHTML = function() {
  return `${this.string}`;
};

module.exports = {
  SafeString,
};
