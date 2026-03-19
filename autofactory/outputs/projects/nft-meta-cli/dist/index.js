#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const generate_1 = require("./commands/generate");
const rarity_1 = require("./commands/rarity");
const validate_1 = require("./commands/validate");
commander_1.program
    .name('nft-meta')
    .description('CLI tool for batch NFT metadata generation')
    .version('1.0.0');
commander_1.program
    .command('generate')
    .description('Generate NFT metadata from CSV file')
    .requiredOption('-i, --input <path>', 'Input CSV file path')
    .requiredOption('-o, --output <path>', 'Output directory for JSON files')
    .option('--base-uri <uri>', 'Base URI for images', '')
    .action(async (options) => {
    try {
        console.log(chalk_1.default.blue('🎨 Generating NFT metadata...'));
        await (0, generate_1.generateCommand)(options);
        console.log(chalk_1.default.green('✅ Done!'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Error:'), error);
        process.exit(1);
    }
});
commander_1.program
    .command('rarity')
    .description('Calculate rarity scores for generated metadata')
    .requiredOption('-i, --input <path>', 'Input metadata directory')
    .requiredOption('-o, --output <path>', 'Output file for rarity report')
    .action(async (options) => {
    try {
        console.log(chalk_1.default.blue('📊 Calculating rarity scores...'));
        await (0, rarity_1.rarityCommand)(options);
        console.log(chalk_1.default.green('✅ Done!'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Error:'), error);
        process.exit(1);
    }
});
commander_1.program
    .command('validate')
    .description('Validate metadata JSON files')
    .requiredOption('-i, --input <path>', 'Input metadata directory or file')
    .action(async (options) => {
    try {
        console.log(chalk_1.default.blue('🔍 Validating metadata...'));
        await (0, validate_1.validateCommand)(options);
        console.log(chalk_1.default.green('✅ Validation complete!'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Error:'), error);
        process.exit(1);
    }
});
commander_1.program.parse();
