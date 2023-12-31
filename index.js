import express, { json } from "express";
import morgan from "morgan";
import cors from "cors";
const app = express();

app.use(cors());
app.use(json());

app.use(express.static("build"));

app.use(
  morgan((tokens, req, res) => {
    morgan.token("body", function (req, res) {
      return JSON.stringify(req.body);
    });

    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req, res),
    ].join(" ");
  })
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (request, response) => {
  response.send(`
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date().toString()}</p>
  `);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = +request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.statusMessage = "The person doesn't exist";
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/persons", (request, response) => {
  const { name, number } = request.body;

  const errors = [];

  if (!name) errors.push("name is missing");
  if (!number) errors.push("number is missing");
  if (name && persons.find((p) => p.name.toLowerCase() === name.toLowerCase()))
    errors.push("name must be unique");

  if (errors.length > 0)
    return response.status(400).json({
      errors,
    });

  const person = {
    name,
    number,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
