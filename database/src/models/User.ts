import {
	DataTypes,
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
} from "sequelize";
import { sequelize } from "./_connection";

export class User extends Model<
	InferAttributes<User>,
	InferCreationAttributes<User>
> {
	declare id: CreationOptional<number>;
	declare firstName: string;
	declare lastName: string;
	declare username: string;
	declare password: string | null;
	declare email: string;
	declare isAdminForKvManagerWebsite: CreationOptional<boolean>;
}

export function initUser() {
	User.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			firstName: {
				type: DataTypes.STRING,
			},
			lastName: {
				type: DataTypes.STRING,
			},
			username: {
				type: DataTypes.STRING,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			isAdminForKvManagerWebsite: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{ tableName: "users", sequelize }
	);
	return User;
}
