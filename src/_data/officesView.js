const offices = require("./offices.json");

const items = offices.items;
const active = items.find((office) => office.active) || items[0];

module.exports = {
  items,
  active,
};
