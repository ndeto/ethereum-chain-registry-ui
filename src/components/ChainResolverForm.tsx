"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';
import { CHAIN_RESOLVER_ADDRESS } from '@/lib/addresses';
import { fetchChainDataById } from '@/lib/registry';
import { buildCaip2Identifier, computeCaip2HashOnChain } from '@/lib/caip2';
import { Loader2, Search, Wallet, AlertTriangle, CheckCircle, ArrowRight, Copy } from 'lucide-react';

// Hardcoded Resolver config (update with your deployed resolver)
const TARGET_NETWORK_NAME = 'Sepolia';
const TARGET_CHAIN_ID_HEX = '0xaa36a7'; // Sepolia
const TARGET_CHAIN_ID_DECIMAL = BigInt(TARGET_CHAIN_ID_HEX);
const RESOLVER = CHAIN_RESOLVER_ADDRESS as string;

// ChainResolver ABI subset per provided contract
const CHAIN_RESOLVER_ABI = [
  { type: 'function', name: 'computeNode', stateMutability: 'pure', inputs: [{ name: 'chainName', type: 'string' }], outputs: [{ name: '', type: 'bytes32' }] },
  { type: 'function', name: 'nodeToChainId', stateMutability: 'view', inputs: [{ name: '', type: 'bytes32' }], outputs: [{ name: '', type: 'bytes32' }] },
] as const;


