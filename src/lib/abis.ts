export const CHAIN_REGISTRY_ABI = [
  {
    inputs: [{ internalType: "address", name: "_owner", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "InvalidDataLength", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "_caller", type: "address" },
      { internalType: "bytes32", name: "_labelHash", type: "bytes32" },
    ],
    name: "NotAuthorized",
    type: "error",
  },
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "_labelHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "LabelOwnerSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "_isOperator",
        type: "bool",
      },
    ],
    name: "OperatorSet",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "_labelHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "_chainId",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "string",
        name: "_chainName",
        type: "string",
      },
    ],
    name: "RecordSet",
    type: "event",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_labelHash", type: "bytes32" }],
    name: "chainId",
    outputs: [{ internalType: "bytes", name: "_chainId", type: "bytes" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes", name: "_chainIdBytes", type: "bytes" }],
    name: "chainName",
    outputs: [{ internalType: "string", name: "_chainName", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_labelHash", type: "bytes32" },
      { internalType: "address", name: "_address", type: "address" },
    ],
    name: "isAuthorized",
    outputs: [{ internalType: "bool", name: "_authorized", type: "bool" }],
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
    inputs: [
      { internalType: "string", name: "_chainName", type: "string" },
      { internalType: "address", name: "_owner", type: "address" },
      { internalType: "bytes", name: "_chainId", type: "bytes" },
    ],
    name: "register",
    outputs: [],
    stateMutability: "nonpayable",
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
      { internalType: "bytes32", name: "_labelHash", type: "bytes32" },
      { internalType: "address", name: "_owner", type: "address" },
    ],
    name: "setLabelOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_operator", type: "address" },
      { internalType: "bool", name: "_isOperator", type: "bool" },
    ],
    name: "setOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_labelHash", type: "bytes32" },
      { internalType: "bytes", name: "_chainId", type: "bytes" },
      { internalType: "string", name: "_chainName", type: "string" },
    ],
    name: "setRecord",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32[]", name: "_labelHashes", type: "bytes32[]" },
      { internalType: "bytes[]", name: "_chainIds", type: "bytes[]" },
      { internalType: "string[]", name: "_chainNames", type: "string[]" },
    ],
    name: "setRecords",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "_interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "_isSupported", type: "bool" }],
    stateMutability: "view",
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

export const CHAIN_RESOLVER_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_chainRegistry", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "ChainNameEmpty", type: "error" },
  { inputs: [], name: "LabelAlreadyAssigned", type: "error" },
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
    inputs: [
      { internalType: "string", name: "label", type: "string" },
      { internalType: "bytes32", name: "chainId", type: "bytes32" },
    ],
    name: "demoAssign",
    outputs: [],
    stateMutability: "nonpayable",
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
