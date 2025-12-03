/* eslint-disable no-undef */
describe("Product Page", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/auth/profile-picture/*", {
      statusCode: 200,
      body: "",
    });
    cy.visit("http://localhost:5173/");
  });
  it("Checks the product page visibility", () => {
    cy.get("#loginButton").click();
    cy.get("#email").type("jambrood69@gmail.com");
    cy.get("#password").type("Ultrainstinct12_");
    cy.get("#submitLogin").click();
    cy.wait(2000);
    cy.get("#shopNowTopHomePageBtn").click(); //Navigates to the product page
    cy.wait(1000);
    cy.get("#productCatalogTitle, #productCatalogSubtitle").should(
      "be.visible"
    );
    cy.get("#filterMobileButton, #filterButton, #filtersTitle").should(
      "be.visible"
    );
    cy.get(
      '#search, #html, #root input[placeholder="Min"], #root input[placeholder="Max"]'
    ).should("be.visible");
    cy.get("#root div.gap-4 > div:nth-child(1)").should("be.visible");
    cy.get("#root div.gap-4 > div:nth-child(2)").should("be.visible");
    cy.get("#root div.gap-4 > div:nth-child(3)").should("be.visible");
    cy.get("#root div.gap-4 div:nth-child(4)").should("be.visible");
    cy.get("#root div.gap-4 div:nth-child(5)").should("be.visible");
    cy.get("#root div.gap-4 div:nth-child(6)").should("be.visible");
    cy.get("#root div.gap-4 div:nth-child(7)").should("be.visible");
    cy.get("#root div.gap-4 div:nth-child(8)").should("be.visible");
    cy.wait(2000);
    cy.get(
      "#root div.flex.mt-8, #root div.gap-1 button.border, root div.flex.mt-8 > button:nth-child(1), #root div.flex.mt-8 button:nth-child(3)"
    ).should("be.visible");
    cy.get("#root div.gap-1 button.border").click(); //Navigates to next page
    cy.get("#root div.gap-4 > div:nth-child(1)").should("be.visible");
    cy.get("#root div.gap-4 > div:nth-child(2)").should("be.visible");

    cy.wait(2000);
    cy.get("#homePageBottomFooter").should("be.visible");
  });
});
