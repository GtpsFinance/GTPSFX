import React, { useRef } from 'react'
import { Book, Code, PieChart, Check } from 'react-feather'
import styled from 'styled-components'
import { ReactComponent as MenuIcon } from '../../assets/images/menu.svg'
import { useActiveWeb3React } from '../../hooks'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import { useLocation } from 'react-router-dom'

import { ExternalLink } from '../../theme'
import { ButtonPrimary } from '../Button'

import useGovernanceToken from '../../hooks/useGovernanceToken'
import useBlockchain from '../../hooks/useBlockchain'
import { Blockchain } from '@fatex-dao/sdk'
import TelegramLogo from '../../assets/images/telegram-logo.svg'
import TwitterLogo from '../../assets/images/twitter-logo.svg'
import DiscordLogo from '../../assets/images/discord-logo.svg'
import YouTubeLogo from '../../assets/images/youtube-logo.svg'
import RedditLogo from '../../assets/images/reddit-logo.svg'
import MediumLogo from '../../assets/images/medium-logo.svg'
import SubstackLogo from '../../assets/images/substack-logo.svg'
import LinkedinLogo from '../../assets/images/linkedin-logo.svg'
import Checkmark from '../../assets/images/checkmark-icon.svg'
import { useDarkModeManager } from '../../state/user/hooks'

const StyledMenuIcon = styled(MenuIcon)`
  path {
    stroke: ${({ theme }) => theme.text1};
  }
`

const StyledMenuButton = styled.button`
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  height: 41px;
  cursor: pointer;
  padding: 0.15rem 0.5rem;
  border-radius: 8px;
  border: 3px solid ${({ theme }) => theme.text1};
  background-color: inherit;/*${({ theme }) => theme.bg1};*/
  color: ${({ theme }) => theme.text1};

  :hover {
    color: ${({ theme }) => theme.text6}
    background-color: ${({ theme }) => theme.bg6};
    
    svg {
      filter: invert(1)
    }
  }

  svg {
    margin-top: 2px;
  }
`

const StyledMenuMobile = styled.div<{ isStaking: boolean }>`
  margin-left: 0.5rem;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
  display: none;

  ${({ theme, isStaking }) =>
    isStaking
      ? `
    @media screen and (max-width: 1800px) {
      display: flex;
    }
  `
      : theme.mediaWidth.upToMedium`
    display: flex;
  `};
`

const MenuFlyout = styled.span<{ isStaking: boolean }>`
  min-width: 16rem;
  background-color: ${({ theme }) => theme.bg2};
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.01), 0 4px 8px rgba(0, 0, 0, 0.04), 0 16px 24px rgba(0, 0, 0, 0.04),
    0 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 4rem;
  right: 0rem;
  z-index: 100;

  ${({ isStaking }) =>
    isStaking &&
    `

    @media screen and (max-width: 1800px) {
    top: -20.5rem;
    left: 0rem;
    right: auto;
    }`}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: -20rem;
    right: 0rem;
    left: auto;
  `};
`

const StyledMenuDesktop = styled.div<{ isStaking: boolean }>`
  margin-left: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: right;
  align-items: flex-end;
  border: none;
  text-align: right;
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: fit-content;

  a {
    text-align: right;
    text-decoration: none;
  }

  ${({ theme, isStaking }) =>
    isStaking
      ? `
    @media screen and (max-width: 1800px) {
      display: none;
    }
  `
      : theme.mediaWidth.upToMedium`
    display: none;
  `};
`

const MenuItem = styled(ExternalLink)`
  flex: 1;
  width: fit-content;
  justify-content: right;
  align-items: flex-end;
  text-align: right;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
  img {
    filter: invert(1);
    opacity: 0.6;
    margin-right: 8px;
    width: 14px;
  }
`

const SocialLinks = styled.div<{ darkMode: boolean }>`
  margin-top: 10px;

  a {
    display: inline-block;
    margin: 5px;

    img,
    svg {
      ${({ darkMode }) => darkMode && 'filter: invert(1);'}
      width: 20px;
      opacity: 0.6;

      :hover {
        opacity: 1;
      }
    }
  }
