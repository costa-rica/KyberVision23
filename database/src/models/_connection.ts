import { Sequelize } from "sequelize";
import path from "path";

const PATH_DATABASE = process.env.PATH_DATABASE;
const NAME_DB = process.env.NAME_DB;

if (!PATH_DATABASE || !NAME_DB) {
  // Fail fast so consumers don’t get cryptic sqlite errors
  throw new Error("Missing PATH_DATABASE or NAME_DB in environment.");
}

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(PATH_DATABASE, NAME_DB),
  logging: false,
});