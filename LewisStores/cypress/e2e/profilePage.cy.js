/* eslint-disable no-undef */
describe("Profile Page", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/auth/profile-picture/*", {
      statusCode: 200,
      body: "",
    });
    cy.visit("http://localhost:5173/");
  });
it("Checks the profile page", () => {
    cy.get("#loginButton").click();
    cy.get("#email").type("tashreeq.voigt@redacademy.co.za");
    cy.get("#password").type("Tashreeq11#!");
    cy.get("#submitLogin").click()
    cy.wait(2000)
    cy.get('#root svg.lucide-user').click();
    cy.get('#root div.flex-col.gap-2').should('be.visible'). should('contain.text', 'Account Settings', 'Manage your account profile, contact information, and view your order history.')
    cy.get('#root div.h-full').should('be.visible')
    cy.get('#root div.absolute').click();
    cy.go('back')
  });
});
