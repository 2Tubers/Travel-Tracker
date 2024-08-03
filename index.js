import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Capitals",
  password: "Duracell",
  port: 5432,
});
db.connect();

const countries = [];

app.get("/", async (req, res) => {
  const result = await db.query("SELECT country_code FROM visited_countries");

  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });

  res.render("index.ejs", { countries: countries, total: countries.length });
  // db.end();
});
app.post("/add", async (req, res) => {
  const input_country = req.body["country"];
  try {
    var result = await db.query(
      "SELECT country_code FROM countries WHERE country_name LIKE '%' || $1 || '%';",
      [input_country]
    );


    if (result.rows.length === 0) {
      throw new Error("Country Does Not Exist! Try Again");
    }
      try{
      await db.query(
        "INSERT INTO visited_countries(country_code) VALUES ($1)",
        [result.rows[0].country_code]
      );
      
      countries.push(result.rows[0].country_code);
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
      });
      }
      catch(error){
        res.render("index.ejs",{countries: countries,
          total: countries.length,error:"Country Already added"});
      }
  } catch (error) {
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country Does Not Exist! Try Again"
    });
  }
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
