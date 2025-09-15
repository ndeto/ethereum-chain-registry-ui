"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Hash, Copy, CheckCircle, Wallet, AlertTriangle, BookOpen, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CHAIN_REGISTRY_ABI } from '@/lib/abis';
import { CHAIN_REGISTRY_ADDRESS } from '@/lib/addresses';
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi';
import { type Abi, parseEventLogs } from 'viem';
import { sepolia as viemSepolia } from 'viem/chains';
import { AppKitButton } from '@reown/appkit/react';

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
  const [didSubmitTx, setDidSubmitTx] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [submittedName, setSubmittedName] = useState<string>('');
  const resultRef = useRef<HTMLDivElement | null>(null);
  const { address: account, isConnected } = useAccount();
  const chainId = useChainId();
  const chainIdHex = chainId ? `0x${chainId.toString(16)}` : '';
  const networkName = chainId === TARGET_CHAIN_ID ? TARGET_NETWORK_NAME : 'unknown';
  const publicClient = usePublicClient();
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

      toast({ title: "Transaction Submitted", description: "Waiting for transaction confirmation..." });

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
      
      toast({
        title: "Chain Registered Successfully",
        description: "Chain has been registered and hash computed."
      });
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
    }
  };

  const handleSimulate = async () => {
    if (!isFormValid()) {
      toast({ variant: 'destructive', title: 'Invalid Form', description: 'Please fill all fields with valid data.' });
      return;
    }
    try {
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
      try { resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
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
      } catch {}
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-primary/10">
            <Hash className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Chain Registration</span>
          </div>
          <h1 className="text-4xl font-bold text-primary">
            ERC-7785 Chain Registry (Demo)
          </h1>
          <p className="text-foreground/90 text-lg leading-relaxed">
            Enter ChainData struct parameters to compute the 32-byte ERC-7785 chain identifier
          </p>
        </div>
        {/* Inputs and Result (explanatory) */}
        <Card className="border border-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                Inputs and Result
              </CardTitle>
              <Button
                size="sm"
                variant="secondary"
                type="button"
                onClick={() => setShowInputsInfo((v) => !v)}
                aria-expanded={showInputsInfo}
                aria-controls="inputs-details"
              >
                {showInputsInfo ? 'Hide details' : 'Learn more'}
              </Button>
            </div>
            <CardDescription>Fill in the form below to derive a chain identifier.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showInputsInfo && (
              <div id="inputs-details" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>chainName</strong>: Human chain name (e.g., Base Mainnet).</li>
                    <li><strong>settlementChainId</strong>: EIP‑155 chain ID of the settlement layer (e.g., 1 for Ethereum).</li>
                    <li><strong>version</strong>: Spec/format version used in derivation.</li>
                    <li><strong>rollupContract</strong>: L2 anchor/rollup contract; <code className="font-mono">0x00…00</code> if none.</li>
                    <li>
                      <strong>chainNamespace</strong>: <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md">CAIP‑2</a> namespace
                      {' '}(e.g., <code className="font-mono">eip155</code>).
                    </li>
                    <li>
                      <strong>chainReference</strong>: <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md">CAIP‑2</a> reference
                      {' '}(e.g., <code className="font-mono">8453</code> for Base).
                    </li>
                    <li>
                      <strong>coinType</strong>: ENS coin type (<a className="underline" target="_blank" rel="noreferrer" href="https://github.com/ensdomains/docs/blob/master/ens-improvement-proposals/ensip-11.md">ENSIP‑11</a>);
                      {' '}derived for EVM (<code className="font-mono">eip155</code>), required otherwise.
                    </li>
                  </ul>
                </div>
                <pre className="text-xs overflow-auto p-3 rounded-md bg-secondary/50 border border-primary/10"><code>{`// Derivation (conceptual)
bytes32 chainId = keccak256(
  abi.encode(
    chainName,
    settlementChainId,
    version,
    rollupContract,
    chainNamespace,
    chainReference
  )
);`}</code></pre>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    The registry interface defines <code className="font-mono">register(ChainData)</code> and exposes stored entries via
                    <code className="font-mono"> chainData(bytes32)</code> and helpers. You can view the exposed functions here:
                  </p>
                  <p>
                    <a
                      href="https://github.com/unruggable-labs/erc-7785-registry/blob/main/src/interfaces/ChainRegistry.sol"
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      ChainRegistry.sol (GitHub)
                    </a>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              Chain Data Input
            </CardTitle>
            <CardDescription>
              Fill in all the required parameters for the ChainData struct
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inputFields.map(({ key, label, type, placeholder }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-sm font-medium">
                    {label}
                  </Label>
                  <Input
                    id={key}
                    type={type}
                    value={formData[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    placeholder={placeholder}
                    className={`transition-smooth ${
                      key === 'rollupContract' && formData[key] && !isValidAddress(formData[key])
                        ? 'border-destructive focus:border-destructive'
                        : 'focus:border-primary'
                    }`}
                  />
                  {key === 'rollupContract' && formData[key] && !isValidAddress(formData[key]) && (
                    <p className="text-sm text-destructive">Invalid Ethereum address format</p>
                  )}
                  {key === 'coinType' && formData.chainNamespace.trim().toLowerCase() === 'eip155' && !formData.coinType.trim() && (
                    <p className="text-xs text-muted-foreground">
                      For eip155 networks (EVM), coinType is derived, otherwise, it must be supplied.
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/10 rounded-lg">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                For <code className="font-mono">eip155</code> networks (EVM), you may leave <code className="font-mono">coinType</code> blank.
                For non‑eip155 namespaces, <code className="font-mono">coinType</code> is required.
              </div>
            </div>
            
            {!isConnected ? (
              <div className="w-full flex justify-center">
                <AppKitButton />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 p-3 bg-secondary/50 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">
                      Connected: {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Network: {networkName || 'unknown'} ({chainIdHex || 'n/a'})
                  </div>
                  {chainIdHex?.toLowerCase() !== TARGET_CHAIN_ID_HEX.toLowerCase() && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-amber-700 dark:text-amber-400">
                        Registry contract is on {TARGET_NETWORK_NAME}.
                      </div>
                      <Button size="sm" variant="secondary" type="button" onClick={switchToTargetNetwork}>
                        Switch to {TARGET_NETWORK_NAME}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Demo mode:</strong> This UI calls <code className="font-mono">demoRegister</code>, which is unrestricted for demos.
                    On production deployments, use the owner‑gated <code className="font-mono">register</code> function.
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-sm text-amber-700 dark:text-amber-400">
                    Before submitting, ensure the CAIP‑2 pair (<code className="font-mono">namespace:reference</code>) and <code className="font-mono">chainName</code> are unique.
                    You can verify on the <a className="underline" href="/resolve">Resolve</a> and <a className="underline" href="/caip2">CAIP‑2</a> pages.
                  </div>
                </div>
                <div className="flex gap-2">
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
                        <Hash className="h-4 w-4 mr-2" />
                        Simulate (eth_call)
                      </>
                    )}
                  </Button>
                  <div className="text-xs text-muted-foreground self-center">Preview the identifier without a transaction.</div>
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
                      <Hash className="h-4 w-4 mr-2" />
                      Register (Demo) & Compute Hash
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

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
                  Hash Length: 66 characters (0x + 64 hex)
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
