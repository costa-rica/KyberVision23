import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
  } from "sequelize";
  import { sequelize } from "./_connection";
  
  export class ContractUserAction extends Model<
    InferAttributes<ContractUserAction>,
    InferCreationAttributes<ContractUserAction>
  > {
    declare id: CreationOptional<number>;
    declare userId: number;
    declare actionId: number;
    declare sessionId: number;
  
    // Optional if you use timestamps:
    // declare createdAt: CreationOptional<Date>;
    // declare updatedAt: CreationOptional<Date>;
  }
  
  export function initContractUserAction() {
    ContractUserAction.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          // Optional FK metadata (mostly informational in Sequelize; sqlite needs PRAGMA ON):
          // references: { model: "users", key: "id" },
        },
        actionId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          // references: { model: "actions", key: "id" },
        },
        sessionId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          // references: { model: "sessions", key: "id" },
        },
      },
      {
        sequelize,                 // <-- required
        tableName: "contractUserAction",
        timestamps: true,          // or false, your choice
        indexes: [
          {
            name: "contractUserAction_user_action_unique",
            unique: true,
            fields: ["userId", "actionId"],
          },
        ],
      }
    );
  
    return ContractUserAction;
  }