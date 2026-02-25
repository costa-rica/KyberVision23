"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.tokenizeObject = tokenizeObject;
exports.detokenizeObject = detokenizeObject;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("@kybervision/db");
async function authenticateToken(req, res, next) {
    if (process.env.AUTHENTIFICATION_TURNED_OFF === "true") {
        const user = await db_1.User.findOne({ where: { email: "nrodrig1@gmail.com" } });
        req.user = { id: user === null || user === void 0 ? void 0 : user.id };
        return next();
    }
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        res.status(401).json({ message: "Token is required" });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            res.status(403).json({ message: "Invalid token" });
            return;
        }
        const { id } = decoded;
        const user = await db_1.User.findByPk(id);
        req.user = user;
        next();
    });
}
function tokenizeObject(object) {
    return jsonwebtoken_1.default.sign(object, process.env.JWT_SECRET);
}
function detokenizeObject(token) {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
}
