import './commands';
import { mount } from 'cypress/react';
import '@cypress/code-coverage/support';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);

import '../../src/styles.css';
