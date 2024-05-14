import { ethers } from "ethers";
import { CONST } from "../common/const.js";
import utils from "../common/util.js";

const rpc_url = CONST.RPC_URL;
const provider = new ethers.JsonRpcProvider(rpc_url);

const BizNftAbi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function _lastTokenId() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

const erc721Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

const erc1155Abi = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function uri(uint256 id) view returns (string)",
];

export const getOwn = (eoa: string, ca: string, type?: string | null) => {
  console.log("getOwn runninng eoa:" + eoa + " ca:" + ca);
  if (type == "721") {
    return getERC721Tokens(eoa, ca);
  } else if (type == "1155") {
    const tokenIds = Array.from({ length: 100 }, (_, i) => i + 1);
    return getERC1155Tokens(eoa, ca, tokenIds);
  } else {
    return getBizNft(eoa, ca);
  }
};

async function getBizNft(ownerAddress: string, contractAddress: string) {
  const contract = new ethers.Contract(contractAddress, BizNftAbi, provider);
  try {
    const balance = await contract.balanceOf(ownerAddress);
    if (balance < 0) {
      console.log("not own");
      return [];
    }

    const lastTokenId = await contract._lastTokenId();
    let tokens = [];
    for (let i = lastTokenId; i > 0; i--) {
      const tokenURI = await contract.tokenURI(i);
      const owner = await contract.ownerOf(i);
      if (utils.isAddressesEqual(owner, ownerAddress)) {
        tokens.push({ tokenId: i, owner: owner, tokenURI });
      }
    }

    console.dir(tokens);
    return tokens;
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

async function getERC721Tokens(ownerAddress: string, contractAddress: string) {
  const contract = new ethers.Contract(contractAddress, erc721Abi, provider);
  try {
    const balance = await contract.balanceOf(ownerAddress);

    let tokens = [];
    for (let i = 0; i < balance; i++) {
      const tokenId = await contract.tokenOfOwnerByIndex(ownerAddress, i);
      const tokenURI = await contract.tokenURI(tokenId);
      tokens.push({ tokenId: tokenId.toString(), tokenURI });
    }
    return tokens;
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

async function getERC1155Tokens(ownerAddress, contractAddress, tokenIds) {
  const contract = new ethers.Contract(contractAddress, erc1155Abi, provider);
  let tokens = [];

  for (let tokenId of tokenIds) {
    const balance = await contract.balanceOf(ownerAddress, tokenId);
    if (balance > 0) {
      const tokenURI = await contract.uri(tokenId);
      tokens.push({
        tokenId: tokenId.toString(),
        balance: balance.toString(),
        tokenURI,
      });
    }
  }
  return tokens;
}
