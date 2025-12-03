/* eslint-disable no-undef */
describe("Login Form", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/");
  });
  it("Checks visibility of registration form", () => {
    cy.get("#registerButton").click();
    cy.get("#createAccountIcon").should("be.visible");
    cy.get("#createAccountTitle").should("be.visible");
    cy.get("#createAccountDescription").should("be.visible");
    cy.get('#personalInfoHeader').should('be.visible')
    cy.get("#name").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#phone").should("be.visible");
    cy.get("#idNumber").should("be.visible");
    cy.get('#addressInfoHeader').should('be.visible')
    cy.get("#address").should("be.visible");
    cy.get("#city").should("be.visible");
    cy.get("#postalCode").should("be.visible");
    cy.get('#securtiyInfoHeader').should('be.visible')
    cy.get("#password").should("be.visible");
    cy.get("#confirmPassword").should("be.visible");
    cy.get('#show1PassRegister').should('be.visible')
    cy.get('#showConfirmPassRegister').should('be.visible')
    cy.get("#submitRegister").should("be.visible");
    cy.get('#signInLink').should('be.visible')
  });
  it("Registers a new user successfully", () => {
    cy.get("#registerButton").click();
    cy.get("#name").type("Test User");
    cy.get("#email").type("test@gmail.com");
    cy.get("#phone").type("1234567890");
    cy.get("#idNumber").type("1234567890123");
    cy.get("#address").type("123 Test St");
    cy.get("#city").type("Cypress City");
    cy.get("#postalCode").type("1234");
    cy.get("#password").type("RegisterTest12!");
    cy.get("#confirmPassword").type("RegisterTest12!");
    cy.get("#submitRegister").click();
    cy.wait(2000)
  });
});
