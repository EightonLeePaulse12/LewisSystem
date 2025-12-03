/* eslint-disable no-undef */
describe("About Page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/");
  });
  it("Checks for visibility", () => {
    cy.get('#root a[href="/public/about"] span.hidden').click();
    cy.get("#estBadge").should("be.visible");
    cy.get("#ourStory").should("be.visible");
    cy.get("#ourStoryPara").should("be.visible");
    cy.get("#statsBar").should("be.visible");
    cy.get("#heading").should("be.visible");
    cy.get("#heritage-text").should("be.visible");
    cy.get("#ticks").should("be.visible");
    cy.get("#livingroomImg").should("be.visible");
    cy.get("#coreValuesH").should("be.visible");
    cy.get("#values").should("be.visible");
    cy.get("#lewisDiff").should("be.visible");
    cy.get("#showroomImg").should("be.visible");
    cy.get("#rttyhBanner").should("be.visible");
  });
});
