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
    // expect(
    //   screen.getByRole("button", { name: "Req To Test" })
    // ).toBeInTheDocument();
    // expect(
    //   screen.getByRole("button", { name: "CodeToTest" })
    // ).toBeInTheDocument();
    // expect(
    //   screen.getByRole("button", { name: "Your Tests" })
    // ).toBeInTheDocument();
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
  test("navigates correctly when buttons are clicked", () => {
    fireEvent.click(screen.getByRole("link", { name: "ReqToTest" }));
    expect(window.location.pathname).toBe("/req-to-test");
    fireEvent.click(screen.getByText("ReqToTest"));
    expect(window.location.pathname).toBe("/req-to-test");
    fireEvent.click(screen.getByRole("link", { name: "CodeToTest" }));
    expect(window.location.pathname).toBe("/code-to-test");
    fireEvent.click(screen.getByRole("link", { name: "TagYourCode" }));
    expect(window.location.pathname).toBe("/tag-your-code");
    fireEvent.click(screen.getByRole("link", { name: "Your Tests" }));
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
  //
});

//   ---------------------

// import { render, screen, fireEvent } from "@testing-library/react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import UserContext from "../UserContext";
// import LandingPage from "../LandingPage";
// import ReqToTest from "../ReqToTest";
// import CodeToTest from "../CodeToTest";
// import Locator from "../Locator";
// import TestCasesTable from "../TestCasesTable";

// jest.mock("react-textarea-autosize", () => () => <textarea />);

// // Mock global google object
// global.google = {
//   accounts: {
//     id: {
//       disableAutoSelect: jest.fn(),
//     },
//   },
// };

// describe("LandingPage component", () => {
//   const mockSetUser = jest.fn();
//   const mockUser = {
//     name: "Test User",
//   };

//   // beforeEach(() => {
//   //   render(
//   //     <Router>
//   //       <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
//   //         <Routes>
//   //           <Route path="/" element={<LandingPage />} />
//   //           <Route path="/tests" element={<ReqToTest />} />
//   //           <Route path="/codetotest" element={<CodeToTest />} />
//   //           <Route path="/locator" element={<Locator />} />
//   //           <Route path="/your-tests" element={<TestCasesTable />} />
//   //         </Routes>
//   //       </UserContext.Provider>
//   //     </Router>
//   //   );
//   // });

//   test("renders LandingPage component correctly", () => {
//     render(
//       <Router>
//         <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
//           <Routes>
//             <Route path="/" element={<LandingPage />} />
//             <Route path="/tests" element={<ReqToTest />} />
//             <Route path="/codetotest" element={<CodeToTest />} />
//             <Route path="/locator" element={<Locator />} />
//             <Route path="/your-tests" element={<TestCasesTable />} />
//           </Routes>
//         </UserContext.Provider>
//       </Router>
//     );
//     expect(
//       screen.getByRole("link", { name: "Req To Test" })
//     ).toBeInTheDocument();
//     expect(
//       screen.getByRole("link", { name: "Code To Test" })
//     ).toBeInTheDocument();
//     expect(
//       screen.getByRole("link", { name: "Your Tests" })
//     ).toBeInTheDocument();
//     expect(screen.getByText("Test User")).toBeInTheDocument();
//   });

//   test("navigates to Req To Test page when button is clicked", async () => {
//     render(
//       <Router>
//         <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
//           <Routes>
//             <Route path="/" element={<LandingPage />} />
//             <Route path="/tests" element={<ReqToTest />} />
//             <Route path="/codetotest" element={<CodeToTest />} />
//             <Route path="/locator" element={<Locator />} />
//             <Route path="/your-tests" element={<TestCasesTable />} />
//           </Routes>
//         </UserContext.Provider>
//       </Router>
//     );
//     fireEvent.click(screen.getByRole("link", { name: "Req To Test" }));
//     expect(window.location.pathname).toBe("/tests");
//   });

//   test("navigates to Code To Test page when button is clicked", async () => {
//     render(
//       <Router>
//         <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
//           <Routes>
//             <Route path="/" element={<LandingPage />} />
//             <Route path="/tests" element={<ReqToTest />} />
//             <Route path="/codetotest" element={<CodeToTest />} />
//             <Route path="/locator" element={<Locator />} />
//             <Route path="/your-tests" element={<TestCasesTable />} />
//           </Routes>
//         </UserContext.Provider>
//       </Router>
//     );
//     fireEvent.click(screen.getByRole("link", { name: "Code To Test" }));
//     expect(window.location.pathname).toBe("/codetotest");
//   });

//   // test("navigates to Your Tests page when button is clicked", async () => {
//   //   fireEvent.click(screen.getByRole("link", { name: "Your Tests" }));
//   //   expect(window.location.pathname).toBe("/your-tests");
//   // });

//   // test("navigates to landing page when Logout is clicked", async () => {
//   //   fireEvent.click(screen.getByText("Logout"));
//   //   expect(window.location.pathname).toBe("/");
//   // });

//   // test("logs out when logout button is clicked", () => {
//   //   fireEvent.click(screen.getByText("Logout"));
//   //   expect(mockSetUser).toHaveBeenCalledWith({});
//   //   expect(global.google.accounts.id.disableAutoSelect).toHaveBeenCalled();
//   //   expect(window.location.pathname).toBe("/");
//   // });
// });
