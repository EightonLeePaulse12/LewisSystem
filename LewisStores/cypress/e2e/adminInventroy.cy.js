/* eslint-disable no-undef */
describe("Admin Inventory Page", () => {
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

      cy.url().should("not.include", "/login");
    });

    cy.visit("http://localhost:5173/admin/");
  });
  it("Tests the Admin Inventory Page Visibility", () => {
    // Navigate to Inventory page
    cy.get('#root a[href="/admin/manage/inventory"]').click();
    cy.get(
      "#inventoryPageHeading, #inventorySearch, #inventorySearchIcon, #inventoryFilter, #inventoryFilterIcon, #addProductButton, #importProductButton, #exportProductButton"
    ).should("be.visible")
    cy.wait(4000);
    cy.get("#inventoryCardTitle, #inventoryCardDescription").should(
      "be.visible"
    );
    cy.wait(4000);
    cy.get(
      "#inventoryTableHeader, #inventoryTableName, #inventoryTableSKU, #inventoryTableStock, #inventoryTablePrice, #inventoryTableActions"
    ).should("be.visible");
    cy.wait(4000);
    cy.get(
      "#inventoryProductNameLink, #inventoryProductSKU, #inventoryStockBadge, #inventoryProductPrice, #inventoryProductActions"
    ).then(($link) => {
      if ($link.length > 0) {
        // If products exist, check for at least one row and its structure
        cy.get("table tbody tr").should("have.length.gte", 1);
        cy.get("table tbody tr:first-child td").should("have.length", 5); // 5 columns
        cy.get("#inventoryStockBadge").should("be.visible");
      } else {
        // If no products, check for the no products message
        cy.contains("No products found").should("be.visible");
      }
    });
  });
  it("Tests Admin Inventory Search Functionality", () => {
    // Navigate to Inventory page
    cy.get('#root a[href="/admin/manage/inventory"]').click();
    // Enter a search term
    cy.get("#inventorySearch")
      .type("Refined")
      .wait(2000)
      .clear()
      .get("#inventorySearch")
      .type("8421717296760")
      .wait(2000)
      .clear()
      .get("#inventorySearch")
      .type("Non Existent Product")
      .wait(4000)
      .clear();
  });
  it("Tests Admin Inventory Filter Functionality", () => {
    // Navigate to Inventory page
    cy.get('#root a[href="/admin/manage/inventory"]').click();
    // Apply a filter
    cy.get("#inventoryFilter")
      .type("Metal")
      .wait(2000)
      .clear()
      .get("#inventoryFilter")
      .type("Non Existent Category")
      .wait(4000)
      .clear();
  });
  it("Adds a New Product", () => {
    // Navigate to Inventory page
    cy.get('#root a[href="/admin/manage/inventory"]').click();
    // Click Add Product button
    cy.get("#addProductButton").click();
    // Verify navigation to Add Product page
    cy.url().should("include", "/admin/manage/inventory/add");
    // Fill out the Add Product form
    cy.get("#sku").should("be.visible").type("TESTSKU123");
    cy.get("#name").should("be.visible").type("Test Product");
    cy.get("#description").should("be.visible").type("This is a test product.");
    cy.get("#unitPrice").should("be.visible").clear().type("99.99");
    cy.get("#costPrice").should("be.visible").clear().type("59.99");
    cy.get("#stockQty").should("be.visible").clear().type("50");
    cy.get("#reorderThreshold").should("be.visible").clear().type("10");
    cy.get("#dimensions").should("be.visible").type("10x10x10 cm");
    cy.get('[name="imageUrl"]').should("be.visible").click(); // This allows the user to upload an image from their device
    cy.get("#root span.flex").should("be.visible").click();
  });
  it("Exports Products as CSV", () => {
    // Navigate to Inventory page
    cy.get('#root a[href="/admin/manage/inventory"]').click();
    // Click Export Products button
    cy.get("#exportProductButton").should("be.visible").click();
    cy.wait(2000); // wait for 2 seconds to ensure download completes
  });
  it("Imports Products via CSV", () => {
    // Navigate to Inventory page
    cy.get('#root a[href="/admin/manage/inventory"]').click();
    // Click Import Products button
    cy.get("#importProductButton").should("be.visible").click();
    // Verify navigation to Import Products page
    cy.url().should("include", "/admin/manage/inventory/import");
    // Upload a CSV file
    cy.get("#root input.w-full").click(); // This allows the user to upload a CSV from their device
    cy.get("#root button.bg-primary").click(); // Click the Import button
    cy.wait(2000); // wait for 2 seconds to ensure import completes
  });
  it("Edits an Existing Product", () => {
    cy.get('#root a[href="/admin/manage/inventory"]').click();
    cy.get('table tbody tr').first().find('#inventoryProductActions button:contains("Edit")').click();
    cy.get('[name="stockQty"]').should("be.visible").clear().type("300");
    cy.get("#root button.bg-background").should("be.visible").click(); // Cancels the edit
    cy.get('table tbody tr').first().find('#inventoryProductActions button:contains("Edit")').click();
    cy.get('[name="stockQty"]').should("be.visible").clear().type("300");
    cy.get("#updateProductButton").should("be.visible").click(); //Updates the product
    cy.wait(2000); // wait for 2 seconds to ensure update completes
  });
  it("Deletes a Product", () => {
    cy.get('#root a[href="/admin/manage/inventory"]').click();
    cy.get('table tbody tr').first().find('#deleteProductButton').should('be.visible').click();
    cy.wait(2000); // wait for deletion to complete
    cy.contains("Product deleted").should("be.visible"); // Verify success toast message
  });
  it("Checks Pagination Buttons", () => {
    // Navigate to Inventory page
    cy.get('#root a[href="/admin/manage/inventory"]').click();
    cy.get("#inventory-pagination-next").should("be.visible")
    cy.get("#inventory-pagination-prev").should("be.visible")
  });
})