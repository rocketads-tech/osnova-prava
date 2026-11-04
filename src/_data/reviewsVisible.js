const reviews = require("./reviews.json");

const items = reviews.items.filter((review) => review.visible !== false);

module.exports = {
  items,
  hasVisible: items.length > 0,
};
