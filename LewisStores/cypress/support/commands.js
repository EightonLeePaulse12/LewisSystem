/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add("loginAsAdmin", () => {
  cy.session("userSession", () => {
    cy.intercept("GET", "/api/auth/profile-picture/*", {
      statusCode: 200,
      body: "",
    });

    cy.visit("http://localhost:5173/");
    cy.get("#loginButton").click();
    cy.get("#email").type("tashreeqvoigt07@gmail.com");
    cy.get("#password").type("Tashreeq11#!");
    cy.get("#submitLogin").click();
    cy.url().should("not.include", "/login");
  });
});

Cypress.Commands.add("openOrdersPage", () => {
  cy.visit("http://localhost:5173/admin/");
  cy.get('#root a[href="/admin/manage/orders"] span.w-auto').click();
});

Cypress.Commands.add("openRowStatusDropdown", ($row) => {
  cy.wrap($row).find(".w-40").first().click({ force: true });
});
