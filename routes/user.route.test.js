const request = require("supertest");
const app = require("../companylist");
const User = require("../models/user.model");
const { teardownMongoose } = require("../utils/teardownMongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("bcrypt");

afterAll(async () => await teardownMongoose());

beforeEach(async () => {
  const user = {
    username: "raychua",
    firstName: "Ray",
    lastName: "Chua",
    userId: "aaaaa",
    password: "aaaaaa",
    email: "abc@gmail.com",
  };
  await User.create(user);
});

afterEach(async () => {
  await User.deleteMany();
  jest.resetAllMocks();
});

describe("user.route", () => {
  it("should login successfully with a valid password", async () => {
    jwt.sign.mockReturnValueOnce({ username: "raychua" });
    bcrypt.compare.mockReturnValueOnce(true);
    const { text } = await request(app)
      .post("/v1/user/login")
      .send({ username: "raychua", password: "aaaaaa" })
      .expect(200);
    expect(jwt.sign).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(text).toBe("You have logged in successfully");
  });

  it("should  register a new user", async () => {
    const newUser = {
      username: "humburn",
      firstName: "Humberto",
      lastName: "Bruen",
      email: "Timothy_VonRueden62@hotmail.com",
      password: "1233456",
    };
    const { body: newUser1 } = await request(app)
      .post("/v1/user/registerUser")
      .send(newUser)
      .expect(201);
    expect(newUser1).toMatchObject({
      username: "humburn",
      firstName: "Humberto",
    });
  });

  it("should get user information when logined", async () => {
    jwt.decode.mockReturnValueOnce({ username: "raychua", userId: "aaaaa" });
    const { body: actualUser } = await request(app)
      .get("/v1/user")
      .set("Cookie", "loginToken=valid-token")
      .expect(200);
    expect(jwt.decode).toHaveBeenCalledTimes(1);
    expect(actualUser).toMatchObject({
      username: "raychua",
      firstName: "Ray",
      lastName: "Chua",
      userId: "aaaaa",
      email: "abc@gmail.com",
    });
  });
});
