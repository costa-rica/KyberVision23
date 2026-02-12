import {
	DataTypes,
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	ForeignKey,
	NonAttribute,
} from "sequelize";
import { sequelize } from "./_connection";

export class Action extends Model<
	InferAttributes<Action>,
	InferCreationAttributes<Action>
> {
	declare id: CreationOptional<number>;
	declare complexId: number | null;
	declare pointId: number | null;
	declare scriptId: number | null;
	declare playerId: number;
	declare type: number;
	declare subtype: number | null;
	declare quality: string;
	declare timestamp: Date;
	declare area: string;
	declare setNumber: number;
	declare scoreTeamAnalyzed: number;
	declare scoreTeamOther: number;
	declare rotation: string | null;
}

export function initAction() {
	Action.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			complexId: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			pointId: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			scriptId: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			playerId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			type: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			subtype: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			quality: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			timestamp: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			area: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			setNumber: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					min: 1,
					max: 6,
				},
			},
			scoreTeamAnalyzed: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			scoreTeamOther: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			rotation: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "actions",
			indexes: [
				{
					unique: true,
					fields: ["timestamp", "scriptId"],
				},
			],
		}
	);
	return Action;
}
