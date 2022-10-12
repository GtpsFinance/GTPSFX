import { CurrencyAmount, Fraction, JSBI, Pair, Token, TokenAmount } from '@fatex-dao/sdk'
import { useMemo } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useMultipleContractSingleData, useSingleCallResult, useSingleContractMultipleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import { useFateRewardController, useFateRewardControllerReader } from '../../hooks/useContract'
import { abi as IUniswapV2PairABI } from '../../constants/abis/uniswap-v2-pair.json'
import { Interface } from '@ethersproject/abi'
import useGovernanceToken from '../../hooks/useGovernanceToken'
import useTokensWithWETHPrices from '../../hooks/useTokensWithWETHPrices'
import useBUSDPrice from '../../hooks/useBUSDPrice'
import useFilterStakingRewardsInfo from '../../hooks/useFilterStakingRewardsInfo'
import getBlocksPerYear from '../../utils/getBlocksPerYear'
import calculateWethAdjustedTotalStakedAmount from '../../utils/calculateWethAdjustedTotalStakedAmount'
import calculateApr from '../../utils/calculateApr'
import validStakingInfo from '../../utils/validStakingInfo'
import determineBaseToken from '../../utils/determineBaseToken'
import { useBlockNumber } from '../application/hooks'
import { getEpochFromWeekIndex } from '../../constants/epoch'
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
import { MaxUint256 } from '@ethersproject/constants'

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI)

export const STAKING_GENESIS = 6502000

export const REWARDS_DURATION_DAYS = 60

