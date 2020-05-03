const app = require("./companylist");
const PORT = process.env.PORT || 3000;
require("dotenv").config();

app.listen(PORT, () => {
  console.log(`Companies API running on http://localhost:${PORT}`);
});
