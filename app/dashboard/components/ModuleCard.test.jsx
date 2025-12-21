/**
 * Property Tests for ModuleCard Component
 * Feature: gold-forex-intelligence-dashboard, Property 19: Module Collapse Toggle
 * Validates: Requirements 11.3
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import ModuleCard from './ModuleCard';

describe('ModuleCard Component', () => {
  describe('Property 19: Module Collapse Toggle', () => {
    /**
     * Property: For any collapsible module, toggling the collapse state must invert
     * the collapsed boolean and change the module's content visibility accordingly.
     */
    it('should toggle collapsed state and content visibility on button click', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z]/.test(s)),
            title: fc.string({ minLength: 1, maxLength: 50 }),
            defaultCollapsed: fc.boolean(),
          }),
          ({ id, title, defaultCollapsed }) => {
            const testContent = 'Test Content';
            
            const { rerender } = render(
              <ModuleCard 
                id={id} 
                title={title} 
                defaultCollapsed={defaultCollapsed}
              >
                <div data-testid="module-content">{testContent}</div>
              </ModuleCard>
            );

            // Check initial state
            const initialContentVisible = screen.queryByTestId('module-content') !== null;
            expect(initialContentVisible).toBe(!defaultCollapsed);

            // Find and click the collapse button
            const collapseButton = screen.getByRole('button', { name: /collapse|expand/i });
            fireEvent.click(collapseButton);

            // After toggle, content visibility should be inverted
            const afterToggleContentVisible = screen.queryByTestId('module-content') !== null;
            expect(afterToggleContentVisible).toBe(defaultCollapsed);

            // Toggle again to verify it returns to original state
            fireEvent.click(collapseButton);
            const afterSecondToggleContentVisible = screen.queryByTestId('module-content') !== null;
            expect(afterSecondToggleContentVisible).toBe(!defaultCollapsed);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Toggling twice should return to the original state (idempotence of double toggle)
     */
    it('should return to original state after double toggle', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (initialCollapsed) => {
            render(
              <ModuleCard 
                id="test-module" 
                title="Test Module" 
                defaultCollapsed={initialCollapsed}
              >
                <div data-testid="content">Content</div>
              </ModuleCard>
            );

            const initialState = screen.queryByTestId('content') !== null;
            const collapseButton = screen.getByRole('button', { name: /collapse|expand/i });

            // Toggle twice
            fireEvent.click(collapseButton);
            fireEvent.click(collapseButton);

            const finalState = screen.queryByTestId('content') !== null;
            expect(finalState).toBe(initialState);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: aria-expanded attribute should correctly reflect the collapsed state
     */
    it('should have correct aria-expanded attribute', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (defaultCollapsed) => {
            render(
              <ModuleCard 
                id="aria-test" 
                title="Aria Test" 
                defaultCollapsed={defaultCollapsed}
              >
                <div>Content</div>
              </ModuleCard>
            );

            const collapseButton = screen.getByRole('button', { name: /collapse|expand/i });
            
            // Initial aria-expanded should be opposite of collapsed
            expect(collapseButton.getAttribute('aria-expanded')).toBe(String(!defaultCollapsed));

            // After toggle
            fireEvent.click(collapseButton);
            expect(collapseButton.getAttribute('aria-expanded')).toBe(String(defaultCollapsed));
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should render title correctly', () => {
      render(
        <ModuleCard id="test" title="Test Title">
          <div>Content</div>
        </ModuleCard>
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      render(
        <ModuleCard id="test" title="Test" icon="🧠">
          <div>Content</div>
        </ModuleCard>
      );
      expect(screen.getByText('🧠')).toBeInTheDocument();
    });

    it('should render badge when provided', () => {
      render(
        <ModuleCard 
          id="test" 
          title="Test" 
          badge={<span data-testid="badge">Badge</span>}
        >
          <div>Content</div>
        </ModuleCard>
      );
      expect(screen.getByTestId('badge')).toBeInTheDocument();
    });

    it('should show update time when provided', () => {
      render(
        <ModuleCard id="test" title="Test" updateTime="12:30">
          <div>Content</div>
        </ModuleCard>
      );
      expect(screen.getByText(/12:30/)).toBeInTheDocument();
    });

    it('should call onRefresh when refresh button is clicked', () => {
      const onRefresh = vi.fn();
      render(
        <ModuleCard id="test" title="Test" onRefresh={onRefresh}>
          <div>Content</div>
        </ModuleCard>
      );
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it('should start collapsed when defaultCollapsed is true', () => {
      render(
        <ModuleCard id="test" title="Test" defaultCollapsed={true}>
          <div data-testid="content">Content</div>
        </ModuleCard>
      );
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('should start expanded when defaultCollapsed is false', () => {
      render(
        <ModuleCard id="test" title="Test" defaultCollapsed={false}>
          <div data-testid="content">Content</div>
        </ModuleCard>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });
});