export interface StakingInfo {
  // the pool id (pid) of the pool
  pid: number
  // the tokens involved in this pair
  tokens: [Token, Token]
  // baseToken used for TVL & APR calculations
  baseToken: Token | undefined
  // the allocation point for the given pool
  allocPoint: JSBI
  // start timestamp for all the rewards pools
  startTimestamp: number
  // base rewards per second
  baseRewardsPerSecond: TokenAmount
  // pool specific rewards per block
  poolRewardsPerBlock: TokenAmount
  // blocks generated per year
  blocksPerYear: JSBI
  // pool share vs all pools
  poolShare: Fraction
  // the percentage of rewards locked
  lockedRewardsPercentageUnits: number
  // the percentage of rewards locked
  unlockedRewardsPercentageUnits: number
  // the total supply of lp tokens in existence
  totalLpTokenSupply: TokenAmount
  // the amount of currently total staked tokens in the pool
  totalStakedAmount: TokenAmount
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the ratio of the user's share of the pool
  stakedRatio: Fraction
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  // the amount of reward token claimed by the active account, or undefined if no account
  rewardDebt: TokenAmount
  // the addition of earnedAmount and rewardDebt
  allClaimedRewards: TokenAmount
  // value of total staked amount, measured in weth
  valueOfTotalStakedAmountInWeth: TokenAmount | Fraction | undefined
  // value of total staked amount, measured in a USD stable coin (busd, usdt, usdc or a mix thereof)
  valueOfTotalStakedAmountInUsd: Fraction | undefined
  // pool APR
  apr: Fraction | undefined
  // if pool is active
  active: boolean
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(active: boolean | undefined = undefined, pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()
  const fateRewardController = useFateRewardController()
  const fateRewardControllerReader = useFateRewardControllerReader()
  const currentTimestamp = useCurrentBlockTimestamp()
  const startTimestamp = useSingleCallResult(fateRewardController, 'startTimestamp')

  const weekIndex = useMemo(() => {
    return JSBI.divide(
      JSBI.subtract(
        JSBI.BigInt(currentTimestamp ?? 0),
        startTimestamp.result?.[0]
          ? JSBI.BigInt(startTimestamp.result?.[0].toString())
          : JSBI.BigInt(currentTimestamp ?? 0)
      ),
      JSBI.BigInt(604800)
    )
  }, [currentTimestamp, startTimestamp.result])

  const masterInfo = useFilterStakingRewardsInfo(chainId, active, pairToFilterBy)

  const tokensWithPrices = useTokensWithWETHPrices()

  const weth = tokensWithPrices?.WETH?.token
  const wethBusdPrice = useBUSDPrice(weth)
  const govToken = tokensWithPrices?.govToken?.token
  const govTokenWETHPrice = tokensWithPrices?.govToken?.price

  const secondsPerYear = JSBI.BigInt(86400 * 365)

  const pids = useMemo(() => masterInfo.map(({ pid }) => pid), [masterInfo])

  const pidAccountMapping = useMemo(
    () => masterInfo.map(({ pid }) => (account ? [pid, account] : [undefined, undefined])),
    [masterInfo, account]
  )

  const lockedFates = useSingleContractMultipleData(fateRewardControllerReader, 'allLockedFate', pidAccountMapping)
  const pendingRewards = useSingleContractMultipleData(fateRewardController, 'pendingUnlockedFate', pidAccountMapping)
  const userInfos = useSingleContractMultipleData(fateRewardController, 'userInfo', pidAccountMapping)

  const poolInfos = useSingleContractMultipleData(
    fateRewardController,
    'poolInfo',
    pids.map(pids => [pids])
  )

  const lpTokenAddresses = useMemo(() => {
    return poolInfos.reduce<string[]>((memo, poolInfo) => {
      if (poolInfo && !poolInfo.loading && poolInfo.result) {
        const [lpTokenAddress] = poolInfo.result
        memo.push(lpTokenAddress)
      }
      return memo
    }, [])
  }, [poolInfos])

  const lpTokenTotalSupplies = useMultipleContractSingleData(lpTokenAddresses, PAIR_INTERFACE, 'totalSupply')
  const lpTokenReserves = useMultipleContractSingleData(lpTokenAddresses, PAIR_INTERFACE, 'getReserves')
  const lpTokenBalances = useMultipleContractSingleData(lpTokenAddresses, PAIR_INTERFACE, 'balanceOf', [
    fateRewardController?.address
  ])

  // getNewRewardPerBlock uses pid = 0 to return the base rewards
  // poolIds have to be +1'd to map to their actual pid
  // also include pid 0 to get the base reward rate
  let adjustedPids = pids.map(pid => pid + 1)
  adjustedPids = [...[0], ...adjustedPids]

  const poolRewardsPerSeconds = useSingleContractMultipleData(
    fateRewardController,
    'getNewRewardPerSecond',
    adjustedPids.map(adjustedPids => [adjustedPids])
  )

  const currentBlock = useBlockNumber()

  return useMemo(() => {
    if (!chainId || !weth || !govToken) return []

    return pids.reduce<StakingInfo[]>((memo, pid, index) => {
      const tokens = masterInfo[index].tokens
      const poolInfo = poolInfos[index]

      // amount uint256, rewardDebt uint256, rewardDebtAtBlock uint256, lastWithdrawBlock uint256, firstDepositBlock uint256, blockdelta uint256, lastDepositBlock uint256
      const userInfo = userInfos[index]
      const pendingReward = pendingRewards[index]
      const lockedFate = lockedFates[index]
      const lpTokenTotalSupply = lpTokenTotalSupplies[index]
      const lpTokenReserve = lpTokenReserves[index]
      const lpTokenBalance = lpTokenBalances[index]

      // poolRewardsPerBlock indexes have to be +1'd to get the actual specific pool data
      const poolRewardsPerSecond = poolRewardsPerSeconds[0]
      const specificPoolRewardsPerSecond = poolRewardsPerSeconds[index + 1]

      if (
        validStakingInfo(
          tokens,
          poolInfo,
          pendingReward,
          userInfo,
          poolRewardsPerSecond,
          specificPoolRewardsPerSecond,
          lpTokenTotalSupply,
          lpTokenReserve,
          lpTokenBalance,
          startTimestamp,
          currentBlock
        )
      ) {
        const hasRewardsStarted =
          startTimestamp.result?.[0].toString() && MaxUint256.toString() !== startTimestamp.result?.[0].toString()
        const startsAtTimestamp = parseInt(startTimestamp.result?.[0].toString() ?? '0')

        const epoch = getEpochFromWeekIndex(weekIndex)

        let multiplier
        if (JSBI.equal(epoch, JSBI.BigInt('0'))) {
          multiplier = JSBI.BigInt('125')
        } else {
          // copy previous epoch's logic
          multiplier = JSBI.BigInt('125')
        }

        let divisor
        if (JSBI.equal(epoch, JSBI.BigInt('0'))) {
          divisor = JSBI.BigInt('10')
        } else {
          // copy previous epoch's logic
          divisor = JSBI.BigInt('10')
        }

        const baseRewardsPerSecond = new TokenAmount(
          govToken,
          JSBI.divide(JSBI.multiply(JSBI.BigInt(poolRewardsPerSecond?.result?.[0] ?? 0), multiplier), divisor)
        )

        const poolBlockRewards = specificPoolRewardsPerSecond?.result?.[0]
          ? new TokenAmount(
              govToken,
              JSBI.divide(
                JSBI.multiply(JSBI.BigInt(specificPoolRewardsPerSecond?.result?.[0] ?? 0), multiplier),
                divisor
              )
            )
          : baseRewardsPerSecond

        const poolShare = new Fraction(poolBlockRewards.raw, baseRewardsPerSecond.raw)

        const lockedRewardsPercentageUnits = 0
        const unlockedRewardsPercentageUnits = 100

        const calculatedTotalPendingRewards = JSBI.BigInt(pendingReward?.result?.[0] ?? 0)
        const lockedFateBigInt = JSBI.BigInt(lockedFate?.result?.[0] ?? 0)

        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(userInfo?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(
          dummyPair.liquidityToken,
          JSBI.BigInt(lpTokenBalance.result?.[0] ?? 0)
        )
        const stakedRatio = totalStakedAmount.equalTo('0')
          ? new Fraction('0')
          : new Fraction(stakedAmount.raw, totalStakedAmount.raw)

        const totalLpTokenSupply = new TokenAmount(
          dummyPair.liquidityToken,
          JSBI.BigInt(lpTokenTotalSupply.result?.[0] ?? 0)
        )
        const totalPendingRewardAmount = new TokenAmount(govToken, calculatedTotalPendingRewards)
        const totalRewardDebt = new TokenAmount(govToken, lockedFateBigInt)

        // poolInfo: lpToken address, allocPoint uint256, lastRewardBlock uint256, accGovTokenPerShare uint256
        const poolInfoResult = poolInfo.result
        const allocPoint = JSBI.BigInt(poolInfoResult && poolInfoResult[1])
        const active =
          !!(poolInfoResult && JSBI.GT(JSBI.BigInt(allocPoint), 0)) || (!hasRewardsStarted && masterInfo[index].active)

        const baseToken = determineBaseToken(tokensWithPrices, tokens)

        const totalStakedAmountWETH = calculateWethAdjustedTotalStakedAmount(
          chainId,
          baseToken,
          tokensWithPrices,
          tokens,
          totalLpTokenSupply,
          totalStakedAmount,
          lpTokenReserve?.result
        )

        const totalStakedAmountBUSD =
          wethBusdPrice && totalStakedAmountWETH && totalStakedAmountWETH.multiply(wethBusdPrice?.raw)

        const apr =
          totalStakedAmountWETH && totalStakedAmountWETH.greaterThan('0')
            ? calculateApr(govTokenWETHPrice, baseRewardsPerSecond, secondsPerYear, poolShare, totalStakedAmountWETH)
            : undefined

        const stakingInfo: StakingInfo = {
          pid: pid,
          allocPoint: allocPoint,
          tokens: tokens,
          baseToken: baseToken,
          startTimestamp: startsAtTimestamp,
          baseRewardsPerSecond: baseRewardsPerSecond,
          poolRewardsPerBlock: poolBlockRewards,
          blocksPerYear: secondsPerYear,
          poolShare: poolShare,
          lockedRewardsPercentageUnits: lockedRewardsPercentageUnits,
          unlockedRewardsPercentageUnits: unlockedRewardsPercentageUnits,
          totalLpTokenSupply: totalLpTokenSupply,
          totalStakedAmount: totalStakedAmount,
          stakedAmount: stakedAmount,
          stakedRatio: stakedRatio,
          earnedAmount: totalPendingRewardAmount,
          rewardDebt: totalRewardDebt,
          allClaimedRewards: totalPendingRewardAmount.add(totalRewardDebt),
          valueOfTotalStakedAmountInWeth: totalStakedAmountWETH,
          valueOfTotalStakedAmountInUsd: totalStakedAmountBUSD,
          apr: apr,
          active: active
        }

        memo.push(stakingInfo)
      }
      return memo
    }, [])
  }, [
    chainId,
    weth,
    govToken,
    pids,
    masterInfo,
    poolInfos,
    userInfos,
    pendingRewards,
    lockedFates,
    lpTokenTotalSupplies,
    lpTokenReserves,
    lpTokenBalances,
    poolRewardsPerSeconds,
    startTimestamp,
    currentBlock,
    weekIndex,
    tokensWithPrices,
    wethBusdPrice,
    govTokenWETHPrice,
    secondsPerYear
  ])
}

export function useTotalGovTokensEarned(): TokenAmount | undefined {
  const govToken = useGovernanceToken()
  const stakingInfos = useStakingInfo(true)

  return useMemo(() => {
    if (!govToken) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(govToken, '0')
      ) ?? new TokenAmount(govToken, '0')
    )
  }, [stakingInfos, govToken])
}

export function useTotalLockedGovTokens(): TokenAmount | undefined {
  const govToken = useGovernanceToken()
  const stakingInfos = useStakingInfo(true)

  return useMemo(() => {
    if (!govToken) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.rewardDebt),
        new TokenAmount(govToken, '0')
      ) ?? new TokenAmount(govToken, '0')
    )
  }, [stakingInfos, govToken])
}

export function useTotalClaimedAndEarnedGovTokens(): TokenAmount | undefined {
  const govToken = useGovernanceToken()
  const stakingInfos = useStakingInfo(true)

  return useMemo(() => {
    if (!govToken) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount.add(stakingInfo.rewardDebt)),
        new TokenAmount(govToken, '0')
      ) ?? new TokenAmount(govToken, '0')
    )
  }, [stakingInfos, govToken])
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken)

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = stakingAmount
    ? tryParseAmount(typedValue, stakingAmount.token)
    : undefined

  const parsedAmount =
    parsedInput && stakingAmount && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}
