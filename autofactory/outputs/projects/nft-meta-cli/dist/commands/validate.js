"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommand = validateCommand;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
async function validateCommand(options) {
    const { input } = options;
    // Check if input is file or directory
    const stat = await fs_extra_1.default.stat(input);
    const files = [];
    if (stat.isDirectory()) {
        const allFiles = await fs_extra_1.default.readdir(input);
        files.push(...allFiles.filter(f => f.endsWith('.json')).map(f => path_1.default.join(input, f)));
    }
    else {
        files.push(input);
    }
    if (files.length === 0) {
        throw new Error('No JSON files found');
    }
    console.log(chalk_1.default.gray(`🔍 Validating ${files.length} file(s)...`));
    const results = [];
    let validCount = 0;
    let invalidCount = 0;
    for (const file of files) {
        const result = await validateFile(file);
        results.push(result);
        if (result.valid) {
            validCount++;
            console.log(chalk_1.default.green(`✅ ${path_1.default.basename(file)}`));
        }
        else {
            invalidCount++;
            console.log(chalk_1.default.red(`❌ ${path_1.default.basename(file)}`));
            result.errors.forEach(err => console.log(chalk_1.default.red(`   - ${err}`)));
        }
    }
    console.log(chalk_1.default.blue(`\n📊 Summary: ${validCount} valid, ${invalidCount} invalid`));
    if (invalidCount > 0) {
        process.exit(1);
    }
}
async function validateFile(filePath) {
    const result = {
        file: filePath,
        valid: true,
        errors: []
    };
    try {
        const content = await fs_extra_1.default.readJson(filePath);
        // Check required fields
        const requiredFields = ['name', 'description', 'image', 'attributes'];
        for (const field of requiredFields) {
            if (!(field in content)) {
                result.valid = false;
                result.errors.push(`Missing required field: ${field}`);
            }
        }
        // Validate attributes format
        if (content.attributes) {
            if (!Array.isArray(content.attributes)) {
                result.valid = false;
                result.errors.push('attributes must be an array');
            }
            else {
                for (let i = 0; i < content.attributes.length; i++) {
                    const attr = content.attributes[i];
                    if (!attr.trait_type || !attr.value) {
                        result.valid = false;
                        result.errors.push(`Attribute ${i} missing trait_type or value`);
                    }
                }
            }
        }
    }
    catch (error) {
        result.valid = false;
        result.errors.push(`Invalid JSON: ${error}`);
    }
    return result;
}
