/* eslint-disable no-undef */
describe("Purchasing a Product and checks visibilty during this process", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/");
    cy.intercept("GET", "/api/auth/profile-picture/*", {
      statusCode: 200,
      body: "",
    });
  });
  it("Purchases a product", () => {
    //Signing in customer account
    cy.get("#loginButton").should("be.visible").click();
    cy.get("#email")
      .should("be.visible")
      .type("tashreeq.voigt@redacademy.co.za");
    cy.get("#password").should("be.visible").type("Tashreeq11#!");
    cy.get("#submitLogin").should("be.visible").click();
    cy.wait(1000);

    //Navigate to product page a purchase a product
    cy.get("#productsNavbar").click();

    cy.get(
      "#root div:nth-child(1) > div.space-y-2 > a > button.w-full"
    ).click();
    cy.get("#root button.w-full").click();
    cy.wait(1000);
    cy.get('#root a[href="/customer/cart"] svg.lucide').click();
    cy.get("#root div.gap-4").should("be.visible");
    cy.get("#root div.text-center").should("be.visible");
    cy.get("#root div.min-h-screen").should("be.visible");
    cy.get('#root a[href="/customer/checkout"] button.w-full').click();
    cy.get("#root div.h-fit div.grid").should("be.visible");
    cy.get("#root div.shadow-md").should("be.visible");
    cy.get('#root input[placeholder="Full Name"]').type("Tashreeq Voigt");
    cy.get('#root input[placeholder="Address Line 1"]').type("33 Albatross Rd");
    cy.get('#root input[placeholder="City"]').type("Cape Town");
    cy.get('#root input[placeholder="Postal Code"]').type("7785");
    cy.get("#terms").click().should("be.visible");
    cy.get("#root button.w-full").click();

    //Checks the tracking page
    cy.get('#root a[href="/customer/orders/manage"] span.font-medium').click();
    cy.get("#root tr:nth-child(1) td.text-right svg.lucide").click();
    cy.get("#root div.overflow-hidden").should("be.visible");
    cy.get("#root div.md\\:grid-cols-2 > div:nth-child(1)").should(
      "be.visible"
    );
    cy.get("#root div.md\\:grid-cols-2 > div:nth-child(2)").should(
      "be.visible"
    );
    cy.get("#root div.sticky").should("be.visible");
  });
});
