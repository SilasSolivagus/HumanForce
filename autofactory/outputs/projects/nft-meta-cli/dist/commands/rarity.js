"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rarityCommand = rarityCommand;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const rarityCalculator_1 = require("../utils/rarityCalculator");
async function rarityCommand(options) {
    const { input, output } = options;
    // Check input directory exists
    if (!(await fs_extra_1.default.pathExists(input))) {
        throw new Error(`Input directory not found: ${input}`);
    }
    // Read all metadata files
    const files = await fs_extra_1.default.readdir(input);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    if (jsonFiles.length === 0) {
        throw new Error('No JSON files found in input directory');
    }
    console.log(chalk_1.default.gray(`📖 Analyzing ${jsonFiles.length} metadata files...`));
    // Load all metadata
    const allMetadata = [];
    for (const file of jsonFiles) {
        const filePath = path_1.default.join(input, file);
        const metadata = await fs_extra_1.default.readJson(filePath);
        const tokenId = path_1.default.basename(file, '.json');
        allMetadata.push({ tokenId, ...metadata });
    }
    // Calculate rarity
    console.log(chalk_1.default.gray('📊 Calculating rarity scores...'));
    const report = (0, rarityCalculator_1.calculateRarity)(allMetadata);
    // Write report
    await fs_extra_1.default.writeJson(output, report, { spaces: 2 });
    console.log(chalk_1.default.green(`✅ Rarity report saved to: ${output}`));
    console.log(chalk_1.default.gray(`   Total NFTs: ${report.totalNfts}`));
    console.log(chalk_1.default.gray(`   Traits analyzed: ${Object.keys(report.traitCounts).length}`));
}
