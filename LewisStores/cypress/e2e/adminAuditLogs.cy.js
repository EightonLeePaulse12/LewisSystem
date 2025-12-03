/* eslint-disable no-undef */
describe("Audit Logs Page", () => {
  beforeEach(() => {
    cy.session("userSession", () => {
      cy.intercept("GET", "/api/auth/profile-picture/*", {
        statusCode: 200,
        body: "",
      });

      cy.visit("http://localhost:5173/");

      cy.get("#loginButton").click();
      cy.get("#email").type("eightonleepaulse@gmail.com");
      cy.get("#password").type("Ultrainstinct12_");
      cy.get("#submitLogin").click();

      cy.url().should("not.include", "/login");
    });

    cy.visit("http://localhost:5173/admin/");
  });

  it("Tests the Audit Logs Page Visibility", () => {
    // Navigate to Audit Logs page
    cy.get('#root a[href="/admin/manage/auditLogs"]').click();
    // Verify search and heading visibility
    cy.get("#audit-logs-icon, #audit-logs-heading, #audit-logs-search").should(
      "be.visible"
    );
    // Verify table headers
    cy.get(
      "#audit-logs-table-header, #audit-logs-timestamp, #audit-logs-user-id, #audit-logs-action, #audit-logs-entity-type, #audit-logs-entity-id, #audit-logs-details"
    ).should("be.visible");

    // Conditional check using if statement for logs presence
    cy.get("table tbody").then(($tbody) => {
      if ($tbody.text().includes("No logs found")) {
        // If no logs, assert the message is visible
        cy.contains("No logs found").should("be.visible");
      } else {
        // If logs are present, assert at least one row exists and check structure
        cy.get("table tbody tr").should("have.length.gte", 1);
        cy.get("table tbody tr:first-child td").should("have.length", 6); // 6 columns
      }
    });
  });
  it("Tests Audit Logs Search Functionality", () => {
    // Navigate to Audit Logs page
    cy.get('#root a[href="/admin/manage/auditLogs"]').click();
    // Enter a search term
    const searchTerm = "Update";
    cy.get("#audit-logs-search input").type(searchTerm);
    cy.wait(1000); // wait for debounce and data fetch
    cy.get("#audit-logs-search input").clear();
    // Enter a search term date
    const dateTerm = "6/9/2025, 6:16:56 PM";
    cy.get("#audit-logs-search input").type(dateTerm);
    cy.wait(1000); // wait for debounce and data fetch
    cy.get("#audit-logs-search input").clear();
    // Enter a search term user ID
    const userIdTerm = "019abf07-b01b-7ed2-a238-06d56edec0a1";
    cy.get("#audit-logs-search input").type(userIdTerm);
    cy.wait(1000); // wait for debounce and data fetch
    cy.get("#audit-logs-search input").clear();
    // Enter a search term entity type
    const entityTypeTerm = "Product";
    cy.get("#audit-logs-search input").type(entityTypeTerm);
    cy.wait(1000); // wait for debounce and data fetch
    cy.get("#audit-logs-search input").clear();
    // Enter a search term action
    const actionTerm = "Delete";
    cy.get("#audit-logs-search input").type(actionTerm);
    cy.wait(1000); // wait for debounce and data fetch
    cy.get("#audit-logs-search input").clear();
    // Enter a search term entity ID
    const entityIdTerm = "4d42cdad-33ed-474a-a9ef-75fdfb09954b";
    cy.get("#audit-logs-search input").type(entityIdTerm);
    cy.wait(1000); // wait for debounce and data fetch
    cy.get("#audit-logs-search input").clear();
    // Enter a search term details
    const detailsTerm = "Changed price from $10 to $12";
    cy.get("#audit-logs-search input").type(detailsTerm);
    cy.wait(1000); // wait for debounce and data fetch
    cy.get("#audit-logs-search input").clear();

    // Enter a search term that yields no results
    const noResultTerm = "NonExistentLogEntry";
    cy.get("#audit-logs-search input").type(noResultTerm);
    cy.wait(1000); // wait for debounce and data fetch
    // Verify "No logs found" message
    cy.wait(4000);
    cy.get("#audit-logs-no-logs-found").should("contain.text", "No logs found");
  });
  it("Tests Audit Logs Pagination Functionality", () => {
    // Navigate to Audit Logs page
    cy.get('#root a[href="/admin/manage/auditLogs"]').click();
    cy.get("#audit-logs-next-page-button").click().wait(1000);
    cy.get("#audit-logs-previous-page-button").click().wait(1000);
  });
});
