/* eslint-disable no-undef */
describe("Admin Manage Users Page", () => {
  beforeEach(() => {
    // Reuse session for speed
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

  // ───────────────────────────
  it("Checks Manage Users page elements for visibility", () => {
    cy.get('#root a[href="/admin/manage/users"]').click();

    cy.get("#user-management-heading").should("be.visible");
    cy.get("#usersTableName").should("be.visible");
    cy.get("#usersTableEmail").should("be.visible");
    cy.get("#usersTableStatus").should("be.visible");
    cy.get("#usersTableActions").should("be.visible");
    cy.get("#banUserButton").should("be.visible");
    cy.get("#userStatusActive").should("be.visible");
    cy.get(
      "#paginationControls, #previousManageUsers, #nextManageUsers"
    ).should("be.visible");
  });

  // ───────────────────────────
  it("Tests Manage Users Ban/Unban Functionality", () => {
    cy.get('#root a[href="/admin/manage/users"]').click();
    cy.contains(
      "#usersTableContainer table tbody tr",
      "jambrood69@gmail.com"
    ).within(() => {
      cy.contains("button", "Ban").click();
    });

    cy.get("#cancelBanUserButton").should("be.visible");
    cy.contains("button", "Confirm Ban").click();

    // Check if the user is banned manuallly. (User cannot access the website)

    cy.get("#unbanUserButton").should("be.visible").click();
    cy.wait(5000);
  });
});
