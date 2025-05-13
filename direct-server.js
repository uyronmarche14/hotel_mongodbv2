// Simple Express server for testing without database
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Direct server running on http://localhost:${PORT} 🚀`);
  console.log(`Admin credentials: admin@admin.com / admin123`);
}); 