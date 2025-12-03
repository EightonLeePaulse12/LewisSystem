/* eslint-disable no-undef */
describe("Login Form", () => {
  beforeEach(() => {
     cy.intercept("GET", "/api/auth/profile-picture/*", {
        statusCode: 200,
        body: "",
      });
    
    cy.visit("http://localhost:5173/");
  });
  it("Checks visibility of login form", () => {
    cy.get("#loginButton").click();
    cy.get("#lockIcon").should("be.visible");
    cy.get("#loginTitle").should("be.visible");
    cy.get("#loginDescription").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("#forgotPasswordLink").should("be.visible");
    cy.get("#showPasswordToggle").should("be.visible");
    cy.get("#submitLogin").should("be.visible");
    cy.get("#signUpPrompt").should("be.visible");
    cy.get("#signUpLink").should("be.visible");
  });
  it("Login in user", () => {
    cy.get("#loginButton").click();
    cy.get("#email").type("test@gmail.com");
    cy.get("#password").type("RegisterTest12!");
    cy.get("#submitLogin").click()
    cy.wait(2000)
  });
});
