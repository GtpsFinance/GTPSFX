import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components/macro'
import { Pair, JSBI } from '@fatex-dao/sdk'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import FullPositionCard from '../../components/PositionCard'
import { useUserHasLiquidityInAllTokens } from '../../data/V1'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { StyledInternalLink, ExternalLink, TYPE, HideSmall } from '../../theme'
import { Text } from 'rebass'
import Card from '../../components/Card'
import { RowBetween, RowFixed } from '../../components/Row'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'

import { useActiveWeb3React } from '../../hooks'
import { usePairs } from '../../data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import { Dots } from '../../components/swap/styleds'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/earn/styled'
import { useStakingInfo } from '../../state/stake/hooks'
import { BIG_INT_ZERO } from '../../constants'

import { Blockchain } from '@fatex-dao/sdk'
import useBlockchain from '../../hooks/useBlockchain'
import baseCurrencies from '../../utils/baseCurrencies'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const VoteCard = styled(DataCard)`
  /*background: radial-gradient(76.02% 75.41% at 1.84% 0%, #777777 0%, #909090 100%);*/
  background: ${({ theme }) => theme.bg3};
  overflow: hidden;
  margin-bottom: 30px;
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const ButtonRow = styled(RowFixed)`
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row-reverse;
    justify-content: space-between;
  `};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  border-radius: 8px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export default function Pool() {
  const theme = useContext(ThemeContext)
  const { account, chainId } = useActiveWeb3React()
  const blockchain = useBlockchain()

  const baseCurrency = baseCurrencies(chainId)[0]
  const addLiquidityUrl = `/add/${baseCurrency.symbol}`
  const createPoolUrl = `/create/${baseCurrency.symbol}`

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  const hasV1Liquidity = useUserHasLiquidityInAllTokens()

  // show liquidity even if its deposited in rewards contract
  const stakingInfo = useStakingInfo(true)
  const stakingInfosWithBalance = stakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  const stakingPairs = usePairs(stakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens))

  //console.log(stakingInfo)
  const testData = stakingInfo.map(stakingInfo => stakingInfo.tokens)
  //console.log(testData)
  const testPair = usePairs(testData)
  //console.log(testPair)

  // remove any pairs that also are included in pairs with stake in mining pool
  const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter(v2Pair => {
    return (
      stakingPairs
        ?.map(stakingPair => stakingPair[1])
        .filter(stakingPair => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length === 0
    )
  })

  return (
    <>
      <PageWrapper>
        <SwapPoolTabs active={'depository'} />
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Pool Your Liquidity</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  Liquidity Pool (LP) tokens are made by creating a pair or adding liquidity to existing LPs.
                </TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool.
                </TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
                  There are no withdrawal fees when withdrawing liquidity from a pool.
                </TYPE.white>
              </RowBetween>
              {blockchain === Blockchain.ETHEREUM && (
                <ExternalLink
                  style={{ color: 'white', textDecoration: 'underline' }}
                  target="_blank"
                  href="https://uniswap.org/docs/v2/core-concepts/pools/"
                >
                  <TYPE.white fontSize={14}>Read more about providing liquidity</TYPE.white>
                </ExternalLink>
              )}
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>

        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
              <HideSmall>
                <TYPE.mediumHeader style={{ justifySelf: 'flex-start', maxWidth: '250px' }}>
                  Your Liquidity Pool Deposits
                </TYPE.mediumHeader>
              </HideSmall>
              <ButtonRow>
                <ResponsiveButtonSecondary as={Link} padding="6px 8px" to={createPoolUrl}>
                  Create a pair
                </ResponsiveButtonSecondary>
                <ResponsiveButtonPrimary id="join-pool-button" as={Link} padding="6px 8px" to={addLiquidityUrl}>
                  <Text fontWeight={500} fontSize={16}>
                    Add Liquidity
                  </Text>
                </ResponsiveButtonPrimary>
              </ButtonRow>
            </TitleRow>

            {!account ? (
              <Card padding="40px">
                <TYPE.body color={theme.text3} textAlign="center">
                  Connect to a wallet to view your liquidity.
                </TYPE.body>
              </Card>
            ) : v2IsLoading ? (
              <EmptyProposals>
                <TYPE.body color={theme.text3} textAlign="center">
                  <Dots>Loading</Dots>
                </TYPE.body>
              </EmptyProposals>
            ) : allV2PairsWithLiquidity?.length > 0 || stakingPairs?.length > 0 ? (
              <>
                {blockchain &&
                  Blockchain &&
                  Blockchain.HARMONY &&
                  testPair &&
                  testPair[0] &&
                  testPair[0][1] &&
                  tokenPairsWithLiquidityTokens &&
                  tokenPairsWithLiquidityTokens[0] &&
                  tokenPairsWithLiquidityTokens[0].liquidityToken &&
                  tokenPairsWithLiquidityTokens[0].liquidityToken.address &&
                  blockchain === Blockchain.HARMONY && (
                    <ButtonSecondary>
                      <RowBetween>
                        <ExternalLink href={'https://info.fatexfi.io/account/' + account}>
                          Account analytics and accrued fees
                        </ExternalLink>
                        <span> ↗</span>
                      </RowBetween>
                    </ButtonSecondary>
                  )}
                {/*testPair &&
                  testPair[0] &&
                  testPair[0][1] &&
                  testPair[2] &&
                  testPair[2][1] &&
                  testPair[4] &&
                  testPair[4][1] &&
                  testPair[22] &&
                  testPair[22][1] && (
                    <>
                      {/*<FullPositionCard
                        key={tokenPairsWithLiquidityTokens[0].liquidityToken.address}
                        pair={testPair[0][1]}
                      />
                      <FullPositionCard
                        key={tokenPairsWithLiquidityTokens[2].liquidityToken.address}
                        pair={testPair[2][1]}
                      />
                      <FullPositionCard
                        key={tokenPairsWithLiquidityTokens[4].liquidityToken.address}
                        pair={testPair[4][1]}
                      />}
                      <FullPositionCard
                        key={tokenPairsWithLiquidityTokens[22].liquidityToken.address}
                        pair={testPair[22][1]}
                      />
                    </>
                  )*/}
                {v2PairsWithoutStakedAmount.map(v2Pair => (
                  <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                ))}
                {stakingPairs.map(
                  (stakingPair, i) =>
                    stakingPair[1] && ( // skip pairs that arent loaded
                      <FullPositionCard
                        key={stakingInfosWithBalance[i].pid}
                        pair={stakingPair[1]}
                        stakedBalance={stakingInfosWithBalance[i].stakedAmount}
                      />
                    )
                )}
              </>
            ) : (
              <EmptyProposals>
                <TYPE.body color={theme.text3} textAlign="center">
                  No liquidity found.
                </TYPE.body>
              </EmptyProposals>
            )}

            <AutoColumn justify={'center'} gap="md">
              <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>
                {hasV1Liquidity ? 'FATEx V1 liquidity found!' : "Don't see a pool you joined?"}{' '}
                <StyledInternalLink id="import-pool-link" to={hasV1Liquidity ? '/migrate/v1' : '/find'}>
                  {hasV1Liquidity ? 'Migrate now.' : 'Import it.'}
                </StyledInternalLink>
              </Text>
            </AutoColumn>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </>
  )
}
