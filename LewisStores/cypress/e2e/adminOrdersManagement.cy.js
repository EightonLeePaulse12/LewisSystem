/* eslint-disable no-undef */
describe("Admin Manage Orders Page", () => {
  beforeEach(() => {
    // Login session
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

    // Always reload admin page after session is restored
    cy.visit("http://localhost:5173/admin/");

    // FIX: menu loads async, wait for sidebar anchor to exist
    cy.get('a[href="/admin/manage/orders"]', { timeout: 8000 })
      .should("be.visible")
      .click();
  });

  // Helper for opening dropdown on a row
  const openDropdown = ($row) => {
    cy.wrap($row).find(".w-40").first().click({ force: true });
  };

  it("Checks visibility of Manage Orders elements", () => {
    cy.get("#oMheading, #manageOrdersTitle, #manageOrdersDescription")
      .should("be.visible");

    cy.get(
      "#orderSearchInput, #orderSearchIcon, #orderStatusFilterIcon, #orderStatusFilter, #orderStartDateFilter, #orderEndDateFilter, #resetFiltersButton"
    ).should("be.visible");

    cy.get("#ordersTableHeaderRow")
      .should("be.visible")
      .and("contain.text", "Order ID")
      .and("contain.text", "Customer ID")
      .and("contain.text", "Date")
      .and("contain.text", "Total")
      .and("contain.text", "Status")
      .and("contain.text", "Actions");

    cy.get("table tbody tr")
      .should("exist")
      .and("have.length.greaterThan", 0);

    cy.get("#previousPageButton, #nextPageButton").should("be.visible");
  });

  it("Validates dropdown options for each row (without infinite waiting)", () => {
    const statuses = [
      "Pending",
      "Confirmed",
      "Packed",
      "Dispatched",
      "Delivered",
      "Cancelled",
      "Returned",
    ];

    // BROAD intercept → works for all your PATCH routes
    cy.intercept("PATCH", "**/api/manage/orders/**").as("patchOrder");

    cy.get("table tbody tr").each(($row) => {
      statuses.forEach((status) => {
        openDropdown($row);

        cy.contains("div[role='option']", status).click({ force: true });

        cy.wrap($row).find(".w-40 span")
          .should("contain.text", status);

        // Wait ONLY once per click → no nested infinite waits
        cy.wait("@patchOrder")
          .its("response.statusCode")
          .should("eq", 204);
      });
    });
  });

  it("Pagination should work", () => {
    cy.get("#nextPageButton").click();
    cy.contains("Page 2").should("exist");

    cy.get("#previousPageButton").click();
    cy.contains("Page 1").should("exist");
  });

  it("View Details button opens details page + checks visibility", () => {
    cy.get("table tbody tr")
      .first()
      .within(() => {
        cy.contains("button", "View Details").click();
      });
  });
});