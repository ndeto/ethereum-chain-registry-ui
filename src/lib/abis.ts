export const CHAIN_REGISTRY_ABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "register",
    inputs: [
      {
        name: "_chainData",
        type: "tuple",
        internalType: "struct ChainData",
        components: [
          {
            name: "chainName",
            type: "string",
            internalType: "string",
          },
          {
            name: "settlementChainId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "version",
            type: "string",
            internalType: "string",
          },
          {
            name: "rollupContract",
            type: "address",
            internalType: "address",
          },
          {
            name: "chainNamespace",
            type: "string",
            internalType: "string",
          },
          {
            name: "chainReference",
            type: "string",
            internalType: "string",
          },
          {
            name: "coinType",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "chainData",
    inputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "chainName",
        type: "string",
        internalType: "string",
      },
      {
        name: "settlementChainId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "version",
        type: "string",
        internalType: "string",
      },
      {
        name: "rollupContract",
        type: "address",
        internalType: "address",
      },
      {
        name: "chainNamespace",
        type: "string",
        internalType: "string",
      },
      {
        name: "chainReference",
        type: "string",
        internalType: "string",
      },
      {
        name: "coinType",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "ChainRegistered",
    inputs: [
      {
        name: "chainId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "chainName",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "ChainAlreadyRegistered",
    inputs: [],
  },
  {
    type: "error",
    name: "ChainNameEmpty",
    inputs: [],
  },
] as const;

export const CHAIN_RESOLVER_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_chainRegistry", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "ChainNameEmpty", type: "error" },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "length", type: "uint256" },
    ],
    name: "StringsInsufficientHexLength",
    type: "error",
  },
  { inputs: [], name: "UnsupportedFunction", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "node", type: "bytes32" },
      { indexed: true, internalType: "string", name: "label", type: "string" },
      {
        indexed: true,
        internalType: "bytes32",
        name: "chainId",
        type: "bytes32",
      },
    ],
    name: "NodeAssigned",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "CHAIN_REGISTRY",
    outputs: [
      { internalType: "contract IChainRegistry", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "label", type: "string" },
      { internalType: "bytes32", name: "chainId", type: "bytes32" },
    ],
    name: "assign",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "chainName", type: "string" }],
    name: "computeNode",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "nodeToChainId",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "name", type: "bytes" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "resolve",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const CAIP2_LIB_ABI = [
  {
    inputs: [
      { internalType: "string", name: "namespace", type: "string" },
      { internalType: "string", name: "chainReference", type: "string" },
    ],
    name: "computeCaip2Hash",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "pure",
    type: "function",
  },
] as const;
