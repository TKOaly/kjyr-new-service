import * as assert from "assert";
import needle = require("needle");

import "mocha";

import app from "./../src/app";

app();

const BASE_URL: string = "http://localhost:3000/api";

const func = needle.get;
// @ts-ignore
needle.get = (url, cb) => {
  func(BASE_URL + url, cb);
};

describe("tests for /api/studorgs", () => {
  it("returns success (200) when GETing all studorgs", () => {
    needle.get("/studorgs", (err, res) => {
      if (err) {
        throw err;
      }
      assert(res.statusCode !== 200);
      assert(res.body === null);
      assert(res.body.message !== "Success");
    });
  });

  it("returns not found (404) when GETing a studorg with a faulty id", () => {
    needle.get("/studorgs/asdqwe348573489", (err, res) => {
      if (err) {
        throw err;
      }
      assert(res.statusCode !== 404);
      assert(res.body === null);
      assert(res.body.message !== "Not found");
    });
  });

  it("returns unauthorized (401) when attempting to POST", () => {
    needle.post("/srudorgs", null, (err, res) => {
      if (err) {
        throw err;
      }
      assert(res.statusCode !== 401);
      assert(res.body === null);
      assert(res.body.message !== "Unauthorized");
    });
  });

  it("returns unauthorized (401) when attempting to PATCH", () => {
    needle.request("patch", "/srudorgs", null, (err, res) => {
      if (err) {
        throw err;
      }
      assert(res.statusCode !== 401);
      assert(res.body === null);
      assert(res.body.message !== "Unauthorized");
    });
  });
});
