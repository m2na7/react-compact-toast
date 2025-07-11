import { useToast } from './use-toast';

// Test component to use the hook
const TestComponent = ({
  toastId,
  autoClose = 3000,
  closeOnClick = true,
}: {
  toastId: string;
  autoClose?: false | number;
  closeOnClick?: boolean;
}) => {
  const { isExiting, handleAnimationEnd, handleClick } = useToast(
    toastId,
    autoClose,
    closeOnClick
  );

  return (
    <div data-testid="test-component">
      <div
        data-testid="toast-mock"
        className={`toast ${isExiting ? 'exiting' : ''}`}
        onClick={handleClick}
        onAnimationEnd={handleAnimationEnd}
      >
        Test Toast
      </div>
      <div data-testid="exit-status">
        {isExiting ? 'exiting' : 'not-exiting'}
      </div>
    </div>
  );
};

describe('useToast Hook', () => {
  it('should initialize with isExiting false', () => {
    cy.mount(
      <TestComponent
        toastId="test-toast-1"
        autoClose={false}
        closeOnClick={true}
      />
    );

    cy.get('[data-testid="exit-status"]').should('contain.text', 'not-exiting');
    cy.get('[data-testid="toast-mock"]').should('not.have.class', 'exiting');
  });

  it('should handle click when closeOnClick is true', () => {
    cy.mount(
      <TestComponent
        toastId="test-toast-2"
        autoClose={false}
        closeOnClick={true}
      />
    );

    cy.get('[data-testid="toast-mock"]').click();
    cy.get('[data-testid="exit-status"]').should('contain.text', 'exiting');
    cy.get('[data-testid="toast-mock"]').should('have.class', 'exiting');
  });

  it('should not handle click when closeOnClick is false', () => {
    cy.mount(
      <TestComponent
        toastId="test-toast-3"
        autoClose={false}
        closeOnClick={false}
      />
    );

    cy.get('[data-testid="toast-mock"]').click();
    cy.get('[data-testid="exit-status"]').should('contain.text', 'not-exiting');
    cy.get('[data-testid="toast-mock"]').should('not.have.class', 'exiting');
  });

  it('should auto close after specified duration', () => {
    cy.mount(
      <TestComponent
        toastId="test-toast-4"
        autoClose={1000}
        closeOnClick={false}
      />
    );

    cy.get('[data-testid="exit-status"]').should('contain.text', 'not-exiting');

    // Wait for auto close
    cy.wait(1100);
    cy.get('[data-testid="exit-status"]').should('contain.text', 'exiting');
  });

  it('should not auto close when autoClose is false', () => {
    cy.mount(
      <TestComponent
        toastId="test-toast-5"
        autoClose={false}
        closeOnClick={false}
      />
    );

    cy.get('[data-testid="exit-status"]').should('contain.text', 'not-exiting');

    // Wait and check it's still not exiting
    cy.wait(2000);
    cy.get('[data-testid="exit-status"]').should('contain.text', 'not-exiting');
  });

  it('should handle animation end event', () => {
    cy.mount(
      <TestComponent
        toastId="test-toast-6"
        autoClose={false}
        closeOnClick={true}
      />
    );

    // Click to trigger exit
    cy.get('[data-testid="toast-mock"]').click();
    cy.get('[data-testid="exit-status"]').should('contain.text', 'exiting');

    // Trigger animation end
    cy.get('[data-testid="toast-mock"]').trigger('animationend');

    // Component should still be there but in exiting state
    cy.get('[data-testid="exit-status"]').should('contain.text', 'exiting');
  });
});
