describe("My First Test", () => {
  it("Visits Test Genie", () => {
    cy.visit("https://test-genie.com");
  });
});

describe("Login Page", () => {
  beforeEach(() => {
    cy.visit("localhost:3000/");
  });

  it("should display the login page", () => {
    cy.get("[data-cy=login-page]").should("exist");
  });

  it("should log in with valid credentials", () => {
    cy.get("[data-cy=email-input]").type("dcblanton78@gmail.com");
    cy.get("[data-cy=password-input]").type("abc123");
    cy.get("[data-cy=submit-button]").click();

    cy.url().should("include", "/landing");
  });
});

describe("Landing Page", () => {
  beforeEach(() => {
    cy.visit("localhost:3000/landing");
  });

  it("should display the landing page", () => {
    cy.get("[data-cy=landing-page]").should("exist");
  });

  it("should navigate to Req To Test page", () => {
    cy.get("[data-cy=req-to-test-link]").click();
    cy.url().should("include", "/tests");
  });

  it("should navigate to Code To Test page", () => {
    cy.get("[data-cy=code-to-test-link]").click();
    cy.url().should("include", "/CodeToTest");
  });

  it("should navigate to Your Tests page", () => {
    cy.get("[data-cy=your-tests-link]").click();
    cy.url().should("include", "/your-tests");
  });
});

describe("Login and Landing Pages", () => {
  beforeEach(() => {
    cy.visit("localhost:3000/");
  });

  it("should log in and navigate to the landing page", () => {
    cy.get("[data-cy=email-input]").type("dcblanton78@gmail.com");
    cy.get("[data-cy=password-input]").type("abc123");
    cy.get("[data-cy=submit-button]").click();

    cy.url().should("include", "/landing");
    cy.get("[data-cy=landing-page]").should("exist");
  });

  it("should log out from the landing page", () => {
    cy.get("[data-cy=email-input]").type("dcblanton78@gmail.com");
    cy.get("[data-cy=password-input]").type("abc123");
    cy.get("[data-cy=submit-button]").click();

    cy.get("[data-cy=logout-button]").click();
    cy.url().should("include", "/");
    cy.get("[data-cy=login-page]").should("exist");
  });
});
