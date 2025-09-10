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
import { ethers } from 'ethers';
import { CHAIN_REGISTRY_ABI } from '@/lib/abis';
import { CHAIN_REGISTRY_ADDRESS } from '@/lib/addresses';
import { withSepoliaProvider } from '@/lib/rpc';

const TARGET_NETWORK_NAME = 'Sepolia';
const TARGET_CHAIN_ID_HEX = '0xaa36a7'; // Sepolia
const TARGET_CHAIN_ID_DECIMAL = BigInt(TARGET_CHAIN_ID_HEX);

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
  const [computedHash, setComputedHash] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [submittedName, setSubmittedName] = useState<string>('');
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [chainIdHex, setChainIdHex] = useState<string>('');
  const [networkName, setNetworkName] = useState<string>('');
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

  const connectWallet = async () => {
    try {
      const eth = (window as any)?.ethereum;
      if (!eth) {
        toast({
          variant: "destructive",
          title: "MetaMask Required",
          description: "Please install MetaMask to use this application."
        });
        return;
      }

      await eth.request?.({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const network = await provider.getNetwork();
      const currentChainIdHex = `0x${network.chainId.toString(16)}`;
      setChainIdHex(currentChainIdHex);
      setNetworkName(network.name || 'unknown');
      
      setAccount(address);
      setIsConnected(true);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect to wallet. Please try again."
      });
    }
  };

  // Attempt to switch to Ethereum Mainnet for the registry contract
  const switchToTargetNetwork = async () => {
    try {
      const eth = (window as any)?.ethereum;
      if (!eth?.request) return;

      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: TARGET_CHAIN_ID_HEX }],
      });

      // Update local state after switch
      const provider = new ethers.BrowserProvider(eth);
      const network = await provider.getNetwork();
      const currentChainIdHex = `0x${network.chainId.toString(16)}`;
      setChainIdHex(currentChainIdHex);
      setNetworkName(network.name || 'unknown');

      toast({
        title: 'Switched Network',
        description: `Now on ${TARGET_NETWORK_NAME}`,
      });
    } catch (error: any) {
      // If the chain is not added to MetaMask
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
                  // Use public Sepolia RPC
                  rpcUrls: TARGET_CHAIN_ID_HEX === '0xaa36a7' ? ['https://ethereum-sepolia.publicnode.com'] : [],
                  blockExplorerUrls: TARGET_CHAIN_ID_HEX === '0xaa36a7' ? ['https://sepolia.etherscan.io/'] : [],
                },
              ],
          });
          toast({ title: `${TARGET_NETWORK_NAME} Added`, description: 'Try switching again.' });
        } catch (addErr) {
          toast({
            variant: 'destructive',
            title: 'Switch Failed',
            description: `Could not add/switch to ${TARGET_NETWORK_NAME}.`,
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Switch Failed',
          description: 'User rejected or wallet error.',
        });
      }
    }
  };

  // Initialize from already-authorized wallet, and keep in sync on changes
  useEffect(() => {
    const eth = (window as any)?.ethereum;
    if (!eth) return;

    // Initial sync without prompting the user
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
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const address = CHAIN_REGISTRY_ADDRESS ?? (undefined as unknown as string);
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

      console.log("Registry Address", address);

      const contract = new ethers.Contract(
        address,
        CHAIN_REGISTRY_ABI,
        signer
      );

      // Ensure we are on the configured target network for the registry contract
      const network = await provider.getNetwork();
      if (network.chainId !== TARGET_CHAIN_ID_DECIMAL) {
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
      };

      // Log the exact struct payload before sending the transaction
      // eslint-disable-next-line no-console
      console.debug('[Registry] register -> ChainData', {
        ...chainData,
        // stringify bigint for readability
        settlementChainId: chainData.settlementChainId.toString(),
      });

      // Demo UI: call the unrestricted demoRegister entrypoint
      const tx = await contract.demoRegister(chainData);

      toast({
        title: "Transaction Submitted",
        description: "Waiting for transaction confirmation..."
      });

      // Wait for receipt using a read-only provider to avoid wallet RPC rate limits
      let receipt;
      try {
        receipt = await withSepoliaProvider(async (readProvider) => {
          return readProvider.waitForTransaction(tx.hash);
        });
      } catch {
        // Fallback to signer provider if needed
        receipt = await tx.wait();
      }
      
      // Extract the chain ID from the transaction logs
      const chainRegisteredEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog?.name === 'ChainRegistered';
        } catch {
          return false;
        }
      });

      let chainId = '';
      if (chainRegisteredEvent) {
        const parsedLog = contract.interface.parseLog(chainRegisteredEvent);
        chainId = parsedLog?.args[0]; // The chainId from the event
      }
      
      setComputedHash(chainId);
      setSubmittedName(formData.chainName);
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

  // Scroll to the result section once it's rendered
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
    // Optimism L1 portal contract on Ethereum mainnet (placeholder)
    { key: 'rollupContract' as keyof ChainData, label: 'Rollup Contract', type: 'text', placeholder: 'e.g., 0xbEb5fc579115071764c7423A4f12eDde41f106Ed' },
    { key: 'chainNamespace' as keyof ChainData, label: 'Chain Namespace', type: 'text', placeholder: 'e.g., eip155' },
    { key: 'chainReference' as keyof ChainData, label: 'Chain Reference', type: 'text', placeholder: 'e.g., 10' },
    { key: 'coinType' as keyof ChainData, label: 'Coin Type', type: 'number', placeholder: 'e.g., 2147483658' }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-full">
            <Hash className="h-5 w-5" />
            <span className="text-primary-foreground font-medium">Chain Registration</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            ERC-7785 Chain Registry (Demo)
          </h1>
          <p className="text-muted-foreground text-lg">
            Enter ChainData struct parameters to compute the 32-byte ERC-7785 chain identifier
          </p>
        </div>

        <Card className="bg-gradient-card shadow-card border border-primary/20 backdrop-blur-sm">
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
            <Button
              type="button"
              onClick={connectWallet}
              className="w-full bg-gradient-primary hover:shadow-glow transition-smooth text-primary-foreground font-semibold py-3"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
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
                
                <Button
                  type="button"
                  onClick={handleCompute}
                  disabled={!isFormValid() || isComputing}
                  className="w-full bg-gradient-primary hover:shadow-glow transition-smooth text-primary-foreground font-semibold py-3"
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

        

        <Card className="border border-primary/10 bg-background/50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              Contracts
            </CardTitle>
            <CardDescription>Addresses used by this page (Sepolia).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <strong>Registry:</strong>
                <a
                  href={`https://sepolia.etherscan.io/address/${CHAIN_REGISTRY_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline break-all"
                >
                  {CHAIN_REGISTRY_ADDRESS}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {computedHash && (
          <Card ref={resultRef} className="bg-gradient-card shadow-card border border-primary/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Computed Hash Result
              </CardTitle>
              <CardDescription>
                ERC-7785 Chain ID generated from the registered ChainData
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
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-card shadow-card border border-primary/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              ChainData Reference
            </CardTitle>
            <CardDescription>
              This form maps to the <code className="font-mono">ChainData</code> struct used by the <a
                  href="https://github.com/unruggable-labs/ERCs/blob/61e0dac92e644b4be246b81b3097565a1ba3bc6c/ERCS/erc-7785.md"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  ERC-7785 chain registry - modified (GitHub)
                </a>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                The registry interface defines <code className="font-mono">register(ChainData)</code> and exposes
                stored entries via <code className="font-mono">chainData(bytes32)</code> and helpers. You can view the
                source of the struct and methods here:
              </p>
              <p>
                <a
                  href="https://github.com/unruggable-labs/erc-7785-registry/blob/main/src/interfaces/IChainRegistry.sol"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  IChainRegistry.sol (GitHub)
                </a>
              </p>
              <p>
                Fields captured: <code className="font-mono">chainName</code>, <code className="font-mono">settlementChainId</code>,
                <code className="font-mono">version</code>, <code className="font-mono">rollupContract</code>,
                <code className="font-mono">chainNamespace</code>, <code className="font-mono">chainReference</code>,
                <code className="font-mono">coinType</code>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChainDataForm;
