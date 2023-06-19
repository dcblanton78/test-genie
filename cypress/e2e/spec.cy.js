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

describe("ReqToTest Page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/tests");
  });

  it("should display the ReqToTest page", () => {
    cy.get("[data-cy=req-to-test-page]").should("exist");
  });

  it("should generate tests for valid requirements and save them", () => {
    cy.intercept(
      "GET",
      "http://localhost:8000/generate-test-cases?requirements=**"
    ).as("generateTestCases");

    cy.get("[data-cy=requirements-textarea]")
      .type("The user should be able to log in")
      .should("have.value", "The user should be able to log in");

    cy.get("[data-cy=generate-tests-button]").click();

    cy.wait("@generateTestCases").then((interception) => {
      if (interception) {
        expect(interception.response.statusCode).to.equal(200);
        // Add any additional assertions you need to check the response
      } else {
        throw new Error("Interception not found");
      }
    });

    cy.get("[data-cy=test-cases-container]").should("exist");
    cy.get("[data-cy=requirements-text]").should(
      "contain",
      "The user should be able to log in"
    );

    // cy.get("[data-cy=save-button-0]").click();

    // cy.get("[data-cy=success-message]").should(
    //   "contain",
    //   "Test case saved successfully!"
    // );
  });
});

// it("should save a test case", () => {
//   cy.get("[data-cy=save-button-0]").click();

//   cy.get("[data-cy=success-message]").should(
//     "contain",
//     "Test case saved successfully!"
//   );
// });

// it("should download test cases as CSV", () => {
//   cy.get("[data-cy=requirements-textarea]")
//     .type("Sample requirement")
//     .should("have.value", "Sample requirement");

//   cy.get("[data-cy=generate-tests-button]").click();

//   cy.get("[data-cy=download-csv-button]").click();

//   // cy.readFile("/Users/dcblanton78/Downloads/test-cases (*.csv)").should(
//   //   "exist"
//   // );
// });
