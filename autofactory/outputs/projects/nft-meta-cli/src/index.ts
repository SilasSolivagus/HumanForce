#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { generateCommand } from './commands/generate';
import { rarityCommand } from './commands/rarity';
import { validateCommand } from './commands/validate';

program
  .name('nft-meta')
  .description('CLI tool for batch NFT metadata generation')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate NFT metadata from CSV file')
  .requiredOption('-i, --input <path>', 'Input CSV file path')
  .requiredOption('-o, --output <path>', 'Output directory for JSON files')
  .option('--base-uri <uri>', 'Base URI for images', '')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🎨 Generating NFT metadata...'));
      await generateCommand(options);
      console.log(chalk.green('✅ Done!'));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

program
  .command('rarity')
  .description('Calculate rarity scores for generated metadata')
  .requiredOption('-i, --input <path>', 'Input metadata directory')
  .requiredOption('-o, --output <path>', 'Output file for rarity report')
  .action(async (options) => {
    try {
      console.log(chalk.blue('📊 Calculating rarity scores...'));
      await rarityCommand(options);
      console.log(chalk.green('✅ Done!'));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate metadata JSON files')
  .requiredOption('-i, --input <path>', 'Input metadata directory or file')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔍 Validating metadata...'));
      await validateCommand(options);
      console.log(chalk.green('✅ Validation complete!'));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

program.parse();