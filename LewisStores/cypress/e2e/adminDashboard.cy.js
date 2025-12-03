/* eslint-disable no-undef */
describe("Admin Dashboard", () => {
  beforeEach(() => {
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

      // confirm login worked
      cy.url().should("not.include", "/login");
    });

    cy.visit("http://localhost:5173/admin");
  });

  it("Checks the admin sidebar visibility", () => {
    cy.get(
      '#adminSidebar, #adminSidebarTitle, #adminSidebarEst, #root path[d="M4 19h16"], #root a[href="/admin/manage/dashboard"], #root a[href="/admin/manage/reports"] span.w-auto, #root a[href="/admin/manage/auditLogs"], #root a[href="/admin/manage/inventory"] span.w-auto, #root a[href="/admin/manage/users"] span.w-auto, #adminUserName, #root div.rounded-full, #root span.inline-flex, #root button.flex'
    ).should("be.visible");
  });
  it("Testing the admin dashboard page visiblity", () => {
    cy.get('#root a[href="/admin/manage/dashboard"]').click();
    cy.get("#dashHeading").should("be.visible");
    cy.get(
      "#root div.mx-auto > div:nth-child(2) > div:nth-child(1), #revenueCurrencyIcon, #totalRevenue"
    )
      .should("be.visible")
      .should("contain.text", "Total Revenue");
    cy.get(
      "#root div.mx-auto > div:nth-child(2) > div:nth-child(2), #totalOrders, #totalOrdersValue, #totalOrdersIcon"
    ).should("be.visible");
    cy.get("#root div.mx-auto > div:nth-child(3) > div:nth-child(1), #productsInStock, #productsInStockValue, #productsInStockIcon").should(
      "be.visible"
    );
    cy.get("#root div.mx-auto > div:nth-child(3) > div:nth-child(2), #lowStockItems, #lowStockItemsValue, #lowStockItemsIcon").should(
      "be.visible"
    );
    cy.get("#root div.hover\\:bg-red-100, #orderId, #customerName, #orderDate, #orderTotal, #orderStatus").should("be.visible");
    cy.get("#root div.hover\\:bg-red-100, #lowStockItemsName, #lowStockItemsQtyLeft, #lowStockItemsReorderStatus").should("be.visible");
    cy.get("#root div.md\\:grid-cols-3 > div:nth-child(1)").should(
      "be.visible"
    );
    cy.get("#root div.md\\:grid-cols-3 > div:nth-child(2)").should(
      "be.visible"
    );
    cy.get("#root div.md\\:grid-cols-3 > div:nth-child(3)").should(
      "be.visible"
    );
  });
});
