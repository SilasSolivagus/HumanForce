"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommand = generateCommand;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const csvParser_1 = require("../utils/csvParser");
const chalk_1 = __importDefault(require("chalk"));
async function generateCommand(options) {
    const { input, output, baseUri } = options;
    // Check input file exists
    if (!(await fs_extra_1.default.pathExists(input))) {
        throw new Error(`Input file not found: ${input}`);
    }
    // Create output directory
    await fs_extra_1.default.ensureDir(output);
    // Parse CSV
    console.log(chalk_1.default.gray(`📖 Reading CSV: ${input}`));
    const records = await (0, csvParser_1.parseCSV)(input);
    console.log(chalk_1.default.gray(`   Found ${records.length} records`));
    // Generate metadata for each record
    let generated = 0;
    for (const record of records) {
        const metadata = buildMetadata(record, baseUri);
        const tokenId = record.token_id || String(generated + 1);
        const outputPath = path_1.default.join(output, `${tokenId}.json`);
        await fs_extra_1.default.writeJson(outputPath, metadata, { spaces: 2 });
        generated++;
    }
    console.log(chalk_1.default.green(`✅ Generated ${generated} metadata files in ${output}`));
}
function buildMetadata(record, baseUri) {
    const attributes = [];
    // Extract attributes (columns that aren't standard fields)
    const standardFields = ['token_id', 'name', 'description', 'image'];
    for (const [key, value] of Object.entries(record)) {
        if (!standardFields.includes(key.toLowerCase()) && value) {
            attributes.push({
                trait_type: key,
                value: value
            });
        }
    }
    // Build image URL
    let imageUrl = record.image || '';
    if (baseUri && !imageUrl.startsWith('http')) {
        imageUrl = `${baseUri}/${imageUrl}`.replace(/\/+/g, '/');
    }
    return {
        name: record.name || `NFT #${record.token_id}`,
        description: record.description || '',
        image: imageUrl,
        attributes
    };
}
