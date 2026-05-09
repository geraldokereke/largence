"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlugUtil = void 0;
const crypto_1 = require("crypto");
class SlugUtil {
    static generateSlug(name) {
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 63);
        return slug || 'org';
    }
    static appendSuffix(slug) {
        const suffix = (0, crypto_1.randomBytes)(2).toString('hex');
        const base = slug.substring(0, 58);
        return `${base}-${suffix}`;
    }
}
exports.SlugUtil = SlugUtil;
//# sourceMappingURL=slug.util.js.map