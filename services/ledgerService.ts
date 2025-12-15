import { LedgerBlock, BlockData, VerificationResult } from '../types';
import { sha256 } from './cryptoUtils';

export class LedgerService {
  private chain: LedgerBlock[] = [];

  constructor() {
    // Try to load from local storage
    const savedChain = localStorage.getItem('sovereign_ledger');
    if (savedChain) {
      this.chain = JSON.parse(savedChain);
    } else {
      this.createGenesisBlock();
    }
  }

  private async calculateBlockHash(index: number, timestamp: number, data: BlockData, previousHash: string): Promise<string> {
    const payload = `${index}${timestamp}${JSON.stringify(data)}${previousHash}`;
    return await sha256(payload);
  }

  private async createGenesisBlock() {
    const genesisData: BlockData = {
      type: 'GENESIS',
      identityId: 'SYSTEM',
      timestamp: Date.now(),
      metadata: 'Sovereign Ledger Genesis',
    };
    
    const hash = await this.calculateBlockHash(0, genesisData.timestamp, genesisData, "0");
    
    const genesisBlock: LedgerBlock = {
      index: 0,
      timestamp: genesisData.timestamp,
      data: genesisData,
      previousHash: "0",
      hash: hash
    };

    this.chain.push(genesisBlock);
    this.saveChain();
  }

  public getChain(): LedgerBlock[] {
    return this.chain;
  }

  public getLatestBlock(): LedgerBlock {
    return this.chain[this.chain.length - 1];
  }

  public async addBlock(data: BlockData): Promise<LedgerBlock> {
    const previousBlock = this.getLatestBlock();
    const index = previousBlock.index + 1;
    const timestamp = Date.now();
    const hash = await this.calculateBlockHash(index, timestamp, data, previousBlock.hash);

    const newBlock: LedgerBlock = {
      index,
      timestamp,
      data,
      previousHash: previousBlock.hash,
      hash
    };

    this.chain.push(newBlock);
    this.saveChain();
    return newBlock;
  }

  public async validateChain(): Promise<VerificationResult> {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // 1. Check Linkage
      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          isValid: false,
          errorBlockIndex: i,
          message: `Broken chain linkage at block ${i}. Previous hash does not match.`
        };
      }

      // 2. Check Data Integrity (Re-hash)
      const recalculatedHash = await this.calculateBlockHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.previousHash
      );

      if (currentBlock.hash !== recalculatedHash) {
        return {
          isValid: false,
          errorBlockIndex: i,
          message: `Data tampering detected at block ${i}. Hash invalid.`
        };
      }
    }

    return { isValid: true, message: 'Ledger integrity verified. All blocks are immutable.' };
  }

  private saveChain() {
    localStorage.setItem('sovereign_ledger', JSON.stringify(this.chain));
  }
  
  public resetLedger() {
      this.chain = [];
      localStorage.removeItem('sovereign_ledger');
      this.createGenesisBlock();
  }
}

export const ledgerService = new LedgerService();
