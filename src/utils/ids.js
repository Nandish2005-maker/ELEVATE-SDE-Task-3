import db from "../db.js";

// Lets people type "app-0001", "#APP-0001" or " APP-0001 " and still match.
export const cleanId = (value) => String(value ?? "").trim().replace(/^#/, "").toUpperCase();

// Next ID like "APP-0006" or "CERT-0003", based on the highest existing number.
// (table and column are fixed values from our own code, never from user input)
export function nextId(table, column, prefix) {
  const { maxNum } = db
    .prepare(`SELECT MAX(CAST(SUBSTR(${column}, ?) AS INTEGER)) AS maxNum FROM ${table}`)
    .get(prefix.length + 2);
  return `${prefix}-${String((maxNum ?? 0) + 1).padStart(4, "0")}`;
}
