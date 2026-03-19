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

export function calculateRarity(metadata: Metadata[]): RarityReport {
  const totalNfts = metadata.length;
  
  // Count trait occurrences
  const traitCounts: Record<string, Record<string, number>> = {};
  
  for (const nft of metadata) {
    for (const attr of nft.attributes) {
      if (!traitCounts[attr.trait_type]) {
        traitCounts[attr.trait_type] = {};
      }
      if (!traitCounts[attr.trait_type][attr.value]) {
        traitCounts[attr.trait_type][attr.value] = 0;
      }
      traitCounts[attr.trait_type][attr.value]++;
    }
  }

  // Calculate rarity score for each NFT
  const scores = metadata.map(nft => {
    let rarityScore = 0;
    
    for (const attr of nft.attributes) {
      const count = traitCounts[attr.trait_type][attr.value];
      const rarity = 1 / (count / totalNfts);
      rarityScore += rarity;
    }

    return {
      tokenId: nft.tokenId,
      rarityScore: Math.round(rarityScore * 100) / 100
    };
  });

  // Sort by rarity score (descending)
  scores.sort((a, b) => b.rarityScore - a.rarityScore);

  // Assign ranks
  const rankings = scores.map((s, index) => ({
    ...s,
    rank: index + 1
  }));

  return {
    totalNfts,
    traitCounts,
    rankings
  };
}