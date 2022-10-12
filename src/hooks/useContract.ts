import { Contract } from '@ethersproject/contracts'
import { abi as GOVERNANCE_ABI } from '../constants/abis/governor-alpha.json'
import { abi as UNI_ABI } from '../constants/abis/fate-token.json'
import { abi as GOVERNANCE_TOKEN_ABI } from '../constants/abis/fate-token.json'
import { abi as FATE_REWARD_CONTROLLER_ABI } from '../constants/abis/fate-reward-controller.json'
import { abi as FATE_REWARD_CONTROLLER_READER_ABI } from '../constants/abis/fate-reward-controller-reader.json'
import { abi as LIQUIDITY_MIGRATOR_ABI } from '../constants/abis/liquidity-migrator.json'
import { abi as X_FATE_ABI } from '../constants/abis/xfate-token.json'
import { abi as FEE_TOKEN_CONVERTER_TO_FATE_ABI } from '../constants/abis/fee-token-converter-to-fate.json'
import { abi as MERKLE_DISTRIBUTOR_ABI } from '../constants/abis/merkle-distributor.json'
import { ChainId, WETH } from '@fatex-dao/sdk'
import { abi as IUniswapV2PairABI } from '../constants/abis/uniswap-v2-pair.json'
import { useMemo } from 'react'
import {
  GOVERNANCE_ADDRESS,
  MERKLE_DISTRIBUTOR_ADDRESS,
  FATE_REWARD_CONTROLLER,
  X_FATE,
  FEE_TOKEN_CONVERTER,
  SUSHI_MIGRATOR,
  VIPER_MIGRATOR,
  FUZZ_MIGRATOR,
  DEFI_KINGDOMS_MIGRATOR,
  FATE_REWARD_CONTROLLER_READER
} from '../constants'
import {
  ARGENT_WALLET_DETECTOR_ABI,
  ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS
} from '../constants/abis/argent-wallet-detector'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import ENS_ABI from '../constants/abis/ens-registrar.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import ERC20_ABI from '../constants/abis/erc20.json'
import { MIGRATOR_ABI, MIGRATOR_ADDRESS } from '../constants/abis/migrator'
import UNISOCKS_ABI from '../constants/abis/unisocks.json'
import WETH_ABI from '../constants/abis/weth.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import { V1_EXCHANGE_ABI, V1_FACTORY_ABI, V1_FACTORY_ADDRESSES } from '../constants/v1'
import { getContract } from '../utils'
import { useActiveWeb3React } from './index'
import useGovernanceToken from './useGovernanceToken'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useV1FactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && V1_FACTORY_ADDRESSES[chainId], V1_FACTORY_ABI, false)
}

export function useV2MigratorContract(): Contract | null {
  return useContract(MIGRATOR_ADDRESS, MIGRATOR_ABI, true)
}

export function useV1ExchangeContract(address?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, V1_EXCHANGE_ABI, withSignerIfPossible)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MAINNET ? ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS : undefined,
    ARGENT_WALLET_DETECTOR_ABI,
    false
  )
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.GÖRLI:
      case ChainId.ROPSTEN:
      case ChainId.RINKEBY:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function useMerkleDistributorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MERKLE_DISTRIBUTOR_ADDRESS[chainId] : undefined, MERKLE_DISTRIBUTOR_ABI, true)
}

export function useGovernanceContract(chainId: ChainId): Contract | null {
  return useContract(GOVERNANCE_ADDRESS[chainId], GOVERNANCE_ABI, true)
}

export function useUniContract(): Contract | null {
  return useContract(useGovernanceToken()?.address, UNI_ABI, true)
}

export function useGovTokenContract(): Contract | null {
  return useContract(useGovernanceToken()?.address, GOVERNANCE_TOKEN_ABI, true)
}

export function useXFateContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? X_FATE[chainId].address : undefined, X_FATE_ABI, withSignerIfPossible)
}

export function useFeeTokenConverterToFateContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId ? FEE_TOKEN_CONVERTER[chainId] : undefined,
    FEE_TOKEN_CONVERTER_TO_FATE_ABI,
    withSignerIfPossible
  )
}

export function useFateRewardController(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  const address = chainId && FATE_REWARD_CONTROLLER[chainId]
  return useContract(address, FATE_REWARD_CONTROLLER_ABI, withSignerIfPossible)
}

export function useFateRewardControllerReader(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  const address = chainId && FATE_REWARD_CONTROLLER_READER[chainId]
  return useContract(address, FATE_REWARD_CONTROLLER_READER_ABI, withSignerIfPossible)
}

export function useSocksController(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MAINNET ? '0x65770b5283117639760beA3F867b69b3697a91dd' : undefined,
    UNISOCKS_ABI,
    false
  )
}

export function useSushiMigrator(): Contract | null {
  const { chainId } = useActiveWeb3React()
  const address = chainId && SUSHI_MIGRATOR[chainId]
  return useContract(address, LIQUIDITY_MIGRATOR_ABI, true)
}

export function useViperMigrator(): Contract | null {
  const { chainId } = useActiveWeb3React()
  const address = chainId && VIPER_MIGRATOR[chainId]
  return useContract(address, LIQUIDITY_MIGRATOR_ABI, true)
}

export function useFuzzMigrator(): Contract | null {
  const { chainId } = useActiveWeb3React()
  const address = chainId && FUZZ_MIGRATOR[chainId]
  return useContract(address, LIQUIDITY_MIGRATOR_ABI, true)
}

export function useDeFiKingdomsMigrator(): Contract | null {
  const { chainId } = useActiveWeb3React()
  const address = chainId && DEFI_KINGDOMS_MIGRATOR[chainId]
  return useContract(address, LIQUIDITY_MIGRATOR_ABI, true)
}