const ChainResolverForm: React.FC = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [networkName, setNetworkName] = useState<string>('');
  const [chainIdHex, setChainIdHex] = useState<string>('');
  const [inputName, setInputName] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const [nodeHash, setNodeHash] = useState<string>('');
  const [resolvedChainId, setResolvedChainId] = useState<string>('');
  const [resolvedChainData, setResolvedChainData] = useState<any>(null);
  const [caip2Identifier, setCaip2Identifier] = useState<string>('');
  const [caip2Hash, setCaip2Hash] = useState<string>('');
  const [chainDataExists, setChainDataExists] = useState<boolean | null>(null);

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      console.debug('[Resolver] copied', label, value);
      toast({ title: 'Copied', description: `${label} copied to clipboard.` });
    } catch (e) {
      console.error('[Resolver] copy failed', e);
      toast({ variant: 'destructive', title: 'Copy failed', description: 'Could not copy to clipboard.' });
    }
  };

  const connectWallet = async () => {
    try {
      const eth = (window as any)?.ethereum;
      if (!eth) {
        toast({ variant: 'destructive', title: 'MetaMask Required', description: 'Please install MetaMask or a compatible wallet.' });
        return;
      }
      await eth.request?.({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      setAccount(address);
      setIsConnected(true);
      setNetworkName(network.name || 'unknown');
      setChainIdHex(`0x${network.chainId.toString(16)}`);
      toast({ title: 'Wallet Connected', description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}` });
    } catch (e: any) {
      // Log detailed wallet connection error for debugging
      console.error('[Resolver] connectWallet error', {
        code: e?.code,
        reason: e?.reason,
        shortMessage: e?.shortMessage,
        message: e?.message,
        data: e?.data,
        error: e,
      });
      toast({ variant: 'destructive', title: 'Connection Failed', description: 'Failed to connect to wallet.' });
    }
  };

  const switchToTarget = async () => {
    try {
      const eth = (window as any)?.ethereum;
      if (!eth?.request) return;
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: TARGET_CHAIN_ID_HEX }] });
      const provider = new ethers.BrowserProvider(eth);
      const network = await provider.getNetwork();
      setNetworkName(network.name || 'unknown');
      setChainIdHex(`0x${network.chainId.toString(16)}`);
      toast({ title: 'Switched Network', description: `Now on ${TARGET_NETWORK_NAME}` });
    } catch (error: any) {
      console.error('[Resolver] switchToTarget error', {
        code: error?.code,
        reason: error?.reason,
        shortMessage: error?.shortMessage,
        message: error?.message,
        data: error?.data,
        error,
      });
      if (error?.code === 4902) {
        try {
          const eth = (window as any)?.ethereum;
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: TARGET_CHAIN_ID_HEX,
                chainName: TARGET_NETWORK_NAME,
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.infura.io/v3/491fabfa082d4aa9bb1b1688a5f05be4'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              },
            ],
          });
          toast({ title: `${TARGET_NETWORK_NAME} Added`, description: 'Try switching again.' });
        } catch (addErr: any) {
          console.error('[Resolver] add chain error', addErr);
          toast({ variant: 'destructive', title: 'Switch Failed', description: `Could not add/switch to ${TARGET_NETWORK_NAME}.` });
        }
      } else {
        toast({ variant: 'destructive', title: 'Switch Failed', description: 'User rejected or wallet error.' });
      }
    }
  };

  useEffect(() => {
    const eth = (window as any)?.ethereum;
    if (!eth) return;
    // Initialize without prompting if already authorized
    (async () => {
      try {
        const accounts: string[] = await eth.request?.({ method: 'eth_accounts' });
        if (accounts?.length) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
        const provider = new ethers.BrowserProvider(eth);
        const network = await provider.getNetwork();
        setNetworkName(network.name || 'unknown');
        setChainIdHex(`0x${network.chainId.toString(16)}`);
      } catch (e) {
        console.warn('[Resolver] init failed', e);
      }
    })();
    if (!eth.on) return;
    const onChain = (_chainId: string) => {
      setChainIdHex(_chainId);
      const provider = new ethers.BrowserProvider(eth);
      provider.getNetwork().then((n) => setNetworkName(n.name || 'unknown')).catch(() => {});
    };
    const onAccounts = (accounts: string[]) => {
      setAccount(accounts?.[0] || '');
      setIsConnected(!!accounts?.[0]);
    };
    eth.on('chainChanged', onChain);
    eth.on('accountsChanged', onAccounts);
    return () => {
      eth.removeListener?.('chainChanged', onChain);
      eth.removeListener?.('accountsChanged', onAccounts);
    };
  }, []);

  const handleResolve = async () => {
    if (!inputName.trim()) {
      toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please enter a chain name, e.g., base' });
      return;
    }

    const isZero = typeof CHAIN_RESOLVER_ADDRESS === 'string' && CHAIN_RESOLVER_ADDRESS.toLowerCase() === '0x0000000000000000000000000000000000000000';
    const isValidAddr = typeof CHAIN_RESOLVER_ADDRESS === 'string' && /^0x[a-fA-F0-9]{40}$/.test(CHAIN_RESOLVER_ADDRESS) && !isZero;
    if (!isValidAddr) {
      toast({ variant: 'destructive', title: 'Missing Resolver Address', description: 'Set CHAIN_RESOLVER_ADDRESS in ChainResolverForm.tsx' });
      return;
    }

    try {
      setIsResolving(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      if (network.chainId !== TARGET_CHAIN_ID_DECIMAL) {
        toast({ variant: 'destructive', title: 'Wrong Network', description: `Please switch to ${TARGET_NETWORK_NAME}.` });
        return;
      }
      const resolver = new ethers.Contract(RESOLVER, CHAIN_RESOLVER_ABI, provider);
      console.debug('[Resolver] computeNode(label)', { label: inputName });
      const node: string = await resolver.computeNode(inputName);
      console.debug('[Resolver] computeNode result', { node });
      setNodeHash(node);
      console.debug('[Resolver] nodeToChainId(node)');
      const chainId: string = await resolver.nodeToChainId(node);
      console.debug('[Resolver] nodeToChainId result', { chainId });
      setResolvedChainId(chainId);
      toast({ title: 'Resolved', description: 'Chain ID resolved via node mapping.' });

      // Fetch chain data from Sepolia registry
      try {
        console.debug('[Resolver] registry.chainData for chainId', { chainId });
        const { data, exists } = await fetchChainDataById(chainId);
        console.debug('[Resolver] chainData (mapping getter)', data);
        setChainDataExists(exists);
        setResolvedChainData(data);
        if (exists) {
          const id = buildCaip2Identifier(data.chainNamespace, data.chainReference);
          const hash = await computeCaip2HashOnChain(data.chainNamespace, data.chainReference);
          setCaip2Identifier(id);
          setCaip2Hash(hash);
          console.debug('[Resolver] CAIP-2', { id, hash });
        } else {
          setCaip2Identifier('');
          setCaip2Hash('');
        }
      } catch (regErr: any) {
        console.error('[Resolver] chainDataFromId error', {
          code: regErr?.code,
          reason: regErr?.reason,
          shortMessage: regErr?.shortMessage,
          message: regErr?.message,
          data: regErr?.data,
          error: regErr,
        });
        // Handle empty result (RPC returned 0x) as not found
        if (regErr?.code === 'BAD_DATA' && (regErr?.value === '0x' || regErr?.info?.signature?.includes('chainData'))) {
          setChainDataExists(false);
          setResolvedChainData(null);
        } else {
          setChainDataExists(null);
        }
      }
    } catch (e: any) {
      // Detailed contract error logging
      console.error('[Resolver] resolution error', {
        code: e?.code,
        reason: e?.reason,
        shortMessage: e?.shortMessage,
        message: e?.message,
        data: e?.data,
        revert: e?.error?.message,
        error: e,
      });
      toast({ variant: 'destructive', title: 'Resolve Failed', description: e?.shortMessage || e?.reason || e?.message || 'Failed to resolve chain name.' });
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-full">
            <Search className="h-5 w-5" />
            <span className="text-primary-foreground font-medium">Chain Name Resolver</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Resolve Chain Name</h1>
          <p className="text-muted-foreground text-lg">Enter a chain reference (e.g., base) to resolve its ERC-7785 chain ID. The full name will be label.cid.eth.</p>
        </div>

        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Resolver Input
            </CardTitle>
            <CardDescription>Lookup chain ID by label via computeNode + nodeToChainId.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chainRef" className="text-sm font-medium">Chain Reference</Label>
                <div className="relative">
                  <Input id="chainRef" placeholder="e.g., base" value={inputName} onChange={(e) => setInputName(e.target.value)} className="pr-20" />
                  <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground pointer-events-none">.cid.eth</span>
                </div>
                <div className="text-xs text-muted-foreground">Full name: <code className="font-mono">{(inputName || '<label>') + '.cid.eth'}</code></div>
              </div>
            </div>

            {!isConnected ? (
              <Button type="button" onClick={connectWallet} className="w-full bg-gradient-primary hover:shadow-glow transition-smooth text-primary-foreground font-semibold py-3">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <>
                <div className="flex flex-col gap-2 p-3 bg-secondary/50 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Network: {networkName || 'unknown'} ({chainIdHex || 'n/a'})</div>
                  {chainIdHex?.toLowerCase() !== TARGET_CHAIN_ID_HEX.toLowerCase() && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-amber-700 dark:text-amber-400">Resolver is deployed on {TARGET_NETWORK_NAME}.</div>
                      <Button size="sm" variant="secondary" type="button" onClick={switchToTarget}>Switch to {TARGET_NETWORK_NAME}</Button>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Note:</strong> This uses a view call on the resolver. Ensure the resolver address and ABI match your deployment.
                  </div>
                </div>

                <Button type="button" onClick={handleResolve} disabled={!inputName.trim() || isResolving} className="w-full bg-gradient-primary hover:shadow-glow transition-smooth text-primary-foreground font-semibold py-3">
                  {isResolving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Resolve Chain ID
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Contracts</CardTitle>
            <CardDescription>Addresses used by this page (Sepolia).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <strong>Resolver:</strong>
                <a
                  href={`https://sepolia.etherscan.io/address/${CHAIN_RESOLVER_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline break-all"
                >
                  {CHAIN_RESOLVER_ADDRESS}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {resolvedChainId && (
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                Human Name → ERC-7785 Identifier
              </CardTitle>
              <CardDescription>Resolves human-friendly names to ERC‑7785 chain identifiers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <code className="font-mono">{(inputName || '<label>') + '.cid.eth'}</code>
                <span className="opacity-70">→</span>
                <code className="font-mono break-all">{resolvedChainId}</code>
              </div>
            </CardContent>
          </Card>
        )}

        {resolvedChainId && (
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Resolution Result
              </CardTitle>
              <CardDescription>ERC-7785 Chain ID for the provided reference.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge variant="secondary" className="mb-2">Hash Length: 66 characters (0x + 64 hex)</Badge>
                <div className="flex items-center gap-2 p-4 bg-secondary/50 rounded-lg border border-primary/10">
                  <code className="flex-1 text-sm font-mono break-all text-foreground">{resolvedChainId}</code>
                </div>
              </div>
            </CardContent>
        </Card>
      )}

        {nodeHash && (
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Namehash Result
              </CardTitle>
              <CardDescription>ENS-encoded node for <code className="font-mono">{(inputName || '<label>') + '.cid.eth'}</code></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge variant="secondary" className="mb-2">Hash Length: 66 characters (0x + 64 hex)</Badge>
                <div className="flex items-center gap-2 p-4 bg-secondary/50 rounded-lg border border-primary/10">
                  <code className="flex-1 text-sm font-mono break-all text-foreground">{nodeHash}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {resolvedChainId && (
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Chain Data (from Registry)
              </CardTitle>
              <CardDescription>Fetched from Sepolia registry.</CardDescription>
            </CardHeader>
            <CardContent>
              {!chainDataExists && chainDataExists !== null ? (
                <div className="text-sm text-muted-foreground">No chain data found for this chainId in the registry.</div>
              ) : resolvedChainData ? (
                <div className="text-sm space-y-1">
                  <div><strong>Name:</strong> {resolvedChainData.chainName}</div>
                  <div><strong>Settlement Chain ID:</strong> {resolvedChainData.settlementChainId?.toString?.() ?? String(resolvedChainData.settlementChainId)}</div>
                  <div><strong>Version:</strong> {resolvedChainData.version}</div>
                  <div><strong>Rollup Contract:</strong> {resolvedChainData.rollupContract}</div>
                  <div><strong>Namespace:</strong> {resolvedChainData.chainNamespace}</div>
                  <div><strong>Reference:</strong> {resolvedChainData.chainReference}</div>
                  <div><strong>Coin Type:</strong> {String(resolvedChainData.coinType)}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Loading chain data…</div>
              )}
            </CardContent>
          </Card>
        )}

        {caip2Identifier && caip2Hash && (
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                CAIP-2 Attributes
              </CardTitle>
              <CardDescription>
                Derived from the resolved ChainData. See the reference:
                {' '}
                <a
                  href="https://github.com/unruggable-labs/ERCs/blob/61e0dac92e644b4be246b81b3097565a1ba3bc6c/ERCS/erc-7785.md#caip-2-and-caip-350-integration-in-erc-7785-chain-identifier"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  CAIP-2 and CAIP-350 integration in ERC-7785
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <strong>Identifier:</strong>
                  <code className="font-mono break-all flex-1">{caip2Identifier}</code>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary/60"
                    onClick={() => copy(caip2Identifier, 'CAIP-2 identifier')}
                    aria-label="Copy CAIP-2 identifier"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <strong>Hash:</strong>
                  <code className="font-mono break-all flex-1">{caip2Hash}</code>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary/60"
                    onClick={() => copy(caip2Hash, 'CAIP-2 hash')}
                    aria-label="Copy CAIP-2 hash"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChainResolverForm;
