#!/usr/bin/env bun
/*
  Resolve a chain ID via ChainResolver.resolve(bytes,bytes)
  - Loads config from .env.local (NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS, NEXT_PUBLIC_SEPOLIA_RPC_URLS)
  - Computes ENS namehash for '<label>.cid.eth' offline
  - Encodes text(bytes32,string) with key 'chain-id'
  - Calls resolve('0x', data) and decodes the returned bytes

  Usage:
    bun run scripts/resolve-chainid.ts <label>
    # example: bun run scripts/resolve-chainid.ts base
*/

import { readFileSync, existsSync } from 'node:fs';
import { resolve as pathResolve } from 'node:path';
import { Interface, JsonRpcProvider, keccak256, toUtf8Bytes, getBytes, hexlify } from 'ethers';

type Hex = `0x${string}`;

function loadEnv() {
  const root = process.cwd();
  const files = ['.env.local', '.env'];
  for (const f of files) {
    const p = pathResolve(root, f);
    if (!existsSync(p)) continue;
    const txt = readFileSync(p, 'utf8');
    for (const lineRaw of txt.split(/\r?\n/)) {
      const line = lineRaw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim().replace(/^"|"$/g, '');
      if (!(key in process.env)) process.env[key] = val;
    }
  }
}

function namehash(fqdn: string): Hex {
  let node: Uint8Array = new Uint8Array(32); // 0x00...00
  const name = fqdn.trim().toLowerCase();
  if (name.length === 0) return hexlify(node) as Hex;
  const labels = name.split('.');
  for (let i = labels.length - 1; i >= 0; i--) {
    const labelHash = getBytes(keccak256(toUtf8Bytes(labels[i])));
    const buf = new Uint8Array(64);
    buf.set(node, 0);
    buf.set(labelHash, 32);
    node = getBytes(keccak256(buf)) as Uint8Array;
  }
  return hexlify(node) as Hex;
}

async function main() {
  loadEnv();

  const label = (process.argv[2] || 'base').toLowerCase();
  const fqdn = `${label}.cid.eth`;
  const node = namehash(fqdn);

  const RESOLVER = (process.env.NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS || '').trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(RESOLVER)) {
    throw new Error('Missing or invalid NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS in .env.local');
  }

  const urlsEnv = (process.env.NEXT_PUBLIC_SEPOLIA_RPC_URLS || '').split(',').map(s => s.trim()).filter(Boolean);
  const rpcUrls = urlsEnv.length ? urlsEnv : [
    'https://ethereum-sepolia.publicnode.com',
    'https://rpc.sepolia.org',
    'https://endpoints.omniatech.io/v1/eth/sepolia/public',
  ];
  const rpcUrl = rpcUrls[0];

  const textIface = new Interface(['function text(bytes32,string) view returns (string)']);
  const resolverIface = new Interface(['function resolve(bytes,bytes) view returns (bytes)']);

  const data = textIface.encodeFunctionData('text', [node, 'chain-id']);
  const callData = resolverIface.encodeFunctionData('resolve', ['0x', data]);

  try {
    const provider = new JsonRpcProvider(rpcUrl);
    const out = await provider.call({ to: RESOLVER, data: callData });
    const [rawText] = textIface.decodeFunctionResult('text', out) as unknown as [string];
    const match = /0x[0-9a-fA-F]{64}/.exec(rawText);
    const chainIdHexString = match ? match[0] : rawText;
    console.log(JSON.stringify({ label, fqdn, node, resolver: RESOLVER, rpcUrl, chainId: chainIdHexString }, null, 2));
    return;
  } catch (e) {
    throw e;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
