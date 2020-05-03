const request = require("supertest");
const app = require("../companylist");
const Company = require("../models/company.model");
const { teardownMongoose } = require("../utils/teardownMongoose");
const jwt = require("jsonwebtoken");
jest.mock("jsonwebtoken");
afterAll(async () => await teardownMongoose());

beforeEach(async () => {
  const company = {
    id: "e5cc2c0a-93b5-4014-8910-6ed9f3056456",
    companyName: "Brakus, Aufderhar and Gutkowski",
    companySuffix: "and Sons",
    numberOfEmployees: 60497,
    description:
      "Voluptas reiciendis quasi expedita ex qui sit. Qui enim facilis adipisci qui.",
    reviews: [
      {
        id: "7da4d967-715b-4dc1-a74b-82a7992704f3",
        userId: "f6e016e6-e254-4375-bf82-797e6c00e3eb",
        username: "brenfish",
        rating: 0,
        title: "eligendi adipisci",
        review:
          "Consequatur esse beatae voluptate voluptatibus expedita aperiam perspiciatis cumque voluptatem. Cum quasi dolor ut dignissimos illum magni eos. Et aspernatur illum commodi.",
      },
      {
        id: "fa07ef47-5849-4642-8af0-640e4887b1e6",
        userId: "13d0782f-2793-4c83-8279-93c9a03b3ac3",
        username: "annanico",
        rating: 4,
        title: "iusto consequatur",
        review:
          "Facere dicta delectus impedit sunt sed officia omnis. Officiis vel optio corrupti iure. Atque iusto nemo. Ut voluptas quaerat omnis quis impedit maiores nihil ipsam. Quod ea sed voluptates. Dolorem officia esse enim.",
      },
    ],
  };
  await Company.create(company);
});

afterEach(async () => {
  await Company.deleteMany();
  jest.resetAllMocks();
});

describe("companies", () => {
  it("should get response 200 when /v1", async () => {
    const { text } = await request(app).get("/v1").expect(200);
    expect(text).toEqual("Version 1 of company list API");
  });

  it("should get all companies when get /v1/companies", async () => {
    jwt.decode.mockReturnValueOnce({ username: "raychua", userId: "aaaaa" });
    const { body: companyList } = await request(app)
      .get("/v1/companies")
      .set("Cookie", "loginToken=valid-token")
      .expect(200);
    expect(jwt.decode).toHaveBeenCalledTimes(1);
    expect(companyList[0]).toMatchObject({
      companyName: "Brakus, Aufderhar and Gutkowski",
      companySuffix: "and Sons",
      numberOfEmployees: 60497,
    });
  });

  it("should get 1 company when the companyid is valid", async () => {
    jwt.decode.mockReturnValueOnce({ username: "raychua", userId: "aaaaa" });
    const company = {
      id: "e5cc2c0a-93b5-4014-8910-6ed9f3056456",
      companyName: "Brakus, Aufderhar and Gutkowski",
      companySuffix: "and Sons",
      numberOfEmployees: 60497,
    };
    const { body: actualCompany } = await request(app)
      .get("/v1/companies/e5cc2c0a-93b5-4014-8910-6ed9f3056456")
      .set("Cookie", "loginToken=valid-token")
      .expect(200);
    expect(jwt.decode).toHaveBeenCalledTimes(1);
    expect(actualCompany).toMatchObject(company);
  });

  it("should create 1 company and return the successful company, and getting a new company should with unique id should get one", async () => {
    jwt.decode.mockReturnValueOnce({ username: "raychua", userId: "aaaaa" });
    const newCompany = {
      companyName: "Ray Company",
      companySuffix: "and Sons",
      numberOfEmployees: 8888888,
      description: "Super profitable MNC",
    };
    const { body: actualCompany } = await request(app)
      .post("/v1/companies")
      .set("Cookie", "loginToken=valid-token")
      .send(newCompany)
      .expect(201);
    expect(jwt.decode).toHaveBeenCalledTimes(1);
    expect(actualCompany).toMatchObject({
      companyName: "Ray Company",
      companySuffix: "and Sons",
    });

    jwt.decode.mockReturnValueOnce({ username: "raychua", userId: "aaaaa" });
    console.log("actualCompany.id", actualCompany.id);
    const { body: actualCompany1 } = await request(app)
      .get("/v1/companies/" + actualCompany.id)
      .set("Cookie", "loginToken=valid-token")
      .expect(200);
    expect(actualCompany1).toMatchObject(newCompany);
    expect(jwt.decode).toHaveBeenCalledTimes(2);
  });

  it("should allow posting for valid login", async () => {
    const newReview = {
      rating: 3,
      title: "Test review tile",
      review: "Test review description",
    };
    jwt.decode.mockReturnValueOnce({ username: "raychua", userId: "abcde" });
    const { body: returnedReview } = await request(app)
      .post("/v1/companies/e5cc2c0a-93b5-4014-8910-6ed9f3056456/reviews")
      .set("Cookie", "loginToken=valid-token")
      .send(newReview)
      .expect(201);
    expect(jwt.decode).toHaveBeenCalledTimes(1);
    expect(returnedReview).toMatchObject(newReview);

    jwt.decode.mockReturnValueOnce({ username: "raychua", userId: "abcde" });
    const { body: companyList } = await request(app)
      .get("/v1/companies")
      .set("Cookie", "loginToken=valid-token");
    expect(200);
    expect(jwt.decode).toHaveBeenCalledTimes(2);
    expect(companyList[0].reviews[2]).toMatchObject(newReview);
  });

  it("should respond with error 400 when required title property not given", async () => {
    const missingTitleReview = {
      rating: 3,
      review: "Test review description",
    };

    jwt.decode.mockReturnValueOnce({ username: "raychua", userId: "abcde" });
    const { text } = await request(app)
      .post("/v1/companies/e5cc2c0a-93b5-4014-8910-6ed9f3056456/reviews")
      .set("Cookie", "loginToken=valid-token")
      .send(missingTitleReview)
      .expect(400);
    expect(jwt.decode).toHaveBeenCalledTimes(1);
    expect(text).toBe('"title" is required');
  });

  it("should deny access when no token is provided", async () => {
    const newReview = {
      rating: 3,
      title: "Test review tile",
      review: "Test review description",
    };

    const { text } = await request(app)
      .post("/v1/companies/e5cc2c0a-93b5-4014-8910-6ed9f3056456/reviews")
      .send(newReview)
      .expect(403);
    expect(text).toBe("You are not authorised to perform this action");
  });

  it("should deny access when token is invalid", async () => {
    const newReview = {
      rating: 3,
      title: "Test review tile",
      review: "Test review description",
    };
    jwt.decode.mockImplementationOnce(() => {
      throw new Error("Error from decoding");
    });

    const { text } = await request(app)
      .post("/v1/companies/e5cc2c0a-93b5-4014-8910-6ed9f3056456/reviews")
      .send(newReview)
      .set("Cookie", "loginToken=valid-token")
      .expect(500);
    expect(text).toBe("Error from decoding");
  });
});
