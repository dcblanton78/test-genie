//Implement unit tests for BarrierBreaker component

// Path: src/components/__tests__/BarrierBreaker.test.js
jest.mock("axios");
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BrowserRouter } from "react-router-dom";
import UserContext from "../UserContext";
import LandingPage from "../LandingPage";
import { within } from "@testing-library/dom";
import BarrierBreaker from "../BarrierBreaker";
import mockAxios from "jest-mock-axios";
import axios from "axios";

// Mock global google object
global.google = {
  accounts: {
    id: {
      disableAutoSelect: jest.fn(),
    },
  },
};

describe("LandingPage component", () => {
  const mockSetUser = jest.fn();
  const mockUser = {
    name: "Test User",
  };

  beforeEach(() => {
    render(
      <BrowserRouter>
        <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
          <LandingPage />
        </UserContext.Provider>
      </BrowserRouter>
    );
  });

  //Test that user can login and navigate to the Landing Page
  test("renders LandingPage component correctly", () => {
    expect(screen.getByText("Welcome to TestGenie!")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "ReqToTest" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "CodeToTest" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "TagYourCode" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Your Tests" })
    ).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  //Test that user can navigate to the Barrier Breaker page from the Landing Page
  test("navigates correctly when buttons are clicked", () => {
    fireEvent.click(screen.getByText("BarrierBreaker"));
    expect(window.location.pathname).toBe("/barrier-breaker");
  });
});

afterEach(() => {
  // cleaning up the mess left behind the previous test
  mockAxios.reset();
});

//Test that user can enter a block of code and receive a well formatted response. This will be done using mock data.
describe("BarrierBreaker component", () => {
  // ...

  test("renders report after submitting code block", async () => {
    // Arrange
    const mockResponse = {
      data: {
        report: "# Title\nSome markdown content",
      },
    };

    const resolved = Promise.resolve(mockResponse);
    axios.request.mockResolvedValueOnce(resolved);

    const mockUser = {
      name: "Test User",
    };

    render(
      <BrowserRouter>
        <UserContext.Provider value={{ user: mockUser, setUser: jest.fn() }}>
          <BarrierBreaker />
        </UserContext.Provider>
      </BrowserRouter>
    );

    const textarea = screen.getByTestId("textarea");

    // console.log(userEvent);
    // await userEvent.type(textarea, "some code");
    // await waitFor(() => {
    //   expect(textarea).toHaveValue("some code");
    // });
    const user = userEvent.setup();
    await user.type(textarea, "some code");
    await waitFor(() => {
      expect(textarea.value).toEqual("some code");
    });

    //expect(textarea).toHaveValue("some code");

    console.log(textarea.value); // Log the value of the textarea.

    // Simulate clicking on "Generate Report"
    fireEvent.click(screen.getByText("Generate Report"));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.request).toHaveBeenCalledWith({
      method: "POST",
      url: "http://localhost:8000/generate-a11y-report",
      params: { code: "some code" },
    });

    // Assert
    // Check that the report has been rendered
    await waitFor(() => screen.getByText("Title"));

    // Check that the report content is correct
    // const reportContainer = screen.getByClassName("report");
    // const reportContainer = screen.getByRole("article", {
    //   name: "report-container",
    // });

    const reportContainer = screen.getByTestId("report-container");

    within(reportContainer).getByText("Some markdown content");
  });
});

afterEach(() => {
  // Reset all mock instances and implementations
  axios.request.mockReset();
});
