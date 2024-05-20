"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const routes_1 = __importDefault(require("routes/routes"));
require("./utils/response/customSuccess");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
axios_1.default.interceptors.request.use(request => {
    console.log('Starting Request', JSON.stringify(request, null, 2));
    return request;
});
axios_1.default.interceptors.response.use(response => {
    const simplifiedResponse = {
        data: response.data,
        status: response.status,
        headers: response.headers,
    };
    console.log('Response:', JSON.stringify(simplifiedResponse, null, 2));
    return response;
});
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.json());
app.use('/', routes_1.default);
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
    console.log(process.env.DATABASE_URL);
});
//# sourceMappingURL=index.js.map