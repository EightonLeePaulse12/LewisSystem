/* eslint-disable no-undef */
describe("Admin Reports", () => {
  // Helper to safely open a Select dropdown
  const openSelect = (triggerId, contentId) => {
    // Wait until body is unlocked (pointer-events auto)
    cy.get("body", { timeout: 10000 }).should(
      "have.css",
      "pointer-events",
      "auto"
    );

    cy.get(triggerId)
      .should("be.visible")
      .and("have.attr", "data-state", "closed")
      .click(); // open dropdown
    cy.get(contentId).should("be.visible");
  };

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

  it("Testing the admin reports page visibility", () => {
    // Navigate to Reports page
    cy.get('#root a[href="/admin/manage/reports"]').click();

    // Wait for charts and content to load
    cy.get("#reportsDashboardHeading", { timeout: 10000 }).should("be.visible");

    // Dashboard charts
    cy.get(
      "#revenueTrendIcon, #revenueTrendChartTitle, #revenueLineGraph"
    ).should("be.visible");
    cy.get(
      "#orderStatusDistributionIcon, #orderStatusDistributionChartTitle, #orderStatusDistributionChart"
    ).should("be.visible");
    cy.get(
      "#topCategoriesChartTitle, #topCategoriesChartIcon, #topCategoriesChart"
    ).should("be.visible");
    cy.get(
      "#lowStockAlertsChartTitle, #lowStockAlertsChartIcon, #lowStockAlertsChart"
    ).should("be.visible");
    cy.get("#recentOrdersTitle, #recentOrdersIcon").should("be.visible");
    cy.get("#avgOrderValueTitle, #avgOrderValueIcon, #avgOrderValue").should(
      "be.visible"
    );

    // Download Reports Section
    cy.get(
      "#downloadReportsHeading, #salesReportTitle, #salesReportDownloadIcon, #downloadSalesReportButton"
    ).should("be.visible");
    cy.get(
      "#paymentsReportTitle, #paymentsReportDownloadIcon, #downloadPaymentsReportButton"
    ).should("be.visible");
    cy.get(
      "#overdueReportTitle, #overdueReportDownloadIcon, #downloadOverdueReportButton"
    ).should("be.visible");

    // -------------------------------
    // SALES REPORT DROPDOWN
    // -------------------------------
    openSelect("#salesFormat", "#salesFormat");
    cy.get("#csv").should("be.visible");
    cy.get("#pdf").should("be.visible");
    cy.get("#csv").click(); // Select CSV to close the dropdown

    // -------------------------------
    // PAYMENTS REPORT DROPDOWN
    // -------------------------------
    openSelect("#paymentsFormat", "#paymentsFormat");
    cy.get("#csvPayments").should("be.visible");
    cy.get("#pdfPayments").should("be.visible");
    cy.get("#csvPayments").click(); // Select CSV to close the dropdown

    // -------------------------------
    // OVERDUE REPORT DROPDOWN
    // -------------------------------
    openSelect("#overdueFormat", "#overdueFormat");
    cy.get("#overdueReportDownloadCSV").should("be.visible");
    cy.get("#overdueReportDownloadPDF").should("be.visible");
    cy.get("#overdueReportDownloadCSV").click(); // Select CSV to close the dropdown
  });
  it("Downloads Sales Report via CSV", () => {
    // Navigate to Reports page
    cy.get('#root a[href="/admin/manage/reports"]').click();
    // Download Sales Report as CSV
    cy.get("#sales-start").type("2025-12-01"); // For start date
    cy.get("#sales-end").type("2025-12-31"); // For end date
    cy.get("#downloadSalesReportButton").click();
    cy.wait(2000); // wait for 2 seconds to ensure download completes
  });
  it("Downloads Sales Report via PDF", () => {
    // Navigate to Reports page
    cy.get('#root a[href="/admin/manage/reports"]').click();
    // Download Sales Report as PDF
    cy.get("#sales-start").type("2025-12-01"); // For start date
    cy.get("#sales-end").type("2025-12-31"); // For end date
    openSelect("#salesFormat", "#salesFormat");
    cy.get("#pdf").click();
    cy.get("#downloadSalesReportButton").click();
    cy.wait(2000); // wait for 2 seconds to ensure download completes
  });
  it("Downloads Payments Report via CSV", () => {
    // Navigate to Reports page
    cy.get('#root a[href="/admin/manage/reports"]').click();
    // Download Payments Report as CSV
    cy.get("#payments-start").type("2025-12-01"); // For start date
    cy.get("#payments-end").type("2025-12-31"); // For end date
    cy.get("#downloadPaymentsReportButton").click();
    cy.wait(2000); // wait for 2 seconds to ensure download completes
  });
  it("Downloads Payments Report via PDF", () => {
    // Navigate to Reports page
    cy.get('#root a[href="/admin/manage/reports"]').click();
    // Download Payments Report as PDF
    cy.get("#payments-start").type("2025-12-01"); // For start date
    cy.get("#payments-end").type("2025-12-31"); // For end date
    openSelect("#paymentsFormat", "#paymentsFormat");
    cy.get("#pdfPayments").click();
    cy.get("#downloadPaymentsReportButton").click();
    cy.wait(2000); // wait for 2 seconds to ensure download completes
  });
  it("Downloads Overdue Report via CSV", () => {
    // Navigate to Reports page
    cy.get('#root a[href="/admin/manage/reports"]').click();
    // Download Overdue Report as CSV
    cy.get("#downloadOverdueReportButton").click();
    cy.wait(2000); // wait for 2 seconds to ensure download completes
  });
  it("Downloads Overdue Report via PDF", () => {
    // Navigate to Reports page
    cy.get('#root a[href="/admin/manage/reports"]').click();
    // Download Overdue Report as PDF
    openSelect("#overdueFormat", "#overdueFormat");
    cy.get("#overdueReportDownloadPDF").click();
    cy.get("#downloadOverdueReportButton").click();
    cy.wait(2000); // wait for 2 seconds to ensure download completes
  });
});
