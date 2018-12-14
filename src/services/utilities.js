// Get current date in ISO format
exports.currentISODate = () => {
  let d = new Date();
  d = d.toISOString();
  d = d.split('T')[0];
  d = d.split('-').join('');
  d = Number(d);
  return d;
};

exports.stringifyISODate = data => {
  const d = data.toString().split('');
  const newDate = [ d[0], d[1], d[2], d[3], '-', d[4], d[5], '-', d[6], d[7] ].join('');
  return newDate;
};
