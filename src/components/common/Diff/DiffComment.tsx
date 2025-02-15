import React, { useState } from 'react'
import styled from '@emotion/styled'
import { HTMLMotionProps, motion } from 'framer-motion'
import Markdown from '../Markdown'
import type { Theme } from '../../../theme'
import type { LineChangeT } from '../../../releases/types'

interface ContainerProps
  extends React.PropsWithChildren<HTMLMotionProps<'div'>> {
  isCommentOpen: boolean
  lineChangeType: LineChangeT
  theme?: Theme
}

const Container = styled(
  ({ isCommentOpen, children, ...props }: ContainerProps) => {
    return (
      <motion.div
        {...props}
        variants={{
          open: {
            height: 'auto',
          },
          hidden: { height: 10 },
        }}
        initial={isCommentOpen ? 'open' : 'hidden'}
        animate={isCommentOpen ? 'open' : 'hidden'}
        transition={{
          duration: 0.5,
        }}
        inherit={false}
      >
        <div>{children}</div>
      </motion.div>
    )
  }
)`
  overflow: hidden;

  & > div {
    display: flex;
    flex-direction: row;
    background-color: ${({ lineChangeType, theme }) => {
      const colorMap = {
        add: theme.diff.codeInsertBackground,
        delete: theme.diff.codeDeleteBackground,
        neutral: undefined,
      }

      return colorMap[lineChangeType] || theme.background
    }};
    cursor: pointer;
  }
`

interface ContentContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: Theme
}
const ContentContainer = styled.div<ContentContainerProps>`
  flex: 1;
  position: relative;
  padding: 16px;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.yellowBackground};}
  user-select: none;
`

interface ShowButtonProps extends HTMLMotionProps<'div'> {
  isCommentOpen: boolean
  theme?: Theme
}

const ShowButton = styled(({ isCommentOpen, ...props }: ShowButtonProps) => (
  <motion.div
    {...props}
    variants={{
      open: {
        scaleX: 1,
      },
      hidden: { scaleX: 10 },
    }}
    whileHover={{
      scale: 2,
    }}
    initial={isCommentOpen ? 'open' : 'hidden'}
    animate={isCommentOpen ? 'open' : 'hidden'}
    transition={{
      duration: 0.25,
    }}
  />
))`
  background-color: ${({ theme }) => theme.yellowBorder};
  margin-left: 20px;
  width: 10px;
  cursor: pointer;
`

const Content = styled(Markdown)`
  opacity: 1;
  ${({ isCommentOpen }) =>
    !isCommentOpen &&
    `
      opacity: 0;
    `}
  transition: opacity 0.25s ease-out;
`

const DiffComment = ({
  content,
  lineChangeType,
}: {
  content: any
  lineChangeType: LineChangeT
}) => {
  const [isCommentOpen, setIsCommentOpen] = useState<boolean>(true)

  return (
    <Container
      isCommentOpen={isCommentOpen}
      lineChangeType={lineChangeType}
      onClick={() => setIsCommentOpen(!isCommentOpen)}
    >
      <ShowButton
        isCommentOpen={isCommentOpen}
        onClick={() => setIsCommentOpen(!isCommentOpen)}
      />

      <ContentContainer>
        <Content isCommentOpen={isCommentOpen}>
          {content.props.children}
        </Content>
      </ContentContainer>
    </Container>
  )
}

export default DiffComment
