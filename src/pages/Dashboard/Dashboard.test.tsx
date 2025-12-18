import { render, screen } from '@testing-library/react'

import Dashboard from './index'

describe('Dashboard Component', () => {
  test('renders dashboard text', () => {
    render(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
