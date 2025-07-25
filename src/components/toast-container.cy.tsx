import ToastContainer from './toast-container';
import { toast } from '../core/toast';

describe('ToastContainer Component', () => {
  beforeEach(() => {
    // Clear any existing toasts before each test
    cy.window().then((win) => {
      // @ts-ignore
      if (win.toastManager) {
        // @ts-ignore
        win.toastManager.clear();
      }
    });
  });

  it('should render empty container initially', () => {
    cy.mount(<ToastContainer />);

    cy.get('.toast-container').should('not.exist');
  });

  it('should render component without errors', () => {
    cy.mount(<ToastContainer />);

    cy.get('body').should('exist');
  });

  it('should apply offset to top position containers', () => {
    cy.mount(
      <div>
        <ToastContainer />
        <button
          onClick={() =>
            toast({
              text: 'Top toast with offset',
              position: 'topCenter',
              offset: 100,
              autoClose: false,
            })
          }
        >
          Show Toast
        </button>
      </div>
    );

    cy.get('button').click();
    cy.get('.toast-container.toast-position-topCenter')
      .should('exist')
      .should('have.css', 'top', '100px');
  });

  it('should apply offset to bottom position containers', () => {
    cy.mount(
      <div>
        <ToastContainer />
        <button
          onClick={() =>
            toast({
              text: 'Bottom toast with offset',
              position: 'bottomCenter',
              offset: '50px',
              autoClose: false,
            })
          }
        >
          Show Toast
        </button>
      </div>
    );

    cy.get('button').click();
    cy.get('.toast-container.toast-position-bottomCenter')
      .should('exist')
      .should('have.css', 'bottom', '50px');
  });

  it('should handle multiple toasts with same offset', () => {
    cy.mount(
      <div>
        <ToastContainer />
        <button
          onClick={() => {
            toast({
              text: 'First toast',
              position: 'topRight',
              offset: 80,
              autoClose: false,
            });
            toast({
              text: 'Second toast',
              position: 'topRight',
              offset: 80,
              autoClose: false,
            });
          }}
        >
          Show Toasts
        </button>
      </div>
    );

    cy.get('button').click();
    cy.get('.toast-container.toast-position-topRight')
      .should('exist')
      .should('have.css', 'top', '80px');
    cy.get('.toast').should('have.length', 2);
  });

  it('should use default position when no offset provided', () => {
    cy.mount(
      <div>
        <ToastContainer />
        <button
          onClick={() =>
            toast({
              text: 'Default position toast',
              position: 'topCenter',
              autoClose: false,
            })
          }
        >
          Show Toast
        </button>
      </div>
    );

    cy.get('button').click();
    cy.get('.toast-container.toast-position-topCenter')
      .should('exist')
      .should('have.css', 'top', '30px'); // CSS default value
  });

  it('should handle different CSS units for offset', () => {
    cy.mount(
      <div>
        <ToastContainer />
        <button
          onClick={() =>
            toast({
              text: 'Toast with rem unit',
              position: 'topLeft',
              offset: '2rem',
              autoClose: false,
            })
          }
        >
          2rem
        </button>
      </div>
    );

    cy.get('button').click();
    cy.get('.toast-container.toast-position-topLeft')
      .should('exist')
      .should('have.attr', 'style')
      .and('include', 'top: 2rem');
  });
});
