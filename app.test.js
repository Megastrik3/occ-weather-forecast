import { checkLocalStorage, checkAge, getCurrentDate, openLocationFrame } from "../js/app.js"; // Adjust the path accordingly

beforeEach(() => {

  jest.spyOn(console, 'log').mockImplementation(() => {});

  document.createElement = jest.fn().mockImplementation(() => ({
    className: '',
    id: '',
    innerHTML: '',
    appendChild: jest.fn(),
  }));

  global.document.getElementById = jest.fn().mockImplementation((id) => {
    if (id === "locationLightbox") {
      return { style: { display: "" }, innerHTML: "" };
    }
    return null;
  });

  jest.clearAllMocks();
});

describe("app.js", () => {

  describe("checkLocalStorage", () => {
    it("should return false and log when the item is not found in storage", () => {

      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue(null),
        },
        writable: true,
      });

      const result = checkLocalStorage("nonExistentKey");
      expect(result).toBe(false);
      expect(console.log).toHaveBeenCalledWith("No nonExistentKey data found");
    });

    it("should return true when the item is found in storage", () => {
      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue("someValue"),
        },
        writable: true,
      });

      const result = checkLocalStorage("existingKey");
      expect(result).toBe(true);
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe("checkAge", () => {
    it("should return false if the data is less than one hour old", () => {
      const mockCurrentDate = "2024-11-17-15-30";
      const mockDataDate = "2024-11-17-14-30";

      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue(mockDataDate + "|someData"),
        },
        writable: true,
      });

      jest.spyOn(app, 'getCurrentDate').mockReturnValue(mockCurrentDate);

      const result = checkAge("hourly", "someKey");
      expect(result).toBe(false);
      expect(console.log).toHaveBeenCalledWith("Data is less than one hour old someKey");
    });

    it("should return true if the data is more than one hour old (time check)", () => {
      const mockCurrentDate = "2024-11-17-15-30";
      const mockDataDate = "2024-11-17-14-00";

      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue(mockDataDate + "|someData"),
        },
        writable: true,
      });

      jest.spyOn(app, 'getCurrentDate').mockReturnValue(mockCurrentDate);

      const result = checkAge("hourly", "someKey");
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith("Data more than one hour old -- time check someKey");
    });

    it("should return true if the data is more than one day old (date check)", () => {
      const mockCurrentDate = "2024-11-18-15-30";
      const mockDataDate = "2024-11-17-15-30";

      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue(mockDataDate + "|someData"),
        },
        writable: true,
      });

      jest.spyOn(app, 'getCurrentDate').mockReturnValue(mockCurrentDate);

      const result = checkAge("daily", "someKey");
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith("Data more than one day old - date check someKey");
    });

    it("should return true if the data is more than one month old (month check)", () => {
      const mockCurrentDate = "2024-12-01-15-30";
      const mockDataDate = "2024-11-01-15-30";

      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue(mockDataDate + "|someData"),
        },
        writable: true,
      });

      jest.spyOn(app, 'getCurrentDate').mockReturnValue(mockCurrentDate);

      const result = checkAge("monthly", "someKey");
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith("Data more than one month old - date check someKey");
    });
  });

  describe("getCurrentDate", () => {
    it("should return the correct date format", () => {
      const mockDate = new Date(2024, 10, 17, 15, 30);
      jest.spyOn(global, 'Date').mockImplementationOnce(() => mockDate);

      const result = getCurrentDate(true);
      expect(result).toBe("2024-11-17-15-30");
    });

    it("should return the correct date without time", () => {
      const mockDate = new Date(2024, 10, 17, 15, 30);
      jest.spyOn(global, 'Date').mockImplementationOnce(() => mockDate);

      const result = getCurrentDate(false);
      expect(result).toBe("2024-11-17");
    });
  });

  describe("openLocationFrame", () => {
    it("should open the location iframe and update DOM elements", () => {
      const mockLightBox = { innerHTML: "", style: { display: "" }, appendChild: jest.fn() };
      document.getElementById.mockReturnValue(mockLightBox);

      openLocationFrame();

      expect(document.createElement).toHaveBeenCalledWith("iframe");
      const iframe = document.createElement.mock.results[0].value;
      expect(iframe.src).toBe("LocationSelect.html");
      expect(mockLightBox.appendChild).toHaveBeenCalledWith(iframe);
      expect(mockLightBox.style.display).toBe("block");
    });
  });
});