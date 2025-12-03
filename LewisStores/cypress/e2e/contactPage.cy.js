/* eslint-disable no-undef */
describe("Contact Page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/");
  });
  it("Checks visibility of Contact Us Page", () => {
    cy.get("#contactNav").click();
    cy.get("#contactPageTopBanner").should("be.visible");
    cy.get("#contactPageMsgHeader").should("be.visible");
    cy.get("#name").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("html").should("be.visible");
    cy.get("#message").should("be.visible");
    cy.get("#sendMsg").should("be.visible");
  });
  it("Sends Message on Contact Page", () => {
    cy.get("#contactNav").click();
    cy.get("#name").type("Test User");
    cy.get("#email").type("test@gmail.com");
    cy.get("#selectBtn").click(); // open the dropdown
    cy.contains('[role="option"]', "General Inquiry").click();
    cy.get('#message').type('This is a Test')
    cy.get('#sendMsg').click()
  });
});
