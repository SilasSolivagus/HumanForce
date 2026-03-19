# NFT Metadata Batch Generator CLI

一个用于批量生成 NFT 元数据 JSON 文件的命令行工具。

## 功能

- 从 CSV/Excel 读取 NFT 属性数据
- 批量生成符合 OpenSea 标准的元数据 JSON
- 自动计算稀有度排名
- 支持 IPFS 批量上传
- 验证元数据格式

## 安装

```bash
npm install -g nft-metadata-cli
```

## 使用

```bash
# 从 CSV 生成元数据
nft-meta generate --input ./traits.csv --output ./metadata/

# 带 IPFS 上传
nft-meta generate --input ./traits.csv --output ./metadata/ --pin-to-ipfs

# 验证元数据
nft-meta validate --input ./metadata/
```

## CSV 格式示例

```csv
token_id,name,description,image_url,trait_type_1,trait_value_1,trait_type_2,trait_value_2
1,Monkey #1,A cool monkey,https://.../1.png,Fur,Blue,Eyes,Red
2,Monkey #2,Another monkey,https://.../2.png,Fur,Red,Eyes,Blue
```

## 输出示例

```json
{
  "name": "Monkey #1",
  "description": "A cool monkey",
  "image": "ipfs://Qm.../1.png",
  "attributes": [
    { "trait_type": "Fur", "value": "Blue" },
    { "trait_type": "Eyes", "value": "Red" }
  ]
}
```

## 技术栈

- TypeScript
- Node.js
- commander.js (CLI)
- csv-parser
- ipfs-http-client
