import ToastContainer from './toast-container';

describe('ToastContainer Component', () => {
  it('should render empty container initially', () => {
    cy.mount(<ToastContainer />);

    cy.get('.toast-container').should('not.exist');
  });

  it('should render component without errors', () => {
    cy.mount(<ToastContainer />);

    cy.get('body').should('exist');
  });
});
