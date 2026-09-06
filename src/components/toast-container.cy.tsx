import { ToastContainer } from './toast-container';
import { toast } from '../core/toast';

/**
 * Browser-only behaviour: real CSS animations, layout, pointer-events and
 * focus. Everything that jsdom can answer lives in the vitest suites.
 */
describe('toasts in a real browser', () => {
  beforeEach(() => {
    toast.remove();
  });

  it('plays the exit animation before the toast leaves the DOM', () => {
    cy.mount(<ToastContainer />);
    cy.then(() => toast('Bye', { autoClose: false }));

    cy.get('[data-rct-toast]').should(
      'have.attr',
      'data-rct-state',
      'entering'
    );
    cy.get('[data-rct-toast]').click();
    cy.get('[data-rct-toast]').should('have.attr', 'data-rct-state', 'exiting');
    cy.get('[data-rct-toast]').should('not.exist');
  });

  it('lets clicks through everywhere except the toast itself', () => {
    const onBackgroundClick = cy.stub().as('background');
    cy.mount(
      <div>
        <button
          style={{ position: 'fixed', inset: 0, width: '100%' }}
          onClick={onBackgroundClick}
        >
          background
        </button>
        <ToastContainer />
      </div>
    );
    cy.then(() => toast('Hi', { position: 'bottomCenter', autoClose: false }));

    // A point in the group's band, next to the toast, reaches the background.
    cy.get('[data-rct-container]').then((elements) => {
      const box = elements[0]!.getBoundingClientRect();
      cy.document().then((document) => {
        const element = document.elementFromPoint(5, box.top + box.height / 2);
        expect(element?.closest('[data-rct-container]')).to.equal(null);
      });
    });

    cy.get('[data-rct-toast]').click();
    cy.get('@background').should('not.have.been.called');
  });

  it('never makes the page scroll sideways', () => {
    cy.mount(<ToastContainer />);
    (
      ['topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'topCenter'] as const
    ).forEach((position) => {
      cy.then(() => toast(`at ${position}`, { position, autoClose: false }));
    });

    cy.get('[data-rct-toast]').should('have.length', 5);
    cy.document().then((document) => {
      const { scrollWidth, clientWidth } = document.documentElement;
      expect(scrollWidth).to.be.at.most(clientWidth);
    });
  });

  it('keeps the built-in layout when a className is given', () => {
    cy.mount(<ToastContainer />);
    cy.then(() =>
      toast('Styled by me', { className: 'custom', autoClose: false })
    );

    cy.get('[data-rct-toast]')
      .should('have.css', 'display', 'flex')
      .and('have.css', 'min-width', '280px')
      .and('not.have.css', 'background-color', 'rgb(40, 40, 40)');
  });

  it('drops every built-in rule when unstyled', () => {
    cy.mount(<ToastContainer />);
    cy.then(() => toast('Bare', { unstyled: true, autoClose: false }));

    cy.get('[data-rct-toast]')
      .should('have.css', 'display', 'block')
      .and('have.css', 'min-width', 'auto')
      .and('have.css', 'box-shadow', 'none');
  });

  it('skips injection when the stylesheet is already loaded', () => {
    // cypress/support/component.ts imports the stylesheet, so the runtime
    // marker (`--rct-css` on :root) should make the injector stand down.
    cy.mount(<ToastContainer />);
    cy.then(() => toast('Styled by the imported sheet', { autoClose: false }));

    cy.get('[data-rct-toast]').should(
      'have.css',
      'background-color',
      'rgb(40, 40, 40)'
    );
    cy.document().then((document) => {
      expect(
        document.querySelectorAll('style[data-rct-styles]')
      ).to.have.length(0);
    });
  });

  it('honours theme custom properties', () => {
    cy.mount(
      <div style={{ '--rct-bg': 'rgb(0, 128, 0)' } as React.CSSProperties}>
        <ToastContainer />
      </div>
    );
    cy.then(() => toast('Themed', { autoClose: false }));

    cy.get('[data-rct-toast]').should(
      'have.css',
      'background-color',
      'rgb(0, 128, 0)'
    );
  });

  it('pauses the timer while the pointer rests on the toast', () => {
    cy.clock();
    cy.mount(<ToastContainer />);
    cy.then(() => toast('Read me', { autoClose: 1000 }));

    cy.get('[data-rct-toast]').trigger('mouseenter');
    cy.tick(5000);
    cy.get('[data-rct-toast]').should('exist');

    cy.get('[data-rct-toast]').trigger('mouseleave');
    cy.tick(1000);
    cy.get('[data-rct-toast]').should('not.exist');
  });

  it('is operable with the keyboard alone', () => {
    cy.mount(<ToastContainer />);
    cy.then(() =>
      toast('Update available', {
        autoClose: false,
        closeOnClick: false,
        closeButton: true,
      })
    );

    cy.get('[data-rct-close]').focus().should('have.focus');
    cy.focused().type('{esc}');
    cy.get('[data-rct-toast]').should('not.exist');
  });

  it('moves focus out of a toast that disappears', () => {
    cy.mount(
      <div>
        <button id="before">before</button>
        <ToastContainer />
      </div>
    );
    cy.then(() => toast('Focus me', { autoClose: false }));

    cy.get('#before').focus();
    cy.get('[data-rct-toast]').focus().click();
    cy.get('[data-rct-toast]').should('not.exist');
    cy.focused().should('have.id', 'before');
  });
});
