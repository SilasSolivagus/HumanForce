interface Metadata {
    tokenId: string;
    name: string;
    description: string;
    image: string;
    attributes: Array<{
        trait_type: string;
        value: string;
    }>;
}
interface RarityReport {
    totalNfts: number;
    traitCounts: Record<string, Record<string, number>>;
    rankings: Array<{
        tokenId: string;
        rarityScore: number;
        rank: number;
    }>;
}
export declare function calculateRarity(metadata: Metadata[]): RarityReport;
export {};
//# sourceMappingURL=rarityCalculator.d.ts.map