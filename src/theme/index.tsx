//import { transparentize } from 'polished'
import React, { useMemo } from 'react'
import styled, {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
  css,
  DefaultTheme
} from 'styled-components'
import { useIsDarkMode } from '../state/user/hooks'
import { Text, TextProps } from 'rebass'
import { Colors } from './styled'

import useBlockchain from '../hooks/useBlockchain'
import { Blockchain } from '@fatex-dao/sdk'

export * from './components'

const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

const white = '#FFFFFF'
const black = '#000000'

export function defaultColors(darkMode: boolean): Colors {
  return {
    // base
    white,
    black,

    // text
    text1: darkMode ? '#FFFFFF' : '#FFFFFF',
    text2: darkMode ? '#C3C5CB' : '#FFFFFF',
    text3: darkMode ? '#6C7284' : '#888D9B',
    text4: darkMode ? '#FFFFFF' : '#C3C5CB',
    text5: darkMode ? '#2C2F36' : '#EDEEF2',
    text6: darkMode ? '#FFFFFF' : '#FFFFFF',

    // backgrounds / greys
    bg1: darkMode ? '#0DOBB1' : '#0D0BB1',
    bg2: darkMode ? '#2C2F36' : '#F7F8FA',
    bg3: darkMode ? '#40444F' : '#0D0BB1',
    bg4: darkMode ? '#000000' : '#CED0D9',
    bg5: darkMode ? '#b7b7b7' : '#888D9B',
    bg6: darkMode ? '#0D0BB1' : '#0D0BB1',

    //specialty colors
    modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
    advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

    //primary colors
    primary1: darkMode ? '#c8c02b' : '#ff007a',
    primary2: darkMode ? '#c8c02c' : '#FF8CC3',
    primary3: darkMode ? '#c8c02d' : '#FF99C9',
    primary4: darkMode ? '#376bad70' : '#F6DDE8',
    primary5: darkMode ? '#153d6f70' : '#FDEAF1',

    // color text
    primaryText1: darkMode ? '#c8c02b' : '#ff007a',

    // secondary colors
    secondary1: darkMode ? '#c8c02b' : '#ff007a',
    secondary2: darkMode ? '#17000b26' : '#F6DDE8',
    secondary3: darkMode ? '#17000b26' : '#FDEAF1',

    // other
    red1: '#FD4040',
    red2: '#F82D3A',
    red3: '#D60000',
    green1: '#27AE60',
    yellow1: '#FFE270',
    yellow2: '#F3841E',
    blue1: '#2172E5',

    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',

    // Added:
    tokenButtonGradientStart: '#008c6b',
    tokenButtonGradientEnd: '#005224',
    customCardGradientStart: '#008c6b',
    customCardGradientEnd: '#00c09c'
  }
}

export function viperColors(darkMode: boolean): Colors {
  return {
    // base
    white,
    black,

    // text
    text1: darkMode ? '#FFFFFF' : '#FFFFFF',
    text2: darkMode ? '#C3C5CB' : '#FFFFFF',
    text3: darkMode ? '#6C7284' : '#888D9B',
    text4: darkMode ? '#FFFFFF' : '#C3C5CB',
    text5: darkMode ? '#2C2F36' : '#EDEEF2',
    text6: darkMode ? '#FFFFFF' : '#FFFFFF',

    // backgrounds / greys
    bg1: darkMode ? '#000000' : '#0D0BB1',
    bg2: darkMode ? '#2C2F36' : '#F7F8FA',
    bg3: darkMode ? '#40444F' : '#0D0BB1',
    bg4: darkMode ? '#000000' : '#CED0D9',
    bg5: darkMode ? '#b7b7b7' : '#888D9B',
    bg6: darkMode ? '#000000' : '#000000',

    //specialty colors
    modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
    advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

    //primary colors
    primary1: darkMode ? '#669999' : '#00c09c',
    primary2: darkMode ? '#c8c02c' : '#FF8CC3',
    primary3: darkMode ? '#c8c02d' : '#FF99C9',
    primary4: darkMode ? '#376bad70' : '#F6DDE8',
    primary5: darkMode ? '#153d6f70' : '#e8f4e5',

    // color text
    primaryText1: darkMode ? '#669999' : '#00c09c',

    // secondary colors
    secondary1: darkMode ? '#c8c02b' : '#ff007a',
    secondary2: darkMode ? '#17000b26' : '#F6DDE8',
    secondary3: darkMode ? '#17000b26' : '#FDEAF1',

    // other
    red1: '#FD4040',
    red2: '#F82D3A',
    red3: '#D60000',
    green1: '#27AE60',
    yellow1: '#FFE270',
    yellow2: '#F3841E',
    blue1: '#2172E5',

    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',

    // Added:
    tokenButtonGradientStart: '#008c6b',
    tokenButtonGradientEnd: '#005224',
    customCardGradientStart: '#008c6b',
    customCardGradientEnd: '#00c09c'
  }
}

