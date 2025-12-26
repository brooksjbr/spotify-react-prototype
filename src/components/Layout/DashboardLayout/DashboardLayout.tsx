import React from 'react'

import Box from '@/components/Box'

import styles from './DashboardLayout.module.css'

interface DashboardLayoutProps {
    title: string
    children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    title,
    children,
}) => {
    return (
        <Box>
            <h1 className={styles.h1}>{title}</h1>
            <div className={styles.content}>{children}</div>
        </Box>
    )
}

export default DashboardLayout
