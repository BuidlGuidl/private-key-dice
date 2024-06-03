"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ably = exports.app = exports.envPath = void 0;
var express_1 = require("express");
var mongoose_1 = require("mongoose");
var cors_1 = require("cors");
var dotenv = require("dotenv");
var admin_1 = require("./routes/admin");
var player_1 = require("./routes/player");
var game_1 = require("./routes/game");
var http_1 = require("http");
var ably_1 = require("ably");
var path = require("path");
exports.envPath = path.resolve(__dirname, "./.env");
dotenv.config({ path: exports.envPath });
/* CONFIGURATIONS */
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
}));
exports.app.options("*", (0, cors_1.default)());
/**Ably Setup */
exports.ably = new ably_1.default.Realtime({ key: process.env.ABLY_API_KEY });
var server = http_1.default.createServer(exports.app);
/* MONGOOSE SETUP */
var PORT = process.env.PORT || 6001;
var MONGO_URL = process.env.MONGO_URL || "";
exports.app.use("/admin", admin_1.default);
exports.app.use("/player", player_1.default);
exports.app.use("/game", game_1.default);
exports.app.get('/about', function (req, res) {
    res.send('Dice Demo Backend 🎉 ');
});
var connectWithRetry = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.ably.connection.once("connected")];
            case 1:
                _a.sent();
                exports.ably.channels.get("gameUpdate");
                console.log("connecting");
                mongoose_1.default
                    .connect(MONGO_URL)
                    .then(function () {
                    exports.app.listen(PORT, function () { return console.log("Server Connected, Port: ".concat(PORT)); });
                    // server.listen(PORT, () => console.log(`Server Connected, Port: ${PORT}`));
                })
                    .catch(function (error) {
                    console.log("".concat(error, " did not connect"));
                    setTimeout(connectWithRetry, 3000);
                });
                return [2 /*return*/];
        }
    });
}); };
connectWithRetry();
