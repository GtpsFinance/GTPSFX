import { useMemo } from 'react'
import { TokenAmount, Fraction } from '@fatex-dao/sdk'
import { useTokenBalance } from '../state/wallet/hooks'
import useBUSDPrice from './useBUSDPrice'
import { FATE_TOKEN_INTERFACE } from '../constants/abis/governanceToken'
import useGovernanceToken from 'hooks/useGovernanceToken'
import useXFateToken from './useXFateToken'

export default function useXFateTVL(): Fraction | undefined {
  const govToken = useGovernanceToken()
  const govTokenBusdPrice = useBUSDPrice(govToken)
  const xFate = useXFateToken()
  const xFateGovTokenBalance: TokenAmount | undefined = useTokenBalance(
    xFate && xFate.address,
    govToken,
    'balanceOf',
    FATE_TOKEN_INTERFACE
  )

  return useMemo(() => {
    return govTokenBusdPrice ? xFateGovTokenBalance?.multiply(govTokenBusdPrice?.raw) : undefined
  }, [govTokenBusdPrice, xFateGovTokenBalance])
}
