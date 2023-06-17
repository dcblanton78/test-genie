import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import UserContext from "../UserContext";
import LandingPage from "../LandingPage";

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

  test("renders LandingPage component correctly", () => {
    expect(screen.getByText("Welcome to TestGenie!")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Req To Test" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "CodeToTest" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Your Tests" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Req To Test" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Code To Test" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Your Tests" })
    ).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  test("navigates correctly when buttons are clicked", () => {
    fireEvent.click(screen.getByRole("button", { name: "Req To Test" }));
    expect(window.location.pathname).toBe("/tests");
    fireEvent.click(screen.getByRole("button", { name: "CodeToTest" }));
    expect(window.location.pathname).toBe("/CodeToTest");
    fireEvent.click(screen.getByRole("button", { name: "Your Tests" }));
    expect(window.location.pathname).toBe("/your-tests");
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));
    expect(window.location.pathname).toBe("/");
  });

  test("logs out when logout button is clicked", () => {
    fireEvent.click(screen.getByText("Logout"));
    expect(mockSetUser).toHaveBeenCalledWith({});
    expect(global.google.accounts.id.disableAutoSelect).toHaveBeenCalled();
    expect(window.location.pathname).toBe("/");
  });
});
