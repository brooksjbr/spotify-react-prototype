import Box from '../../Box'

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
      {children}
    </Box>
  )
}

export default DashboardLayout
