/**
 * @file Dialog UI Component
 */
import React, { HTMLAttributes } from 'react'
import { View } from 'remax/one'
import cls from 'classnames'

import Mask from '../../components/Mask'

import styles from './style.less'

export type Props = HTMLAttributes<HTMLElement> & {
  closeText: string
  open?: boolean
  mask?: boolean
  coverTopNav?: boolean
  onClose?: () => void
}

export default function Dialog({
  closeText,
  open = false,
  mask = true,
  coverTopNav = false,
  className,
  children,
  onClose
}: Props) {
  const handleMaskTap = () => {
    if (onClose) onClose()
  }

  function renderMain() {
    const classes = cls(styles.main, open && styles.active, className)

    return (
      <View className={classes}>
        <View className={styles.content}>
          {children}
        </View>
        <View onTap={handleMaskTap} className={styles.closeText}>{closeText}</View>
      </View>
    )
  }

  if (!mask) {
    return renderMain()
  }

  return (
    <Mask withBg coverTopNav={coverTopNav} show={open} onTap={handleMaskTap}>
      {renderMain()}
    </Mask>
  )
}
