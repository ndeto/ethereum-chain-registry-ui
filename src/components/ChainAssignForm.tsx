"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';
import { AlertTriangle, CheckCircle, Link as LinkIcon, Loader2, ShieldCheck, Wallet } from 'lucide-react';
import { CHAIN_RESOLVER_ABI } from '@/lib/abis';
import { CHAIN_RESOLVER_ADDRESS } from '@/lib/addresses';
import { withSepoliaProvider } from '@/lib/rpc';

const TARGET_NETWORK_NAME = 'Sepolia';
const TARGET_CHAIN_ID_HEX = '0xaa36a7';
const TARGET_CHAIN_ID_DECIMAL = BigInt(TARGET_CHAIN_ID_HEX);

const isBytes32 = (value: string) => /^0x[a-f0-9]{64}$/.test((value || '').toLowerCase());

function normalizeBytes32(input: string): string {
  let v = (input || '').trim().toLowerCase();
  if (/^[0-9a-f]{64}$/.test(v)) v = `0x${v}`;
  return v;
}

export default function ChainAssignForm() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [chainIdHex, setChainIdHex] = useState('');

  const [labelValue, setLabelValue] = useState('');
  const [chainIdValue, setChainIdValue] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [currentMapping, setCurrentMapping] = useState<string>('');
  const [assigned, setAssigned] = useState<boolean>(false);
  const [lastAssignedLabel, setLastAssignedLabel] = useState<string>('');
  const [showResolverInfo, setShowResolverInfo] = useState(false);

  const connectWallet = async () => {
    try {
      const eth = (window as any)?.ethereum;
      if (!eth) {
        toast({ variant: 'destructive', title: 'MetaMask Required', description: 'Install MetaMask or a compatible wallet.' });
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
    } catch (e) {
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
      if (error?.code === 4902) {
        try {
          const eth = (window as any)?.ethereum;
          await eth.request?.({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: TARGET_CHAIN_ID_HEX, chainName: TARGET_NETWORK_NAME, nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://rpc.sepolia.org'] }],
          });
          toast({ title: `${TARGET_NETWORK_NAME} Added`, description: 'Try switching again.' });
        } catch {
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

    // Initial sync for already-authorized wallets
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
      } catch {
        // ignore
      }
    })();

    // Prefill from query params if present (no Next hook dependency)
    try {
      const params = new URLSearchParams(window.location.search);
      const qLabel = params.get('label');
      const qChainId = params.get('chainId');
      if (qLabel && !labelValue) setLabelValue(qLabel.trim().toLowerCase());
      if (qChainId && !chainIdValue) setChainIdValue(normalizeBytes32(qChainId));
    } catch {}

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

  const checkCurrent = async () => {
    if (!labelValue.trim()) {
      toast({ variant: 'destructive', title: 'Missing Label', description: 'Enter a label to check mapping.' });
      return;
    }
    const address = CHAIN_RESOLVER_ADDRESS as string;
    const isZero = address?.toLowerCase?.() === '0x0000000000000000000000000000000000000000';
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address) && !isZero;
    if (!isValid) {
      toast({ variant: 'destructive', title: 'Resolver Address Missing', description: 'Set NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS.' });
      return;
    }
    try {
      setChecking(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const resolver = new ethers.Contract(address, CHAIN_RESOLVER_ABI, provider);
      const node: string = await resolver.computeNode(labelValue);
      const mapped: string = await resolver.nodeToChainId(node);
      setCurrentMapping(mapped);
      toast({ title: 'Lookup Complete', description: 'Fetched current mapping for label.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Lookup Failed', description: e?.shortMessage || e?.message || 'Could not fetch mapping.' });
    } finally {
      setChecking(false);
    }
  };

  const onAssign = async () => {
    if (!labelValue.trim() || !isBytes32(chainIdValue)) {
      toast({ variant: 'destructive', title: 'Invalid Input', description: 'Provide label and a 32-byte hex chainId.' });
      return;
    }
    const address = CHAIN_RESOLVER_ADDRESS as string;
    const isZero = address?.toLowerCase?.() === '0x0000000000000000000000000000000000000000';
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address) && !isZero;
    if (!isValid) {
      toast({ variant: 'destructive', title: 'Resolver Address Missing', description: 'Set NEXT_PUBLIC_CHAIN_RESOLVER_ADDRESS.' });
      return;
    }
    try {
      setSubmitting(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      if (network.chainId !== TARGET_CHAIN_ID_DECIMAL) {
        toast({ variant: 'destructive', title: 'Wrong Network', description: `Please switch to ${TARGET_NETWORK_NAME}.` });
        return;
      }
      const signer = await provider.getSigner();
      const resolver = new ethers.Contract(address, CHAIN_RESOLVER_ABI, signer);
      // Demo UI: use unrestricted demoAssign entrypoint
      const successLabel = labelValue;
      const tx = await resolver.demoAssign(successLabel, chainIdValue);
      toast({ title: 'Transaction Submitted', description: 'Waiting for confirmation…' });
      try {
        await withSepoliaProvider(async (readProvider) => readProvider.waitForTransaction(tx.hash));
      } catch {
        await tx.wait();
      }
      toast({ title: 'Assigned', description: 'Label assigned to chainId in resolver.' });
      setAssigned(true);
      setLastAssignedLabel(successLabel);
      setLabelValue('');
      setChainIdValue('');
      // refresh mapping display
      try {
        const node: string = await resolver.computeNode(successLabel);
        const mapped: string = await resolver.nodeToChainId(node);
        setCurrentMapping(mapped);
      } catch {}
    } catch (error: any) {
      let description = error?.shortMessage || error?.reason || error?.message || 'Failed to assign label.';
      if (error?.code === 'ACTION_REJECTED') description = 'Transaction was rejected by user.';
      if (String(description).includes('Ownable')) description = 'Only the contract owner can assign mappings.';
      toast({ variant: 'destructive', title: 'Assignment Failed', description });
    } finally {
      setSubmitting(false);
    }
  };

  const resolverHref = `https://sepolia.etherscan.io/address/${CHAIN_RESOLVER_ADDRESS}`;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-primary/10">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Resolver Assignment</span>
          </div>
          <h1 className="text-4xl font-bold text-primary">Assign Label → ID</h1>
          <p className="text-foreground/90 text-lg leading-relaxed">Map a human label (e.g., base) to its ERC-7785 chain ID on the resolver.</p>
        </div>

        {/* ENSIP-10 Resolver explainer */}
        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                Resolver Overview (ENSIP‑10)
              </CardTitle>
              <Button
                size="sm"
                variant="secondary"
                type="button"
                onClick={() => setShowResolverInfo((v) => !v)}
                aria-expanded={showResolverInfo}
                aria-controls="resolver-info"
              >
                {showResolverInfo ? 'Hide' : 'Learn more'}
              </Button>
            </div>
            <CardDescription>
              ENSIP‑10 compliant resolver that maps human labels to ERC‑7785 chain IDs.
            </CardDescription>
          </CardHeader>
          {showResolverInfo && (
            <CardContent id="resolver-info" className="space-y-3 text-sm text-muted-foreground">
              <p>
                This resolver stores an assignment from a human‑friendly label (e.g., <code className="font-mono">base</code>) to the
                ERC‑7785 chain identifier (<code className="font-mono">bytes32</code>) that was derived and registered in the Registry.
              </p>
              <p>
                It implements the <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ensdomains/docs/blob/master/ens-improvement-proposals/ensip-10.md">ENSIP‑10</a>
                {' '}pattern, so clients can call <code className="font-mono">resolve(name, data)</code> where
                {' '}<code className="font-mono">data = encode(text(node, "chain-id"))</code>. The <code className="font-mono">node</code> is the
                namehash of <code className="font-mono">&lt;label&gt;.cid.eth</code> and can be computed via
                {' '}<code className="font-mono">computeNode(label)</code>.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><code className="font-mono">assign(label, chainId)</code>: store mapping</li>
                <li><code className="font-mono">computeNode(label)</code> → <code className="font-mono">nodeToChainId(node)</code>: direct reads</li>
                <li><code className="font-mono">resolve(name, encode(text(node, "chain-id")))</code>: ENSIP‑10 reads</li>
              </ul>
              <p className="text-xs">
                Source: {' '}
                <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/unruggable-labs/erc-7785-registry/blob/main/src/ChainResolver.sol">ChainResolver.sol</a>
              </p>
            </CardContent>
          )}
        </Card>

        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Assignment Input
            </CardTitle>
            <CardDescription>Calls <code className="font-mono">assign(label, chainId)</code> on the resolver.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" placeholder="e.g., base" value={labelValue} onChange={(e) => setLabelValue(e.target.value.toLowerCase())} />
                <div className="text-xs text-muted-foreground">Full name: <code className="font-mono">{(labelValue || '<label>') + '.cid.eth'}</code></div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chainId">Chain ID (bytes32)</Label>
                <Input id="chainId" placeholder="0x… (64 hex chars)" value={chainIdValue} onChange={(e) => setChainIdValue(normalizeBytes32(e.target.value))} />
                {!chainIdValue || isBytes32(chainIdValue) ? null : (
                  <div className="text-xs text-destructive">Must be a 32-byte hex string (0x + 64 hex)</div>
                )}
              </div>
            </div>

            {!isConnected ? (
              <Button type="button" onClick={connectWallet} className="w-full bg-primary text-primary-foreground font-semibold py-3">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <>
                <div className="flex flex-col gap-2 p-3 bg-secondary/50 rounded-lg border border-primary/10">
                  <div className="text-sm text-muted-foreground">Connected: {account.slice(0, 6)}...{account.slice(-4)}</div>
                  <div className="text-xs text-muted-foreground">Network: {networkName || 'unknown'} ({chainIdHex || 'n/a'})</div>
                  {chainIdHex?.toLowerCase() !== TARGET_CHAIN_ID_HEX && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-amber-700 dark:text-amber-400">Resolver is deployed on {TARGET_NETWORK_NAME}.</div>
                      <Button size="sm" variant="secondary" type="button" onClick={switchToTarget}>Switch to {TARGET_NETWORK_NAME}</Button>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-sm text-amber-700 dark:text-amber-400">
                    Demo mode uses <code className="font-mono">demoAssign</code> (unrestricted). Avoid on production deployments.
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={checkCurrent} disabled={checking || !labelValue.trim()}>
                    {checking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                    Check if mapping exists
                  </Button>
                  <a href={resolverHref} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm underline px-2 py-2">
                    View Resolver
                  </a>
                </div>

                <Button type="button" onClick={onAssign} disabled={!labelValue.trim() || !isBytes32(chainIdValue) || submitting} className="w-full bg-primary hover:shadow-glow transition-smooth text-primary-foreground font-semibold py-3">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Assigning…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Assign Label
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

        {currentMapping && (
          <Card className="border border-primary/10 bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Current Mapping
              </CardTitle>
              <CardDescription>Resolved via computeNode(label) → nodeToChainId(node)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <code className="font-mono">{(lastAssignedLabel || labelValue || '<label>') + '.cid.eth'}</code>
                <span className="opacity-70">→</span>
                <code className="font-mono break-all">{currentMapping}</code>
              </div>
              {assigned && (
                <div className="pt-3">
                  <Link href={`/resolve${lastAssignedLabel ? `?label=${encodeURIComponent(lastAssignedLabel)}` : ''}`} className="inline-block">
                    <Button variant="secondary" type="button">Go to Resolve</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
