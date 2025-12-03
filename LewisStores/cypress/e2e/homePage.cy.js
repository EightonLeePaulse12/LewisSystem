/* eslint-disable no-undef */
describe("Home Page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/");
  });  it("Checks for visibility", () => {
    cy.get("#guestNavbar").should(
      "contain.text",
      "Home",
      "About  Us",
      "Products",
      "Contact Us",
      "Login",
      "Register"
    );
    cy.get("#topHomePageSection").should(
      "contain",
      "Limited Time Offer",
      "Transform Your Home",
      "For Less",
      "Discover premium furniture and appliances with flexible payment plans. Free delivery on order over R5 000."
    );
    cy.get("#shopNowTopHomePageBtn").should("be.visible");
    cy.get("#viewSpecialsTopHomePageBtn").should("be.visible");
    cy.get("#featuresGridHomePage").should(
      "contain",
      "Flexible Payments",
      "Free Delivery",
      "Quality Guarantee",
      "Weekly Specials"
    );
    cy.get("#categorySectionHomePage").should("be.visible");
    cy.get("#shoppingCategoriesHomePage").should("be.visible");
    cy.get("#shoppingCategoriesHomePage").should(
      "contain",
      "Lounge Suites",
      "Bedroom Suites",
      "Dining Room",
      "Kitchen & Appliances"
    );
    cy.get("#bottomHomePageRedSection").should(
      "contain",
      "Ready to Upgrade Your Home?",
      "Visit your nearest Lewis store to see our collection in person, or start shopping online today for exclusive web-only deals."
    );
    cy.get("#startShoppingBottomHomePageBtn")
      .should("be.visible")
      .should("contain.text", "Start Shopping");
    cy.get("#findAStoreBottomHomePageBtn")
      .should("be.visible")
      .should("contain.text", "Find a Store");
    cy.get("#homePageBottomFooter")
      .should("be.visible")
      .should("contain.text", "LEWIS", "Shop", "Customer Service", "Contact")
      .should(
        "contain.text",
        "Africa's largest furniture retailer since 1934.",
        "All Products",
        "Lounge Suites",
        "Bedroom Suites",
        "Appliances",
        "Delivery Information",
        "Returns Policy",
        "FAQ",
        "support@lewisstores.com",
        "0800 111 123",
        "Find Nearest Storee",
        "© 2025 Lewis Stores. All rights reserved."
      );
    cy.get("#facebokIcon").should("be.visible");
    cy.get("#twitterIcon").should("be.visible");
    cy.get("#instagramIcon").should("be.visible");
  });
  it('Takes the user to the products page via the Shop Now Button', () => {
    cy.get('#shopNowTopHomePageBtn').click()
  })
  it('Takes the user to the products page via Start Shopping Button', () => {
    cy.get('#startShoppingBottomHomePageBtn').click()
  })
});
