const app = require('./app');
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`ReliefTrack Express API Server running on port ${PORT}`);
});

module.exports = server;
