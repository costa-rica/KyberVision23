import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./_connection";

export class Complex extends Model<
  InferAttributes<Complex>,
  InferCreationAttributes<Complex>
> {
  declare id: CreationOptional<number>;
  declare type: string;
}

export function initComplex() {
  Complex.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: /^K.+/,
        },
      },
    },
    {
      sequelize,
      tableName: "complexes",
    }
  );
  return Complex;
}