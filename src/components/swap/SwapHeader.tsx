import React from 'react'
import styled from 'styled-components'
import Settings from '../Settings'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { LightQuestionHelper } from '../QuestionHelper'

const StyledSwapHeader = styled.div`
  padding: 12px 1rem 0px 1.5rem;
  margin-bottom: -4px;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.text2};
`

export default function SwapHeader() {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <TYPE.black fontWeight={500} fontSize={20}>
          Swap
          <LightQuestionHelper
            text={
              <span>
                NOTE: This is our new-era dex frontend design. Gtps.Finance leading the way to the next stage of
                development. Simply click on SWITCH TO ETHEREUM to swap on ethereum.
              </span>
            }
            lightBulb={true}
          />
        </TYPE.black>
        <Settings />
      </RowBetween>
    </StyledSwapHeader>
  )
}
