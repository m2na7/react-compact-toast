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
});
