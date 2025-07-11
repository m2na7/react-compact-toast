import Toast from './toast';
import { ToastProps } from '../core/types';

describe('Toast Component', () => {
  const defaultProps: ToastProps = {
    toastId: 'test-toast-1',
    text: 'Test toast message',
    autoClose: false,
    closeOnClick: true,
    position: 'topCenter',
  };

  it('should render toast with basic message', () => {
    cy.mount(<Toast {...defaultProps} />);

    cy.get('.toast').should('be.visible');
    cy.get('.toast-text').should('contain.text', 'Test toast message');
  });

  it('should render toast with highlight text', () => {
    const propsWithHighlight: ToastProps = {
      ...defaultProps,
      highlightText: 'Important: ',
      highlightColor: '#ff0000',
    };

    cy.mount(<Toast {...propsWithHighlight} />);

    cy.get('.toast-highlight-text')
      .should('be.visible')
      .should('contain.text', 'Important: ')
      .should('have.css', 'color', 'rgb(255, 0, 0)');
  });

  it('should render toast with icon', () => {
    const propsWithIcon: ToastProps = {
      ...defaultProps,
      icon: 'default',
    };

    cy.mount(<Toast {...propsWithIcon} />);

    cy.get('.toast-content').should('be.visible');
    cy.get('.toast-text').should('contain.text', 'Test toast message');
  });

  it('should handle click when closeOnClick is true', () => {
    cy.mount(<Toast {...defaultProps} closeOnClick={true} />);

    cy.get('.toast').should('be.visible');
    cy.get('.toast').click();
    // Toast should start exit animation
    cy.get('.toast').should('have.class', 'toast-exit-top');
  });

  it('should not close on click when closeOnClick is false', () => {
    cy.mount(<Toast {...defaultProps} closeOnClick={false} />);

    cy.get('.toast').should('be.visible');
    cy.get('.toast').click();
    // Toast should not have exit class
    cy.get('.toast').should('not.have.class', 'toast-exit-top');
  });

  it('should apply custom className', () => {
    const propsWithClass: ToastProps = {
      ...defaultProps,
      className: 'custom-toast-class',
    };

    cy.mount(<Toast {...propsWithClass} />);

    cy.get('.toast')
      .should('be.visible')
      .should('have.class', 'custom-toast-class');
  });

  it('should apply correct position classes', () => {
    const topProps: ToastProps = {
      ...defaultProps,
      position: 'topCenter',
    };

    cy.mount(<Toast {...topProps} />);

    cy.get('.toast')
      .should('have.class', 'toast-top-position')
      .should('have.class', 'toast-enter-top');
  });

  it('should apply bottom position classes', () => {
    const bottomProps: ToastProps = {
      ...defaultProps,
      position: 'bottomCenter',
    };

    cy.mount(<Toast {...bottomProps} />);

    cy.get('.toast')
      .should('not.have.class', 'toast-top-position')
      .should('have.class', 'toast-enter-bottom');
  });

  it('should auto close after specified duration', () => {
    const autoCloseProps: ToastProps = {
      ...defaultProps,
      autoClose: 1000, // 1 second
    };

    cy.mount(<Toast {...autoCloseProps} />);

    cy.get('.toast').should('be.visible');

    // Wait for auto close animation to start
    cy.wait(1100);
    cy.get('.toast').should('have.class', 'toast-exit-top');
  });

  it('should render with different position variants', () => {
    const positions: Array<ToastProps['position']> = [
      'topLeft',
      'topRight',
      'bottomLeft',
      'bottomRight',
    ];

    positions.forEach((position) => {
      const positionProps: ToastProps = {
        ...defaultProps,
        position,
      };

      cy.mount(<Toast {...positionProps} />);

      if (position?.startsWith('top')) {
        cy.get('.toast')
          .should('have.class', 'toast-top-position')
          .should('have.class', 'toast-enter-top');
      } else {
        cy.get('.toast')
          .should('not.have.class', 'toast-top-position')
          .should('have.class', 'toast-enter-bottom');
      }
    });
  });

  it('should render with undefined icon', () => {
    const propsWithUndefinedIcon: ToastProps = {
      ...defaultProps,
      icon: undefined,
    };

    cy.mount(<Toast {...propsWithUndefinedIcon} />);

    cy.get('.toast-content').should('be.visible');
    cy.get('.toast-text').should('contain.text', 'Test toast message');
  });

  it('should render with custom icon', () => {
    const propsWithCustomIcon: ToastProps = {
      ...defaultProps,
      icon: '🚀',
    };

    cy.mount(<Toast {...propsWithCustomIcon} />);

    cy.get('.toast-content').should('be.visible');
    cy.get('.toast-text').should('contain.text', 'Test toast message');
  });

  it('should render without highlight text', () => {
    const propsWithoutHighlight: ToastProps = {
      ...defaultProps,
      highlightText: undefined,
    };

    cy.mount(<Toast {...propsWithoutHighlight} />);

    cy.get('.toast-text').should('contain.text', 'Test toast message');
    cy.get('.toast-highlight-text').should('be.empty');
  });

  it('should render with highlight text but no color', () => {
    const propsWithHighlightNoColor: ToastProps = {
      ...defaultProps,
      highlightText: 'Warning: ',
      highlightColor: undefined,
    };

    cy.mount(<Toast {...propsWithHighlightNoColor} />);

    cy.get('.toast-highlight-text')
      .should('be.visible')
      .should('contain.text', 'Warning: ')
      .should('not.have.attr', 'style');
  });

  it('should apply default styles when no custom className is provided', () => {
    const propsWithoutClassName: ToastProps = {
      ...defaultProps,
      className: undefined,
    };

    cy.mount(<Toast {...propsWithoutClassName} />);

    cy.get('.toast')
      .should('have.class', 'toast-default-style')
      .should('have.class', 'toast-default-size');
  });

  it('should not apply default styles when custom className is provided', () => {
    const propsWithClassName: ToastProps = {
      ...defaultProps,
      className: 'custom-toast',
    };

    cy.mount(<Toast {...propsWithClassName} />);

    cy.get('.toast')
      .should('have.class', 'custom-toast')
      .should('not.have.class', 'toast-default-style')
      .should('not.have.class', 'toast-default-size');
  });

  it('should handle animation end event', () => {
    cy.mount(<Toast {...defaultProps} />);

    cy.get('.toast').should('be.visible');

    // Trigger animation end event
    cy.get('.toast').trigger('animationend');

    // Toast should still be visible after animation end
    cy.get('.toast').should('be.visible');
  });

  it('should handle empty text gracefully', () => {
    const propsWithEmptyText: ToastProps = {
      ...defaultProps,
      text: '',
    };

    cy.mount(<Toast {...propsWithEmptyText} />);

    cy.get('.toast').should('be.visible');
    cy.get('.toast-text').should('exist');
  });

  it('should handle very long text', () => {
    const longText =
      'This is a very long toast message that should still render properly even when it contains a lot of text content that might wrap to multiple lines';

    const propsWithLongText: ToastProps = {
      ...defaultProps,
      text: longText,
    };

    cy.mount(<Toast {...propsWithLongText} />);

    cy.get('.toast').should('be.visible');
    cy.get('.toast-text').should('contain.text', longText);
  });

  it('should handle multiple class combinations', () => {
    const propsWithMultipleClasses: ToastProps = {
      ...defaultProps,
      className: 'custom-toast another-class',
      position: 'bottomRight',
    };

    cy.mount(<Toast {...propsWithMultipleClasses} />);

    cy.get('.toast')
      .should('have.class', 'custom-toast')
      .should('have.class', 'another-class')
      .should('have.class', 'toast-enter-bottom');
  });

  it('should handle click and animation end sequence', () => {
    cy.mount(<Toast {...defaultProps} closeOnClick={true} />);

    cy.get('.toast').should('be.visible');

    // Click to start exit animation
    cy.get('.toast').click();
    cy.get('.toast').should('have.class', 'toast-exit-top');

    // Trigger animation end
    cy.get('.toast').trigger('animationend');

    // Toast should still exist (component handles the cleanup)
    cy.get('.toast').should('exist');
  });

  it('should handle autoClose with bottom position', () => {
    const autoCloseBottomProps: ToastProps = {
      ...defaultProps,
      autoClose: 500,
      position: 'bottomCenter',
    };

    cy.mount(<Toast {...autoCloseBottomProps} />);

    cy.get('.toast').should('be.visible');
    cy.get('.toast').should('have.class', 'toast-enter-bottom');

    // Wait for auto close
    cy.wait(600);
    cy.get('.toast').should('have.class', 'toast-exit-bottom');
  });
});