export function bscColors(darkMode: boolean): Colors {
  return {
    // base
    white,
    black,

    // text
    text1: darkMode ? '#FFFFFF' : '#000000',
    text2: darkMode ? '#C3C5CB' : '#FFFFFF',
    text3: darkMode ? '#6C7284' : '#888D9B',
    text4: darkMode ? '#FFFFFF' : '#C3C5CB',
    text5: darkMode ? '#2C2F36' : '#EDEEF2',
    text6: darkMode ? '#000000' : '#FFFFFF',

    // backgrounds / greys
    bg1: darkMode ? '#000000' : '#FFFFFF',
    bg2: darkMode ? '#2C2F36' : '#F7F8FA',
    bg3: darkMode ? '#40444F' : '#0D0BB1',
    bg4: darkMode ? '#000000' : '#CED0D9',
    bg5: darkMode ? '#b7b7b7' : '#888D9B',
    bg6: darkMode ? '#FFFFFF' : '#000000',

    //specialty colors
    modalBG: darkMode ? 'rgba(0,0,0,42.5)' : 'rgba(0,0,0,0.3)',
    advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

    //primary colors
    primary1: darkMode ? '#c8c02b' : '#ffad00',
    primary2: darkMode ? '#c8c02c' : '#FFE08C',
    primary3: darkMode ? '#c8c02d' : '#F2CB61',
    primary4: darkMode ? '#376bad70' : '#FFE08C',
    primary5: darkMode ? '#153d6f70' : '#FAECC5',

    // color text
    primaryText1: darkMode ? '#6da8ff' : '#ffad00',

    // secondary colors
    secondary1: darkMode ? '#c8c02b' : '#ffad00',
    secondary2: darkMode ? '#17000b26' : '#FFE08C',
    secondary3: darkMode ? '#17000b26' : '#FAECC5',

    // other
    red1: '#FF6871',
    red2: '#F82D3A',
    red3: '#D60000',
    green1: '#27AE60',
    yellow1: '#FFE270',
    yellow2: '#F3841E',
    blue1: '#2172E5',

    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',

    // Added:
    tokenButtonGradientStart: '#ffbb00',
    tokenButtonGradientEnd: '#c99212',
    customCardGradientStart: '#001d4c',
    customCardGradientEnd: '#000024'
  }
}

export function harmonyColors(darkMode: boolean): Colors {
  return {
    // base
    white,
    black,

    // text
    text1: darkMode ? '#FFFFFF' : '#000000',
    text2: darkMode ? '#C3C5CB' : '#FFFFFF',
    text3: darkMode ? '#6C7284' : '#888D9B',
    text4: darkMode ? '#FFFFFF' : '#C3C5CB',
    text5: darkMode ? '#2C2F36' : '',
    text6: darkMode ? '#000000' : '#FFFFFF',

    // backgrounds / greys
    bg1: darkMode ? '#000000' : '#FFFFFF',
    bg2: darkMode ? '#2C2F36' : '#F7F8FA',
    bg3: darkMode ? '#40444F' : '#0D0BB1',
    bg4: darkMode ? '#000000' : '#CED0D9',
    bg5: darkMode ? '#b7b7b7' : '#888D9B',
    bg6: darkMode ? '#FFFFFF' : '#000000',

    //specialty colors
    modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
    advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

    //primary colors
    primary1: darkMode ? '#c8c02b' : '#00AEE9',
    primary2: darkMode ? '#c8c02c' : '#69FABD',
    primary3: darkMode ? '#c8c02d' : '#00c5eb',
    primary4: darkMode ? '#376bad70' : '#bcecfd',
    primary5: darkMode ? '#153d6f70' : '#d9f4fd',

    // color text
    primaryText1: darkMode ? '#6da8ff' : '#00AEE9',

    // secondary colors
    secondary1: darkMode ? '#c8c02b' : '#00AEE9',
    secondary2: darkMode ? '#17000b26' : '#F6DDE8',
    secondary3: darkMode ? '#17000b26' : '#FDEAF1',

    // other
    red1: '#FD4040',
    red2: '#F82D3A',
    red3: '#D60000',
    green1: '#27AE60',
    yellow1: '#FFE270',
    yellow2: '#F3841E',
    blue1: '#2172E5',

    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',

    // Added:
    tokenButtonGradientStart: '#008c6b',
    tokenButtonGradientEnd: '#005224',
    customCardGradientStart: '#008c6b',
    customCardGradientEnd: '#00c09c'
  }
}

export function colors(blockchain: Blockchain, darkMode: boolean): Colors {
  switch (blockchain) {
    case Blockchain.BINANCE_SMART_CHAIN:
      return bscColors(darkMode)
    case Blockchain.HARMONY:
      return harmonyColors(darkMode)
    default:
      return viperColors(darkMode)
  }
}

export function theme(blockchain: Blockchain, darkMode: boolean): DefaultTheme {
  return {
    ...colors(blockchain, darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24
    },

    //shadows
    shadow1: darkMode ? '#000' : '#2F80ED',

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()
  const blockchain = useBlockchain()

  const themeObject = useMemo(() => theme(blockchain, darkMode), [blockchain, darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

export const TYPE = {
  main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text2'} {...props} />
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />
  },
  black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  white(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'text1'} {...props} />
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />
  },
  small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />
  },
  blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'blue1'} {...props} />
  },
  yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'yellow1'} {...props} />
  },
  darkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text3'} {...props} />
  },
  gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'bg3'} {...props} />
  },
  italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} color={'text2'} {...props} />
  },
  error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? 'red1' : 'text2'} {...props} />
  }
}

export const FixedGlobalStyle = createGlobalStyle`
html, input, textarea, button {
  font-family: 'Inter', sans-serif;
  font-display: fallback;
}
@supports (font-variation-settings: normal) {
  html, input, textarea, button {
    font-family: 'Lexend', sans-serif;
  }
}

html,
body {
  margin: 0;
  padding: 0;
}

 a {
   color: ${colors(Blockchain.ETHEREUM, false).blue1}; 
 }
 
 #stats-popover > div {
  border-radius: 8px !important;
  background-color: #40444f;
  margin-top: 10px;
 }

* {
  box-sizing: border-box;
}

button {
  user-select: none;
}

html {
  font-size: 16px;
  font-variant: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;
  
}
`

export const ThemedGlobalStyle = createGlobalStyle`
html {
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg1};
}

body {
  min-height: 100vh;
  background-color: rgba(13, 11, 177, 0);
}
`
