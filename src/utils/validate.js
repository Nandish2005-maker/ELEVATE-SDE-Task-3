import { STATES } from "./states.js";

const GENDERS = ["Male", "Female", "Other"];

// Checks the request body for a new application.
// Returns { errors, data }: errors is empty when everything is valid.
export function validateApplication(body = {}) {
  const get = (key) => String(body[key] ?? "").trim();
  const data = {
    name: get("name"),
    phone: get("phone"),
    gender: get("gender"),
    city: get("city"),
    state: get("state"),
  };
  const errors = {};

  if (!data.name) errors.name = "Name is required";
  else if (data.name.length < 2 || data.name.length > 100) errors.name = "Name must be 2 to 100 characters";

  if (!data.phone) errors.phone = "Phone is required";
  else if (!/^\d{10}$/.test(data.phone)) errors.phone = "Phone must be exactly 10 digits";

  if (!data.gender) errors.gender = "Gender is required";
  else if (!GENDERS.includes(data.gender)) errors.gender = `Gender must be one of: ${GENDERS.join(", ")}`;

  if (!data.city) errors.city = "City is required";
  else if (data.city.length < 2 || data.city.length > 100) errors.city = "City must be 2 to 100 characters";

  if (!data.state) errors.state = "State is required";
  else if (!STATES.includes(data.state)) errors.state = "State must be a valid Indian state or union territory";

  return { errors, data };
}
