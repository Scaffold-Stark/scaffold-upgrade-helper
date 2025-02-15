import { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { ThemeProvider } from '@emotion/react'
import { Card, ConfigProvider, theme } from 'antd'
import createPersistedState from 'use-persisted-state'
import VersionSelector from '../common/VersionSelector'
import DiffViewer from '../common/DiffViewer'
// @ts-ignore-next-line
import logo from '../../assets/logo.svg'
import { DarkModeButton } from '../common/DarkModeButton'
import { deviceSizes } from '../../utils/device-sizes'
import { lightTheme, darkTheme, type Theme } from '../../theme'

const Page = styled.div<{ theme?: Theme }>`
  background-color: ${({ theme }) => theme.background};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding-top: 30px;
`

const Container = styled(Card)<{ theme?: Theme }>`
  background-color: ${({ theme }) => theme.background};
  width: 90%;
  border-radius: 3px;
  border-color: ${({ theme }) => theme.border};
`

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media ${deviceSizes.tablet} {
    flex-direction: row;
  }
`

const LogoImg = styled.img`
  width: 50px;
  margin-bottom: 15px;

  @media ${deviceSizes.tablet} {
    width: 100px;
  }
`

const TitleHeader = styled.h1`
  margin: 0;
  margin-left: 15px;
`

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`

const SettingsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 15px;
  margin-bottom: 8px;
  flex: 1;
`

// Set up a persisted state hook for for dark mode so users coming back
// will have dark mode automatically if they've selected it previously.
const useDarkModeState = createPersistedState('darkMode')

const Home = () => {
  const [fromVersion, setFromVersion] = useState<string>('')
  const [toVersion, setToVersion] = useState<string>('')
  const [shouldShowDiff, setShouldShowDiff] = useState<boolean>(false)
  const homepageUrl = process.env.PUBLIC_URL

  const handleShowDiff = ({
    fromVersion,
    toVersion,
  }: {
    fromVersion: string
    toVersion: string
  }) => {
    if (fromVersion === toVersion) {
      return
    }

    setFromVersion(fromVersion)
    setToVersion(toVersion)
    setShouldShowDiff(true)
  }

  const { defaultAlgorithm, darkAlgorithm } = theme // Get default and dark mode states from antd.
  const [isDarkMode, setIsDarkMode] = useDarkModeState(false) // Remembers dark mode state between sessions.
  const toggleDarkMode = () =>
    setIsDarkMode((previousValue: boolean) => !previousValue)
  useEffect(() => {
    // Set the document's background color to the theme's body color.
    document.body.style.backgroundColor = isDarkMode
      ? darkTheme.background
      : lightTheme.background
  }, [isDarkMode])

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <Page>
          <Container>
            <HeaderContainer>
              <TitleContainer>
                <LogoImg
                  alt="Scaffold-Stark Upgrade Helper logo"
                  title="Scaffold-Stark Upgrade Helper logo"
                  src={logo}
                />
                <a href={homepageUrl}>
                  <TitleHeader>Scaffold-Stark Upgrade Helper</TitleHeader>
                </a>
              </TitleContainer>

              <SettingsContainer>
                <DarkModeButton
                  isDarkMode={isDarkMode as boolean}
                  onClick={toggleDarkMode}
                />
              </SettingsContainer>
            </HeaderContainer>

            <VersionSelector showDiff={handleShowDiff} />
          </Container>
          <DiffViewer
            //@ts-ignore-next-line
            shouldShowDiff={shouldShowDiff}
            fromVersion={fromVersion}
            toVersion={toVersion}
            appName={''}
            appPackage={''}
            packageName={''}
            language={'cpp'}
          />
        </Page>
      </ThemeProvider>
    </ConfigProvider>
  )
}

export default Home
