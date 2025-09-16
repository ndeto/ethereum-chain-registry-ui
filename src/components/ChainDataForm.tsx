"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Hash, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import { CHAIN_REGISTRY_ABI } from '@/lib/abis';
import { CHAIN_REGISTRY_ADDRESS } from '@/lib/addresses';
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi';
import { type Abi, parseEventLogs } from 'viem';
import { sepolia as viemSepolia } from 'viem/chains';
import ZincConnectButton from '@/components/ZincConnectButton';

const TARGET_NETWORK_NAME = 'Sepolia';
const TARGET_CHAIN_ID = 11155111; // Sepolia
const TARGET_CHAIN_ID_HEX = '0xaa36a7';

interface ChainData {
  chainName: string;
  settlementChainId: string;
  version: string;
  rollupContract: string;
  chainNamespace: string;
  chainReference: string;
  coinType: string;
}

const ChainDataForm: React.FC = () => {
  const [formData, setFormData] = useState<ChainData>({
    chainName: '',
    settlementChainId: '',
    version: '',
    rollupContract: '',
    chainNamespace: '',
    chainReference: '',
    coinType: ''
  });

  const [isComputing, setIsComputing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [computedHash, setComputedHash] = useState<string>('');
  const [showResultLoading, setShowResultLoading] = useState<boolean>(false);
  const [didSubmitTx, setDidSubmitTx] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [submittedName, setSubmittedName] = useState<string>('');
  const resultRef = useRef<HTMLDivElement | null>(null);
  const { address: account, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const chainIdHex = chainId ? `0x${chainId.toString(16)}` : '';
  const networkName = publicClient?.chain?.name ?? (chainId === TARGET_CHAIN_ID ? TARGET_NETWORK_NAME : 'unknown');
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [showInputsInfo, setShowInputsInfo] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ChainData, value: string) => {
    const v = value.trim();
    const lowerCaseFields: Array<keyof ChainData> = ['chainName', 'chainNamespace', 'chainReference', 'rollupContract'];
    const next = lowerCaseFields.includes(field) ? v.toLowerCase() : v;
    setFormData(prev => ({ ...prev, [field]: next }));
  };

  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const isFormValid = (): boolean => {
    const isEip155 = formData.chainNamespace.trim().toLowerCase() === 'eip155';
    const allFilledExceptCoinType = Object.entries(formData).every(([k, v]) => {
      if (k === 'coinType' && isEip155) return true; // allow blank coinType for eip155
      return String(v).trim() !== '';
    });
    const settlementOk = !isNaN(Number(formData.settlementChainId));
    const coinTypeOk = isEip155 ? true : !isNaN(Number(formData.coinType));
    return allFilledExceptCoinType && isValidAddress(formData.rollupContract) && settlementOk && coinTypeOk;
  };

  // Connection handled via Reown AppKit Button in the header or below when needed.

  const switchToTargetNetwork = async () => {
    try {
      await switchChain({ chainId: TARGET_CHAIN_ID });
      toast({ title: 'Switched Network', description: `Now on ${TARGET_NETWORK_NAME}.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Switch Failed', description: err?.shortMessage || err?.message || 'Wallet error.' });
    }
  };

  /* wagmi manages chain/account updates
  useEffect(() => {
    const eth = (window as any)?.ethereum;
    if (!eth) return;

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
      } catch {}
    })();

    if (!eth.on) return;

    const handleChainChanged = (_chainId: string) => {
      setChainIdHex(_chainId);
      const provider = new ethers.BrowserProvider(eth);
      provider.getNetwork().then((n) => setNetworkName(n.name || 'unknown')).catch(() => {});
    };

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts?.[0] || '');
      setIsConnected(!!accounts?.[0]);
    };

    eth.on('chainChanged', handleChainChanged);
    eth.on('accountsChanged', handleAccountsChanged);

    return () => {
      eth.removeListener?.('chainChanged', handleChainChanged);
      eth.removeListener?.('accountsChanged', handleAccountsChanged);
    };
  }, []);
  */

  const handleCompute = async () => {
    if (!isFormValid()) {
      toast({
        variant: "destructive",
        title: "Invalid Form",
        description: "Please fill all fields with valid data."
      });
      return;
    }

    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to register the chain."
      });
      return;
    }

    setIsComputing(true);
    setShowResultLoading(true);
    setComputedHash('');
    setDidSubmitTx(false);

    try {
      const address = CHAIN_REGISTRY_ADDRESS as `0x${string}`;
      const isZeroAddress = typeof address === 'string' && address.toLowerCase() === '0x0000000000000000000000000000000000000000';
      const isValidRegistry = typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address) && !isZeroAddress;
      if (!isValidRegistry) {
        toast({
          variant: 'destructive',
          title: 'Missing Contract Address',
          description: `Set CHAIN_REGISTRY_ADDRESS in ChainDataForm.tsx for ${TARGET_NETWORK_NAME}.`,
        });
        return;
      }

      // Ensure correct network
      if (chainId !== TARGET_CHAIN_ID) {
        toast({
          variant: 'destructive',
          title: 'Wrong Network',
          description: `Please switch to ${TARGET_NETWORK_NAME} to register.`,
        });
        return;
      }

      const isEip155 = formData.chainNamespace.trim().toLowerCase() === 'eip155';
      // Do not default to any value; if blank for eip155, send 0
      const coinTypeValue = isEip155 && !formData.coinType.trim() ? 0 : parseInt(formData.coinType);

      const chainData = {
        chainName: formData.chainName,
        settlementChainId: BigInt(formData.settlementChainId),
        version: formData.version,
        rollupContract: formData.rollupContract,
        chainNamespace: formData.chainNamespace,
        chainReference: formData.chainReference,
        coinType: coinTypeValue
      } as const;

      console.debug('[Registry] register -> ChainData', {
        ...chainData,
        // stringify bigint for readability
        settlementChainId: chainData.settlementChainId.toString(),
      });

      const txHash = await writeContractAsync({
        address,
        abi: CHAIN_REGISTRY_ABI as unknown as Abi,
        functionName: 'demoRegister',
        args: [chainData],
        chain: viemSepolia,
        account: account as `0x${string}`
      });

      toast({ title: "Transaction Submitted", description: "Waiting for confirmation..." });

      const receipt = await publicClient!.waitForTransactionReceipt({ hash: txHash });

      const events = parseEventLogs({
        abi: CHAIN_REGISTRY_ABI as unknown as Abi,
        logs: receipt.logs,
        eventName: 'ChainRegistered'
      }) as any[];

      let chainIdOut = '' as string;
      chainIdOut = (events?.[0]?.args?.chainId || '') as string;

      setComputedHash(chainIdOut);
      setSubmittedName(formData.chainName);
      setDidSubmitTx(true);
      setFormData({
        chainName: '',
        settlementChainId: '',
        version: '',
        rollupContract: '',
        chainNamespace: '',
        chainReference: '',
        coinType: ''
      });

      toast({ title: "Registered", description: "Hash computed — now click ‘Go to Assign’." });
    } catch (error: any) {
      console.error("Failed to register chain:", error);

      let errorMessage = "An unexpected error occurred.";
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = "Transaction was rejected by user.";
      } else if (error.message?.includes('ChainAlreadyRegistered')) {
        errorMessage = "This chain is already registered.";
      } else if (error.message?.includes('ChainNameEmpty')) {
        errorMessage = "Chain name cannot be empty.";
      } else if (error.message?.includes('Ownable: caller is not the owner')) {
        errorMessage = "Owner-gated register: connect owner wallet or use demoRegister.";
      }

      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage
      });
    } finally {
      setIsComputing(false);
      setShowResultLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!isFormValid()) {
      toast({ variant: 'destructive', title: 'Invalid Form', description: 'Please fill all fields with valid data.' });
      return;
    }
    try {
      // Clear any previous result while a new simulation runs
      setComputedHash('');
      setSubmittedName('');
      setDidSubmitTx(false);
      setIsSimulating(true);
      const address = CHAIN_REGISTRY_ADDRESS as `0x${string}`;
      const isZeroAddress = typeof address === 'string' && address.toLowerCase() === '0x0000000000000000000000000000000000000000';
      const isValidRegistry = typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address) && !isZeroAddress;
      if (!isValidRegistry) {
        toast({ variant: 'destructive', title: 'Missing Contract Address', description: 'Set NEXT_PUBLIC_CHAIN_REGISTRY_ADDRESS.' });
        return;
      }

      const isEip155 = formData.chainNamespace.trim().toLowerCase() === 'eip155';
      const coinTypeValue = isEip155 && !formData.coinType.trim() ? 0 : parseInt(formData.coinType);

      const chainData = {
        chainName: formData.chainName,
        settlementChainId: BigInt(formData.settlementChainId),
        version: formData.version,
        rollupContract: formData.rollupContract,
        chainNamespace: formData.chainNamespace,
        chainReference: formData.chainReference,
        coinType: coinTypeValue,
      };

      const sim = await publicClient!.simulateContract({
        address,
        abi: CHAIN_REGISTRY_ABI as unknown as Abi,
        functionName: 'demoRegister',
        args: [chainData],
        account: account as `0x${string}` | undefined
      });
      const chainId: string = sim.result as string;

      setComputedHash(chainId);
      setSubmittedName(formData.chainName);
      setDidSubmitTx(false);
      toast({ title: 'Simulated', description: 'Computed chain identifier via eth_call.' });
      try { resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch { }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Simulation Failed', description: e?.shortMessage || e?.reason || e?.message || 'Could not simulate computation.' });
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    if (computedHash && resultRef.current) {
      try {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch { }
    }
  }, [computedHash]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(computedHash);
    setCopied(true);
    toast({
      title: "Copied to Clipboard",
      description: "Hash has been copied to your clipboard."
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const inputFields = [
    { key: 'chainName' as keyof ChainData, label: 'Chain Name', type: 'text', placeholder: 'e.g., optimism' },
    { key: 'settlementChainId' as keyof ChainData, label: 'Settlement Chain ID', type: 'number', placeholder: 'e.g., 1' },
    { key: 'version' as keyof ChainData, label: 'Version', type: 'text', placeholder: 'e.g., v1' },
    { key: 'rollupContract' as keyof ChainData, label: 'Rollup Contract', type: 'text', placeholder: 'e.g., 0xbEb5fc579115071764c7423A4f12eDde41f106Ed' },
    { key: 'chainNamespace' as keyof ChainData, label: 'Chain Namespace', type: 'text', placeholder: 'e.g., eip155' },
    { key: 'chainReference' as keyof ChainData, label: 'Chain Reference', type: 'text', placeholder: 'e.g., 10' },
    { key: 'coinType' as keyof ChainData, label: 'Coin Type', type: 'number', placeholder: 'e.g., 2147483658' }
  ];

  return (
    <section className="space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-primary">
          ERC-7785 Chain Registry (Demo)
        </h1>
        <p className="text-foreground/90 text-md leading-relaxed">
          Fill in the fields to compute the 32-byte ERC-7785 chain identifier —
          {' '}
          <a className="underline" href="/learn">Learn more</a>
        </p>
      </div>
      <Card className="border border-primary/10">
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center gap-2">
            Chain Data Input
          </CardTitle>
          <CardDescription>
            Fill in all the required parameters for the ChainData struct
          </CardDescription>
          {isConnected && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>
                Connected: {account?.slice(0, 6)}...{account?.slice(-4)} • {networkName || 'unknown'} ({chainIdHex || 'n/a'})
              </span>
              {chainIdHex?.toLowerCase() !== TARGET_CHAIN_ID_HEX.toLowerCase() && (
                <Button size="sm" variant="secondary" type="button" onClick={switchToTargetNetwork} disabled={isSwitching}>
                  {isSwitching ? 'Switching…' : `Switch to ${TARGET_NETWORK_NAME}`}
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inputFields.map(({ key, label, type, placeholder }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={key} className="text-sm font-medium">
                    {label}
                  </Label>
                  {key === 'coinType' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-white text-[10px] cursor-default select-none">?</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start" className="text-white bg-zinc-900 border-zinc-800">
                        <div className="max-w-xs text-xs">
                          For eip155 networks (EVM), you may leave coinType blank (it is derived). For non‑eip155 namespaces, coinType is required.
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <Input
                  id={key}
                  type={type}
                  value={formData[key]}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  placeholder={placeholder}
                  className={`transition-smooth ${key === 'rollupContract' && formData[key] && !isValidAddress(formData[key])
                      ? 'border-destructive focus:border-destructive'
                      : 'focus:border-primary'
                    }`}
                />
                {key === 'rollupContract' && formData[key] && !isValidAddress(formData[key]) && (
                  <p className="text-sm text-destructive">Invalid Ethereum address format</p>
                )}
              </div>
            ))}
          </div>
          {/* connection prompt remains below if not connected */}

          {!isConnected ? (
            <div className="w-full flex justify-center">
              <ZincConnectButton />
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                  <div>
                    <strong>Demo mode:</strong> This UI calls <code className="font-mono">demoRegister</code>. For production, use the owner‑gated <code className="font-mono">register</code>.
                  </div>
                  <div>
                    Ensure the CAIP‑2 pair (<code className="font-mono">namespace:reference</code>) and <code className="font-mono">chainName</code> are unique. Verify on <a className="underline" href="/resolve">Resolve</a> and <a className="underline" href="/caip2">CAIP‑2</a> pages.
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSimulate}
                      disabled={!isFormValid() || isSimulating}
                    >
                      {isSimulating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Simulating…
                        </>
                      ) : (
                        <>
                          Simulate (eth_call)
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-white bg-zinc-900 border-zinc-800">
                    Simulates via eth_call.
                  </TooltipContent>
                </Tooltip>
              </div>

              <Button
                type="button"
                onClick={handleCompute}
                disabled={!isFormValid() || isComputing}
                className="w-full bg-primary hover:shadow-glow transition-smooth text-primary-foreground font-semibold py-3"
              >
                {isComputing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering Chain...
                  </>
                ) : (
                  <>
                    Register & Compute Chain ID
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {(isSimulating || isComputing) && !computedHash && (
        <Card className="border border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-40" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      )}

      {computedHash && (
        <Card ref={resultRef} className="border border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Computed Hash Result
            </CardTitle>
            <CardDescription>
              {didSubmitTx
                ? 'ERC‑7785 Chain ID generated from the registered ChainData'
                : 'Simulated ERC‑7785 Chain ID (no transaction performed)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Badge variant="secondary" className="mb-2">
                Hash Length: 32 byte hash
              </Badge>
              <div className="flex items-center gap-2 p-4 bg-secondary/50 rounded-lg border border-primary/10">
                <code className="flex-1 text-sm font-mono break-all text-foreground">
                  {computedHash}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {submittedName && (
                <div className="text-sm text-muted-foreground">
                  Suggested label: <code className="font-mono">{submittedName}</code> → Full name <code className="font-mono">{submittedName}.cid.eth</code>
                </div>
              )}
              <div className="pt-2">
                {didSubmitTx ? (
                  <Link
                    href={(() => {
                      const hasParams = Boolean(submittedName || computedHash);
                      if (!hasParams) return '/assign';
                      const params = new URLSearchParams();
                      if (submittedName) params.set('label', submittedName);
                      if (computedHash) params.set('chainId', computedHash);
                      return `/assign?${params.toString()}`;
                    })()}
                    className="inline-block"
                  >
                    <Button variant="secondary" type="button">
                      Go to Assign
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Button variant="secondary" type="button" disabled>
                      Go to Assign
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      To assign this label, please register the ChainData on-chain first.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default ChainDataForm;