`

export default function Menu() {
  const { account } = useActiveWeb3React()
  const blockchain = useBlockchain()
  const govToken = useGovernanceToken()

  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.MENU)
  const toggle = useToggleModal(ApplicationModal.MENU)
  useOnClickOutside(node, open ? toggle : undefined)
  const openClaimModal = useToggleModal(ApplicationModal.ADDRESS_CLAIM)

  const [darkMode, toggleDarkMode] = useDarkModeManager()

  const location = useLocation()
  const isStaking = location.pathname === '/depository'

  return (
    <>
      {/* https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451*/}
      <StyledMenuDesktop ref={node as any} isStaking={isStaking}>
        <MenuItem id="link" href={'https://gtpsfinance.org'}>
          GtpsFinance.org
        </MenuItem>
        <MenuItem id="link" href={'https://gtps.finance'}>
          Gtps.Finance
        </MenuItem>
        <MenuItem id="link" href={'https://github.com/GtpsFinance'}>
          <Code size={14} />
          Code
        </MenuItem>
        <MenuItem id="link" href={'https://linktr.ee/GtpsFinance'}>
          <Check size={14} />
          Gtps.Finance Links
        </MenuItem>
        <MenuItem id="link" href={'www.gtps.finance'}>
          <Book size={14} />
          WhitePaper
        </MenuItem>
        <MenuItem id="link" href="https://gtps.finance">
          <PieChart size={14} />
          Analytics
        </MenuItem>
        <SocialLinks darkMode={darkMode}>
          <a href={'https://www.twitter.com/GtpsFinance'} target={'_blank'} rel="noreferrer">
            <img src={TwitterLogo} alt={'twitter logo'} />
          </a>
          <a href={'https://www.reddit.com/user/gtpsfinance'} target={'_blank'} rel="noreferrer">
            <img src={RedditLogo} alt={'reddit logo'} />
          </a>
          <a href={'https://medium.com/@welcome_73960'} target={'_blank'} rel="noreferrer">
            <img src={MediumLogo} alt={'medium logo'} />
          </a>
          <a href={'https://t.me/joinusatgtpsfinance'} target={'_blank'} rel="noreferrer">
            <img src={TelegramLogo} alt={'telegram logo'} />
          </a>
          <a href={'https://gtpsfinance.org'} target={'_blank'} rel="noreferrer">
            <img src={DiscordLogo} alt={'discord logo'} />
          </a>
          <a href={'https://gtpsfinance.org/'} target={'_blank'} rel="noreferrer">
            <img
              style={{ filter: `brightness(100) ${darkMode ? '' : ' invert(1)'}` }}
              src={SubstackLogo}
              alt={'substack logo'}
            />
          </a>
          <a href={'https://www.youtube.com/channel/UCTkUX__FNR-u9KZhzSvUNYg/'} target={'_blank'} rel="noreferrer">
            <img src={YouTubeLogo} alt={'youtube logo'} />
          </a>
          <a href={'https://www.linkedin.com/today/author/david-gomadza-4400ab87'} target={'_blank'} rel="noreferrer">
            <img src={LinkedinLogo} alt={'linkedin logo'} />
          </a>
        </SocialLinks>
      </StyledMenuDesktop>
      <StyledMenuMobile ref={node as any} isStaking={isStaking}>
        <StyledMenuButton onClick={toggle}>
          <StyledMenuIcon />
        </StyledMenuButton>

        {open && (
          <MenuFlyout isStaking={isStaking}>
            <MenuItem id="link" href={'https://gtps.finance.org'}>
              Gtpsfinance.org
            </MenuItem>
            <MenuItem id="link" href={'https://gtpsfinance.org'}>
              GtpsFinance.org
            </MenuItem>
            <MenuItem id="link" href={'https://github.com/GtpsFinance'}>
              <Code size={14} />
              Code
            </MenuItem>
            <MenuItem id="link" href={'https://linktr.ee/GtpsFinance'}>
              <img src={Checkmark} />
              GtpsFinance Links
            </MenuItem>
            <MenuItem id="link" href={'https://gtps.finance'}>
              <Book size={14} />
              WhitePaper
            </MenuItem>
            <MenuItem id="link" href="https://gtps.finance">
              <PieChart size={14} />
              Analytics
            </MenuItem>
            <SocialLinks darkMode={darkMode}>
              <a href={'https://www.twitter.com/GtpsFinance'} target={'_blank'} rel="noreferrer">
                <img src={TwitterLogo} alt={'twitter logo'} />
              </a>
              <a href={'https://www.reddit.com/user/GtpsFinance'} target={'_blank'} rel="noreferrer">
                <img src={RedditLogo} alt={'reddit logo'} />
              </a>
              <a href={'https://medium.com/@welcome_73960'} target={'_blank'} rel="noreferrer">
                <img src={MediumLogo} alt={'medium logo'} />
              </a>
              <a href={'https://t.me/joinusatgtpsfinance'} target={'_blank'} rel="noreferrer">
                <img src={TelegramLogo} alt={'telegram logo'} />
              </a>
              <a href={'https://gtps.finance'} target={'_blank'} rel="noreferrer">
                <img src={DiscordLogo} alt={'discord logo'} />
              </a>
              <a href={'https://gtpsfinance.org/'} target={'_blank'} rel="noreferrer">
                <img
                  style={{ filter: `brightness(100)${darkMode ? '' : ' invert(1)'}` }}
                  src={SubstackLogo}
                  alt={'substack logo'}
                />
              </a>
              <a href={'https://www.youtube.com/channel/UCTkUX__FNR-u9KZhzSvUNYg'} target={'_blank'} rel="noreferrer">
                <img src={YouTubeLogo} alt={'youtube logo'} />
              </a>
              <a
                href={'https://www.linkedin.com/today/author/david-gomadza-4400ab87'}
                target={'_blank'}
                rel="noreferrer"
              >
                <img src={LinkedinLogo} alt={'linkedin logo'} />
              </a>
            </SocialLinks>
            {account && blockchain === Blockchain.POLYGON && (
              <ButtonPrimary onClick={openClaimModal} padding="8px 16px" width="100%" borderRadius="12px" mt="0.5rem">
                VESTED {govToken?.symbol}
              </ButtonPrimary>
            )}
          </MenuFlyout>
        )}
      </StyledMenuMobile>
    </>
  )
}
