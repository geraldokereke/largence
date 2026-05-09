"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const common_1 = require("@nestjs/common");
const argon2 = require("argon2");
const core_1 = require("@zxcvbn-ts/core");
const language_common_1 = require("@zxcvbn-ts/language-common");
const language_en_1 = require("@zxcvbn-ts/language-en");
let PasswordService = class PasswordService {
    constructor() {
        core_1.zxcvbnOptions.setOptions({
            translations: language_en_1.translations,
            graphs: language_common_1.adjacencyGraphs,
            dictionary: {
                ...language_common_1.dictionary,
            },
        });
    }
    async hash(password) {
        return argon2.hash(password, {
            type: argon2.argon2id,
            timeCost: parseInt(process.env.ARGON2_TIME_COST || '3'),
            memoryCost: parseInt(process.env.ARGON2_MEMORY_COST || '65536'),
            parallelism: parseInt(process.env.ARGON2_PARALLELISM || '4'),
        });
    }
    async verify(hash, password) {
        try {
            return await argon2.verify(hash, password);
        }
        catch (error) {
            return false;
        }
    }
    validateStrength(password, userInputs = []) {
        if (password.length < 12) {
            throw new common_1.BadRequestException('PASSWORD_TOO_SHORT');
        }
        const result = (0, core_1.zxcvbn)(password, userInputs);
        const minScore = parseInt(process.env.ZXCVBN_MIN_SCORE || '3');
        if (result.score < minScore) {
            throw new common_1.BadRequestException({
                message: 'PASSWORD_TOO_WEAK',
                score: result.score,
                suggestions: result.feedback.suggestions,
            });
        }
        return true;
    }
};
exports.PasswordService = PasswordService;
exports.PasswordService = PasswordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PasswordService);
//# sourceMappingURL=password.service.js.map